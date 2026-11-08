import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, link, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';

export class EvidenceStorageFailure extends Error {
  constructor(public readonly code: 'SIZE_LIMIT' | 'TYPE_REJECTED' | 'DIGEST_MISMATCH' | 'STORAGE_UNAVAILABLE' | 'UPLOAD_INCOMPLETE') { super(code); }
}
export const evidenceTypes = ['image/jpeg', 'image/png'] as const;
export async function boundedBytes(input: AsyncIterable<Uint8Array>, maxBytes: number): Promise<Buffer> {
  const parts: Buffer[] = []; let size = 0;
  for await (const chunk of input) { size += chunk.byteLength; if (size > maxBytes) throw new EvidenceStorageFailure('SIZE_LIMIT'); parts.push(Buffer.from(chunk)); }
  if (!size) throw new EvidenceStorageFailure('UPLOAD_INCOMPLETE');
  return Buffer.concat(parts);
}
/** Signature and size/digest checks, not OCR or food-safety/image-legibility approval. */
function imageType(bytes: Buffer): string {
  if (bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) && bytes.toString('ascii', 12, 16) === 'IHDR' && bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0 && bytes.readUInt32BE(16) * bytes.readUInt32BE(20) <= 40_000_000 && bytes.subarray(-8, -4).toString('ascii') === 'IEND') return 'image/png';
  if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9) return 'image/jpeg';
  throw new EvidenceStorageFailure('TYPE_REJECTED');
}
export class PrivateEvidenceStore {
  constructor(private readonly root: string, private readonly maxBytes: number) {}
  private async target(id: string) {
    if (!/^[a-f0-9-]{36}$/.test(id) || !path.isAbsolute(this.root) || this.root.split(path.sep).some(part => ['public', 'static', '.next', 'node_modules'].includes(part))) throw new EvidenceStorageFailure('STORAGE_UNAVAILABLE');
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const info = await lstat(this.root);
    if (!info.isDirectory() || info.isSymbolicLink() || (info.mode & 0o077) !== 0) throw new EvidenceStorageFailure('STORAGE_UNAVAILABLE');
    const directory = await realpath(this.root);
    if (directory.split(path.sep).some(part => ['public', 'static', '.next', 'node_modules'].includes(part))) throw new EvidenceStorageFailure('STORAGE_UNAVAILABLE');
    return { directory, filename: path.join(directory, `${id}.blob`) };
  }
  private validate(bytes: Buffer, expected: { mediaType: string; sizeBytes: number; sha256: string }) {
    if (bytes.length > this.maxBytes) throw new EvidenceStorageFailure('SIZE_LIMIT');
    if (bytes.length !== expected.sizeBytes) throw new EvidenceStorageFailure('UPLOAD_INCOMPLETE');
    if (imageType(bytes) !== expected.mediaType) throw new EvidenceStorageFailure('TYPE_REJECTED');
    if (createHash('sha256').update(bytes).digest('hex') !== expected.sha256) throw new EvidenceStorageFailure('DIGEST_MISMATCH');
  }
  async write(id: string, bytes: Buffer, expected: { mediaType: string; sizeBytes: number; sha256: string }) {
    this.validate(bytes, expected);
    const { filename, directory } = await this.target(id);
    const temporary = path.join(directory, `.upload-${randomUUID()}`);
    const handle = await open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    try {
      try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
      try { await link(temporary, filename); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; await this.read(id, expected); }
      const folder = await open(directory, constants.O_RDONLY); try { await folder.sync(); } finally { await folder.close(); }
    } finally { await unlink(temporary).catch(() => undefined); }
  }

  async read(id: string, expected: { mediaType: string; sizeBytes: number; sha256: string }) {
    const { filename } = await this.target(id); const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW);
    try { const info = await handle.stat(); if (!info.isFile() || info.size > this.maxBytes) throw new EvidenceStorageFailure('SIZE_LIMIT'); const bytes = await handle.readFile(); this.validate(bytes, expected); return bytes; }
    finally { await handle.close(); }
  }
}
