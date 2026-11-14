export const LABEL_ENGINE = 'tesseract.js@7.0.0/fra@1.0.0' as const;
export type LabelDateKind = 'use_by' | 'best_before';
export interface LabelProposals { batch: string | null; expiry: string | null; expiryKind: LabelDateKind | null; uncertain: boolean }
export function labelDate(value: string): string | null {
  let year: string, month: string, day: string;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value), local = /^(\d{2})[/.-](\d{2})[/.-](\d{4})$/.exec(value);
  if (iso) [, year, month, day] = iso; else if (local) [, day, month, year] = local; else return null;
  const result = `${year}-${month}-${day}`, parsed = new Date(result + 'T00:00:00Z');
  return Number(year) >= 2000 && Number(year) <= 2199 && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === result ? result : null;
}
/** Conservative lexical proposals; no short-year, ambiguous-date or O/0 correction. Never authority. */
export function labelProposals(text: string, confidence: number): LabelProposals {
  const empty = { batch: null, expiry: null, expiryKind: null, uncertain: true };
  if (!Number.isFinite(confidence) || confidence < 55 || text.length > 8000) return empty;
  const lines = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  let uncertainDate = false;
  const batches = new Set<string>(), dates = new Map<string, LabelDateKind | null>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const batch = /\b(?:LOT(?:E)?|BATCH)(?:\s*(?:N[O°º]?|NUMBER))?\s*[:#=.-]?\s*([A-Z0-9][A-Z0-9/-]{0,49})\b/.exec(line);
    if (batch && /\d/.test(batch[1]!) && !labelDate(batch[1]!)) batches.add(batch[1]!);
    const useBy = /\bDLC\b|A CONSOMMER JUSQU|USE BY/.test(line);
    const bestBefore = /\bDDM\b|DE PREFERENCE AVANT|BEST BEFORE/.test(line);
    const generic = /\bEXP(?:IRY|IRATION)?\b|\bVALIDADE\b/.test(line);
    if (!useBy && !bestBefore && !generic) continue;
    const candidate = line + ' ' + (lines[i + 1] ?? '');
    const matches = candidate.match(/\b(?:\d{4}-\d{2}-\d{2}|\d{2}[/.-]\d{2}[/.-]\d{4})\b/g) ?? [];
    for (const match of matches) {
      const local = /^(\d{2})[/.-](\d{2})[/.-]\d{4}$/.exec(match);
      if (local && Number(local[1]) <= 12 && Number(local[2]) <= 12 && local[1] !== local[2]) { uncertainDate = true; continue; }
      const date = labelDate(match); if (!date) { uncertainDate = true; continue; }
      const kind = useBy && !bestBefore ? 'use_by' : bestBefore && !useBy ? 'best_before' : null;
      if (dates.has(date) && dates.get(date) !== kind) dates.set(date, null); else dates.set(date, kind);
    }
  }
  const batch = batches.size === 1 ? [...batches][0]! : null, expiry = !uncertainDate && dates.size === 1 ? [...dates.keys()][0]! : null;
  const expiryKind = expiry ? dates.get(expiry)! : null;
  return { batch, expiry, expiryKind, uncertain: !batch || !expiry || !expiryKind };
}
