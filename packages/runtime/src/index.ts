import { timingSafeEqual } from 'node:crypto';
import type { ServiceName } from '@apptit/contracts';

export type RuntimeName = ServiceName | 'web';
export class ConfigurationError extends Error {
  constructor(key: string) { super(`Invalid or missing configuration: ${key}`); }
}
export interface RuntimeConfig {
  service: RuntimeName;
  host: '127.0.0.1';
  port: number;
  mode: 'synthetic';
  databaseUrl?: string;
  internalToken?: string;
  identityToken?: string;
  kitchenToken?: string;
  identityOrigin: string;
  kitchenOrigin: string;
  gatewayOrigin: string;
  internalTimeoutMs: number;
  webOrigin: string;
  sessionIdleSeconds: number;
  sessionAbsoluteSeconds: number;
  sessionHashKey: string;
  csrfKey: string;
  loginLimit: number;
  loginWindowSeconds: number;
  identityKitchenToken?: string;
  offMode: 'disabled' | 'fixture' | 'live';
  offUserAgent?: string;
  offTimeoutMs: number;
  offCacheSeconds: number;
}
const portKeys = { web: 'WEB_PORT', 'gateway-api': 'GATEWAY_PORT', identity: 'IDENTITY_PORT', kitchen: 'KITCHEN_PORT' } as const;
function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (!value || value.includes('__GENERATE') || value.includes('REPLACE_ME')) throw new ConfigurationError(key);
  return value;
}
function positive(env: NodeJS.ProcessEnv, key: string, max: number): number {
  const value = required(env, key);
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max) throw new ConfigurationError(key);
  return Number(value);
}
function token(env: NodeJS.ProcessEnv, key: string): string {
  const value = required(env, key);
  if (!/^[a-f0-9]{64}$/.test(value)) throw new ConfigurationError(key);
  return value;
}
export function readConfig(service: RuntimeName, env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  for (const key of ['APP_MODE', 'SEED_MODE']) {
    if (required(env, key) !== 'synthetic') throw new ConfigurationError(key);
  }
  if (required(env, 'BIND_HOST') !== '127.0.0.1') throw new ConfigurationError('BIND_HOST');
  const ports = Object.fromEntries(Object.entries(portKeys).map(([name, key]) => [name, positive(env, key, 65535)]));
  if (new Set(Object.values(ports)).size !== 4) throw new ConfigurationError('SERVICE_PORTS');
  const idle = positive(env, 'SESSION_IDLE_SECONDS', 86400);
  const absolute = positive(env, 'SESSION_ABSOLUTE_SECONDS', 604800);
  if (idle > absolute) throw new ConfigurationError('SESSION_IDLE_SECONDS');
  token(env, 'SESSION_COOKIE_SECRET');
  token(env, 'CSRF_SECRET');
  if (required(env, 'ALLOW_INSECURE_LOCAL_COOKIES') !== 'true') throw new ConfigurationError('ALLOW_INSECURE_LOCAL_COOKIES');
  const origin = required(env, 'WEB_ORIGIN');
  if (origin !== `http://127.0.0.1:${ports['web']}`) throw new ConfigurationError('WEB_ORIGIN');
  const offMode = required(env, 'OFF_MODE');
  if (!['disabled', 'fixture', 'live'].includes(offMode)) throw new ConfigurationError('OFF_MODE');
  let offUserAgent: string | undefined;
  if (offMode === 'live') {
    offUserAgent = required(env, 'OFF_USER_AGENT');
    if (!/^Apptit\/[0-9.]+ \(https:\/\/github\.com\/rodrigonpaiva\/apptit\)$/.test(offUserAgent)) throw new ConfigurationError('OFF_USER_AGENT');
  }
  const config: RuntimeConfig = {
    offMode: offMode as RuntimeConfig['offMode'], offUserAgent, offTimeoutMs: positive(env, 'OFF_TIMEOUT_MS', 10000), offCacheSeconds: positive(env, 'OFF_CACHE_SECONDS', 86400),
    service, host: '127.0.0.1', port: ports[service]!, mode: 'synthetic',
    webOrigin: origin, sessionIdleSeconds: idle, sessionAbsoluteSeconds: absolute,
    sessionHashKey: token(env, 'SESSION_COOKIE_SECRET'), csrfKey: token(env, 'CSRF_SECRET'),
    loginLimit: positive(env, 'AUTH_LOGIN_LIMIT', 100), loginWindowSeconds: positive(env, 'AUTH_LOGIN_WINDOW_SECONDS', 3600),
    internalTimeoutMs: positive(env, 'INTERNAL_TIMEOUT_MS', 30000),
    identityOrigin: `http://127.0.0.1:${ports['identity']}`,
    kitchenOrigin: `http://127.0.0.1:${ports['kitchen']}`,
    gatewayOrigin: `http://127.0.0.1:${ports['gateway-api']}`,
  };
  if (service === 'identity' || service === 'kitchen') {
    const key = `${service.toUpperCase()}_DATABASE_URL`;
    let url: URL;
    try { url = new URL(required(env, key)); } catch { throw new ConfigurationError(key); }
    if (url.protocol !== 'postgresql:' || !['127.0.0.1', 'localhost'].includes(url.hostname) ||
      url.username !== `apptit_${service}` || !url.password || url.pathname !== `/apptit_${service}_synthetic` || url.search || url.hash) {
      throw new ConfigurationError(key);
    }
    config.databaseUrl = url.toString();
    config.internalToken = token(env, `${service.toUpperCase()}_INTERNAL_TOKEN`);
  }
  if (service === 'identity' || service === 'kitchen') config.identityKitchenToken = token(env, 'IDENTITY_KITCHEN_TOKEN');
  if (service === 'gateway-api') {
    config.identityToken = token(env, 'IDENTITY_INTERNAL_TOKEN');
    config.kitchenToken = token(env, 'KITCHEN_INTERNAL_TOKEN');
  }
  for (const key of ['AI_MODE', 'OCR_MODE', 'OFFLINE_MODE', 'EVIDENCE_MODE']) {
    if (required(env, key) !== 'disabled') throw new ConfigurationError(key);
  }
  return Object.freeze(config);
}
export function matchesSecret(received: unknown, expected: string): boolean {
  if (typeof received !== 'string') return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
/** Never serialize arbitrary errors/configuration: DB drivers may include connection secrets. */
export function reportStartupFailure(service: string, error: unknown): void {
  console.error(JSON.stringify({ service, code: error instanceof ConfigurationError ? 'INVALID_CONFIGURATION' : 'STARTUP_FAILED',
    message: error instanceof ConfigurationError ? error.message : 'Startup failed; verify local configuration and dependencies.' }));
}

export * from './access/security.js';
export * from './access/identity-client.js';
