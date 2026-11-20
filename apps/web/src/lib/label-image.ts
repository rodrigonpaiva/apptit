/** Inspect bounded original headers before browser decoding to avoid allocating oversized rasters. */
export function labelImageDimensions(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0, height = 0;
  if (bytes.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) { width = view.getUint32(16); height = view.getUint32(20); }
  else if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 3 < bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === undefined || marker === 218 || marker === 217) break;
      if (marker === 1 || marker >= 208 && marker <= 216) continue;
      if (offset + 2 > bytes.length) break;
      const length = view.getUint16(offset); if (length < 2 || offset + length > bytes.length) break;
      if (marker >= 192 && marker <= 207 && ![196, 200, 204].includes(marker) && length >= 8) { height = view.getUint16(offset + 3); width = view.getUint16(offset + 5); break; }
      offset += length;
    }
  }
  if (!width || !height || width > 12000 || height > 12000 || width * height > 24000000) throw new Error('INVALID_DIMENSIONS');
  return { width, height };
}
