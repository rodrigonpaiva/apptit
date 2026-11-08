import { randomUUID } from 'node:crypto';
import { Body, Controller, HttpException, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthFailure, cookieValue, CSRF_COOKIE, identityCall, readConfig, SESSION_COOKIE, validCsrf } from '@apptit/runtime';
const allowed = ['INVALID_INPUT', 'FORBIDDEN', 'UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'NOT_FOUND', 'IDEMPOTENCY_MISMATCH', 'VERSION_CONFLICT', 'RECEIPT_VERSION_CONFLICT', 'PROFILE_VERSION_CONFLICT', 'INVALID_OBSERVATION_LINK', 'OBSERVATION_LIMIT', 'CAPABILITY_DISABLED'];
@Controller('observations')
export class ObservationController {
  private async call(req: Request, input: unknown, action: 'save' | 'list' | 'history') {
    const config = readConfig('gateway-api'); const secret = cookieValue(req.headers.cookie, SESSION_COOKIE);
    try {
      if (req.headers.origin !== config.webOrigin || !req.is('application/json') || req.headers['sec-fetch-site'] === 'cross-site' || !validCsrf(cookieValue(req.headers.cookie, CSRF_COOKIE), secret, req.headers['x-csrf-token'], config.csrfKey)) throw new AuthFailure('FORBIDDEN', 403);
      const correlationId = randomUUID(); await identityCall(config, 'authorize', secret, { scope: (input as { scope?: unknown })?.scope, capability: action === 'save' ? 'observation.capture' : 'observation.read' }, correlationId);
      const response = await fetch(`${config.kitchenOrigin}/internal/v1/observations/${action}`, { method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', 'x-internal-token': config.kitchenToken!, 'x-correlation-id': correlationId, ...(secret ? { 'x-session-secret': secret } : {}) }, body: JSON.stringify(input), signal: AbortSignal.timeout(config.internalTimeoutMs * 3 + 6000) });
      if (!response.ok) { const failure = await response.json() as { code?: string }; const code = allowed.includes(failure.code ?? '') ? failure.code! : 'OUTCOME_UNCERTAIN'; throw new HttpException({ code }, code === 'OUTCOME_UNCERTAIN' ? 503 : response.status); }
      return await response.json() as unknown;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
      throw new HttpException({ code: 'OUTCOME_UNCERTAIN' }, 503);
    }
  }
  @Post('save') save(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'save'); }
  @Post('list') list(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'list'); }
  @Post('history') history(@Req() req: Request, @Body() input: unknown) { return this.call(req, input, 'history'); }
}
