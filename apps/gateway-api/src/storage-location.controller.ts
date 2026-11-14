import { randomUUID } from 'node:crypto';
import { Body, Controller, HttpException, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthFailure, cookieValue, CSRF_COOKIE, identityCall, readConfig, SESSION_COOKIE, validCsrf } from '@apptit/runtime';
@Controller('storage-locations')
export class StorageLocationController {
  private async call(req: Request, input: unknown, action: 'list' | 'save') {
    const config = readConfig('gateway-api'), secret = cookieValue(req.headers.cookie, SESSION_COOKIE);
    try {
      if (req.headers.origin !== config.webOrigin || !req.is('application/json') || req.headers['sec-fetch-site'] === 'cross-site' || !validCsrf(cookieValue(req.headers.cookie, CSRF_COOKIE), secret, req.headers['x-csrf-token'], config.csrfKey)) throw new AuthFailure('FORBIDDEN', 403);
      const correlationId = randomUUID();
      await identityCall(config, 'authorize', secret, { scope: (input as { scope?: unknown })?.scope, capability: 'storage.location.manage' }, correlationId);
      const result = await fetch(`${config.kitchenOrigin}/internal/v1/storage-locations/${action}`, { method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', 'x-internal-token': config.kitchenToken!, 'x-correlation-id': correlationId, ...(secret ? { 'x-session-secret': secret } : {}) }, body: JSON.stringify(input), signal: AbortSignal.timeout(config.internalTimeoutMs * 3 + 6000) });
      if (!result.ok) { const failure = await result.json() as { code?: string }; const code = failure.code && ['INVALID_INPUT','NOT_FOUND','FORBIDDEN','VERSION_CONFLICT','LOCATION_LIMIT','UNAUTHENTICATED','SESSION_EXPIRED','SESSION_REVOKED'].includes(failure.code) ? failure.code : 'DEPENDENCY_UNAVAILABLE'; throw new HttpException({ code }, code === 'DEPENDENCY_UNAVAILABLE' ? 503 : result.status); }
      return await result.json() as unknown;
    } catch (error) { if (error instanceof HttpException) throw error; if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status); throw new HttpException({ code: 'DEPENDENCY_UNAVAILABLE' }, 503); }
  }
  @Post('list') list(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'list'); }
  @Post('save') save(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'save'); }
}
