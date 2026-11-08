import { randomUUID } from 'node:crypto';
import { Body, Controller, HttpException, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthFailure, cookieValue, CSRF_COOKIE, identityCall, readConfig, SESSION_COOKIE, validCsrf } from '@apptit/runtime';
const allowed = ['INVALID_INPUT', 'FORBIDDEN', 'UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'NOT_FOUND', 'IDEMPOTENCY_MISMATCH', 'INVALID_EVIDENCE_LINK', 'EVIDENCE_LIMIT', 'EVIDENCE_NOT_AVAILABLE', 'UPLOAD_REJECTED', 'CAPABILITY_DISABLED'];
@Controller('evidence')
export class EvidenceController {
  private async call(req: Request, input: unknown, action: 'begin' | 'list' | 'review' | 'read' | 'upload', response?: Response) {
    const config = readConfig('gateway-api'); const secret = cookieValue(req.headers.cookie, SESSION_COOKIE);
    try {
      const binary = action === 'upload';
      if (req.headers.origin !== config.webOrigin || (!binary && !req.is('application/json')) || (binary && !['image/jpeg', 'image/png'].includes(req.headers['content-type'] ?? '')) || req.headers['sec-fetch-site'] === 'cross-site' || !validCsrf(cookieValue(req.headers.cookie, CSRF_COOKIE), secret, req.headers['x-csrf-token'], config.csrfKey)) throw new AuthFailure('FORBIDDEN', 403);
      if (binary && config.evidenceMode !== 'fixture') throw new HttpException({ code: 'CAPABILITY_DISABLED' }, 503);
      const requested = binary ? { tenantId: req.headers['x-tenant-id'], siteId: req.headers['x-site-id'] } : (input as { scope?: unknown })?.scope;
      const correlationId = randomUUID(); await identityCall(config, 'authorize', secret, { scope: requested, capability: ['begin', 'upload', 'review'].includes(action) ? 'evidence.write' : 'evidence.read' }, correlationId);
      let body: string | Buffer = JSON.stringify(input);
      if (binary) {
        const length = Number(req.headers['content-length']);
        if (!Number.isSafeInteger(length) || length < 1 || length > config.evidenceMaxBytes) throw new HttpException({ code: 'INVALID_INPUT' }, 413);
        const parts: Buffer[] = []; let size = 0;
        for await (const chunk of req) { const part = Buffer.from(chunk); size += part.length; if (size > config.evidenceMaxBytes) throw new HttpException({ code: 'INVALID_INPUT' }, 413); parts.push(part); }
        body = Buffer.concat(parts);
      }
      const result = await fetch(`${config.kitchenOrigin}/internal/v1/evidence/${action}`, { method: 'POST', redirect: 'error', headers: { 'content-type': binary ? String(req.headers['content-type']) : 'application/json', 'x-internal-token': config.kitchenToken!, 'x-correlation-id': correlationId, ...(secret ? { 'x-session-secret': secret } : {}), ...(binary ? { 'x-tenant-id': String(req.headers['x-tenant-id']), 'x-site-id': String(req.headers['x-site-id']), 'x-evidence-id': String(req.headers['x-evidence-id']) } : {}) }, body: typeof body === 'string' ? body : new Uint8Array(body), signal: AbortSignal.timeout(config.internalTimeoutMs * 3 + 12000) });
      if (!result.ok) { const failure = await result.json() as { code?: string }; const code = allowed.includes(failure.code ?? '') ? failure.code! : 'OUTCOME_UNCERTAIN'; throw new HttpException({ code }, code === 'OUTCOME_UNCERTAIN' ? 503 : result.status); }
      if (action === 'read' && response) {
        const mediaType = result.headers.get('content-type')?.split(';')[0]; if (!mediaType || !['image/png', 'image/jpeg'].includes(mediaType)) throw new Error('Invalid media type');
        const bytes = Buffer.from(await result.arrayBuffer()); if (bytes.length > config.evidenceMaxBytes) throw new Error('Invalid response size');
        response.set({ 'Content-Type': mediaType, 'Content-Disposition': 'inline', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }); response.send(bytes); return;
      }
      return await result.json() as unknown;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
      throw new HttpException({ code: 'OUTCOME_UNCERTAIN' }, 503);
    }
  }
  @Post('begin') begin(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'begin'); }
  @Post('list') list(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'list'); }
  @Post('review') review(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'review'); }
  @Post('upload') upload(@Req() req: Request) { return this.call(req, undefined, 'upload'); }
  @Post('read') read(@Req() req: Request, @Body() input: unknown, @Res() response: Response) { return this.call(req, input, 'read', response); }
}
