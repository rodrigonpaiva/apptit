import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const target = new URL('.env', root);
const existing = existsSync(target) ? readFileSync(target, 'utf8') : '';
const keys = new Set(existing.split('\n').filter(line => !line.startsWith('#')).map(line => line.split('=')[0]));
const values = new Map();
const example = readFileSync(new URL('.env.example', root), 'utf8');
const prior = Object.fromEntries(existing.split('\n').filter(line => line && !line.startsWith('#') && line.includes('=')).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
for (const line of example.split('\n')) {
  const match = /^([^=#]+)=(__GENERATE_[A-Z_]+__)$/.exec(line);
  if (match && prior[match[1]]) values.set(match[2], prior[match[1]]);
}
const additions = example.split('\n').filter(line => !line.startsWith('#') && line.includes('=') && !keys.has(line.split('=')[0])).join('\n').replace(/__GENERATE_[A-Z_]+__/g, key => {
  if (!values.has(key)) values.set(key, randomBytes(32).toString('hex'));
  return values.get(key);
});
const content = existing ? existing + (additions ? `\n# Newly required local settings\n${additions}\n` : '') : example.replace(/__GENERATE_[A-Z_]+__/g, key => values.get(key));
writeFileSync(target, content, { mode: 0o600 });
chmodSync(target, 0o600);
const env = Object.fromEntries(content.split('\n').filter(line => line && !line.startsWith('#')).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
mkdirSync(new URL('.local/', root), { recursive: true, mode: 0o700 });
const accounts = [ ['chef.a@apptit.test', 'FIXTURE_CHEF_A_PASSWORD'], ['stock.a@apptit.test', 'FIXTURE_STOREKEEPER_A_PASSWORD'], ['cook.a@apptit.test', 'FIXTURE_COOK_A_PASSWORD'], ['chef.b@apptit.test', 'FIXTURE_CHEF_B_PASSWORD'], ['chef.multi@apptit.test', 'FIXTURE_MULTI_PASSWORD'] ];
const file = new URL('.local/fixture-credentials.json', root);
writeFileSync(file, JSON.stringify(accounts.map(([login, key]) => ({ login, password: env[key] })), null, 2) + '\n', { mode: 0o600 });
chmodSync(file, 0o600);
console.log('Local configuration completed; existing values preserved. Fixture credentials: .local/fixture-credentials.json (private, ignored; values redacted).');
