import { Body, Controller, Get, HttpException, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { SessionProfile } from '@apptit/contracts';
import { AuthFailure, cookieValue, CSRF_COOKIE, csrfToken, identityCall, localCookie, newSecret, readConfig, SESSION_COOKIE, validCsrf } from '@apptit/runtime';
const config = () => readConfig('gateway-api');
@Controller('session')
export class SessionController {
  private secret(req: Request) { return cookieValue(req.headers.cookie, SESSION_COOKIE); }
  private guard(req: Request) {
    const settings = config();
    if (req.headers.origin !== settings.webOrigin || !req.is('application/json') || req.headers['sec-fetch-site'] === 'cross-site' ||
      !validCsrf(cookieValue(req.headers.cookie, CSRF_COOKIE), this.secret(req), req.headers['x-csrf-token'], settings.csrfKey)) throw new AuthFailure('FORBIDDEN', 403);
  }
  private async safe<T>(action: () => Promise<T>): Promise<T> {
    try { return await action(); }
    catch (error) { if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status); throw new HttpException({ code: 'DEPENDENCY_UNAVAILABLE' }, 503); }
  }
  @Get('csrf') csrf(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const settings = config();
    if ((req.headers.origin && req.headers.origin !== settings.webOrigin) || req.headers['sec-fetch-site'] === 'cross-site') throw new HttpException({ code: 'FORBIDDEN' }, 403);
    const nonce = cookieValue(req.headers.cookie, CSRF_COOKIE) ?? newSecret();
    res.append('Set-Cookie', localCookie(CSRF_COOKIE, nonce, settings.sessionAbsoluteSeconds));
    return { csrfToken: csrfToken(nonce, this.secret(req), settings.csrfKey) };
  }
  @Get('current') current(@Req() req: Request) { return this.safe(() => identityCall<SessionProfile>(config(), 'current', this.secret(req))); }
  @Post('login') login(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() credentials: unknown) {
    return this.safe(async () => {
      this.guard(req);
      const settings = config();
      const result = await identityCall<{ sessionSecret: string; profile: SessionProfile }>(settings, 'login', this.secret(req), { credentials, source: req.socket.remoteAddress ?? 'unknown' });
      res.append('Set-Cookie', localCookie(SESSION_COOKIE, result.sessionSecret, settings.sessionAbsoluteSeconds));
      res.append('Set-Cookie', localCookie(CSRF_COOKIE, '', 0));
      return result.profile;
    });
  }
  @Post('logout') logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.safe(async () => {
      this.guard(req);
      const result = await identityCall<{ success: true }>(config(), 'logout', this.secret(req));
      res.append('Set-Cookie', localCookie(SESSION_COOKIE, '', 0));
      res.append('Set-Cookie', localCookie(CSRF_COOKIE, '', 0));
      return result;
    });
  }
  @Post('site') select(@Req() req: Request, @Body() input: unknown) {
    return this.safe(async () => { this.guard(req); return identityCall<SessionProfile>(config(), 'select', this.secret(req), input); });
  }
}
