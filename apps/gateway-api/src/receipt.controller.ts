import { randomUUID } from 'node:crypto';
import { Body, Controller, HttpException, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthFailure, cookieValue, CSRF_COOKIE, identityCall, readConfig, SESSION_COOKIE, validCsrf } from '@apptit/runtime';
@Controller('receipts')
export class ReceiptController {
  private async call(req: Request, input: unknown, action: 'save' | 'read' | 'list' | 'locations' | 'operation') {
    const config = readConfig('gateway-api'); const secret = cookieValue(req.headers.cookie, SESSION_COOKIE);
    try {
      if (req.headers.origin !== config.webOrigin || !req.is('application/json') || req.headers['sec-fetch-site'] === 'cross-site' || !validCsrf(cookieValue(req.headers.cookie, CSRF_COOKIE), secret, req.headers['x-csrf-token'], config.csrfKey)) throw new AuthFailure('FORBIDDEN', 403);
      const value = input as { scope?: unknown; command?: { scope?: unknown } }; const correlationId = randomUUID();
      await identityCall(config, 'authorize', secret, { scope: action === 'save' ? value?.command?.scope : value?.scope, capability: action === 'save' ? 'receipt.draft.write' : 'receipt.draft.read' }, correlationId);
      const result = await fetch(`${config.kitchenOrigin}/internal/v1/receipt-drafts/${action}`, { method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', 'x-internal-token': config.kitchenToken!, 'x-correlation-id': correlationId, ...(secret ? { 'x-session-secret': secret } : {}) }, body: JSON.stringify(input), signal: AbortSignal.timeout(config.internalTimeoutMs * 3 + 6000) });
      if (!result.ok) {
        const failure = await result.json() as { code?: string };
        const code = failure.code && ['OBSERVATION_LINK_CONFLICT', 'EVIDENCE_LINK_CONFLICT', 'INVALID_INPUT', 'INVALID_DESTINATION', 'UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'FORBIDDEN', 'NOT_FOUND', 'VERSION_CONFLICT', 'IDEMPOTENCY_MISMATCH'].includes(failure.code) ? failure.code : 'OUTCOME_UNCERTAIN';
        throw new HttpException({ code }, code === 'OUTCOME_UNCERTAIN' ? 503 : result.status);
      }
      return await result.json() as unknown;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
      throw new HttpException({ code: 'OUTCOME_UNCERTAIN' }, 503);
    }
  }
  @Post('save') save(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'save'); }
  @Post('operation') operation(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'operation'); }
  @Post('read') read(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'read'); }
  @Post('list') list(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'list'); }
  @Post('locations') locations(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'locations'); }
}
