import { loadEnvFile } from 'node:process';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));
export function loadLocalEnv() {
  loadEnvFile(new URL('../.env', import.meta.url));
  if (process.env.APP_MODE !== 'synthetic' || process.env.SEED_MODE !== 'synthetic') throw new Error('Only explicit synthetic local mode is supported.');
  process.env.NX_DAEMON = 'false';
  process.env.NX_NO_CLOUD = 'true';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
}
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${command} failed (${code ?? signal}).`)));
  });
}
export function safeFailure() {
  console.error('Local command failed. Check the named configuration and dependency status; secrets are redacted.');
  process.exitCode = 1;
}
export function serviceEnv(service) {
  const env = { ...process.env };
  for (const key of ['POSTGRES_ADMIN_PASSWORD', 'IDENTITY_DB_PASSWORD', 'KITCHEN_DB_PASSWORD', 'IDENTITY_DATABASE_URL', 'KITCHEN_DATABASE_URL', 'IDENTITY_INTERNAL_TOKEN', 'KITCHEN_INTERNAL_TOKEN']) delete env[key];
  if (service === 'identity' || service === 'kitchen') {
    env[`${service.toUpperCase()}_DATABASE_URL`] = process.env[`${service.toUpperCase()}_DATABASE_URL`];
    env[`${service.toUpperCase()}_INTERNAL_TOKEN`] = process.env[`${service.toUpperCase()}_INTERNAL_TOKEN`];
  }
  if (service === 'gateway-api') {
    env.IDENTITY_INTERNAL_TOKEN = process.env.IDENTITY_INTERNAL_TOKEN;
    env.KITCHEN_INTERNAL_TOKEN = process.env.KITCHEN_INTERNAL_TOKEN;
  }
  return env;
}
