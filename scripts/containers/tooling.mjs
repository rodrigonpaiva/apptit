import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function run(command, args, { cwd, env = process.env, input, secrets = [] } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] }); let output = '';
    child.stdout.on('data', value => { output += value; }); child.stderr.on('data', value => { output += value; });
    child.on('error', reject); child.on('exit', code => { for (const secret of secrets) if (secret) output = output.replaceAll(secret, '[redacted]'); if (code === 0) resolve(output); else { const error = new Error(`${command} failed (${code}): ${output.slice(-5000)}`); error.output = output; reject(error); } });
    child.stdin.end(input);
  });
}
export async function saveReport(filename, value) { await fs.mkdir(path.dirname(filename), { recursive: true }); await fs.writeFile(filename, JSON.stringify(value, null, 2) + '\n'); }
