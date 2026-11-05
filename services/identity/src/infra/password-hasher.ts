import { argon2id, hash, verify } from 'argon2';
import type { PasswordHasher } from '../application/session.repository.js';
export class ArgonPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> { return hash(password, { type: argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 }); }
  async verify(encoded: string, password: string): Promise<boolean> {
    try { return await verify(encoded, password); } catch { return false; }
  }
}
