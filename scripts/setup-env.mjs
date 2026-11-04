import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const target = new URL('.env', root);
if (existsSync(target)) {
  console.log('.env already exists; preserved.');
} else {
  const values = new Map();
  const content = readFileSync(new URL('.env.example', root), 'utf8').replace(/__GENERATE_[A-Z_]+__/g, key => {
    if (!values.has(key)) values.set(key, randomBytes(32).toString('hex'));
    return values.get(key);
  });
  writeFileSync(target, content, { mode: 0o600, flag: 'wx' });
  console.log(`Created private synthetic configuration: ${fileURLToPath(target).split('/').at(-1)} (values redacted).`);
}
