import type { Datum, ReceivingObservationData, ReceivingObservationProfile, ReceivingObservationSnapshot, SaveReceivingObservation, SiteAccess } from '@apptit/contracts';
import type { ReceiptEditorLine } from './receipts';
export interface ObservationEditor {
  temperatureState: 'pending' | 'recorded' | 'not_applicable'; temperatureReason: string; temperatureValue: string; unit: '' | 'Cel'; quality: '' | 'measured' | 'estimated'; method: string; instrument: string; temperatureTime: string;
  conditionState: 'pending' | 'recorded' | 'not_applicable'; conditionReason: string; conditionValue: '' | 'intact' | 'damaged'; conditionMethod: string; conditionTime: string; notes: string; correctionReason: string;
}
export const blankObservation = (): ObservationEditor => ({ temperatureState: 'pending', temperatureReason: '', temperatureValue: '', unit: '', quality: '', method: '', instrument: '', temperatureTime: '', conditionState: 'pending', conditionReason: '', conditionValue: '', conditionMethod: '', conditionTime: '', notes: '', correctionReason: '' });
const unknown = { state: 'unknown', reason: 'Non renseigné par l’opérateur — en attente' } as const;
const known = <T,>(value: T) => ({ state: 'known', value, quality: 'measured', sourceRef: 'operator/receiving-observation' } as const);
export function observedTimeInput(value: Datum<string>): string { return value.state === 'known' ? new Date(new Date(value.value).getTime() - new Date(value.value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''; }
function actualTime(value: string, previous?: Datum<string>): Datum<string> {
  // Do not truncate seconds or change a DST-fold instant when an existing displayed value was not edited.
  if (previous && observedTimeInput(previous) === value) return previous;
  return value ? known(new Date(value).toISOString()) : unknown;
}
function observedText(value: string, previous?: Datum<string>): Datum<string> { if (previous?.state === 'known' && previous.value === value.trim()) return previous; return value.trim() ? known(value.trim()) : unknown; }
function amount(value: string): string {
  const normalized = value.trim().replace(',', '.').replace(/^(-?\d+)\.0+$/, '$1').replace(/(\.\d*?[1-9])0+$/, '$1');
  if (!/^-?(0|[1-9]\d{0,14})(?:\.\d{0,8}[1-9])?$/.test(normalized)) throw new Error('Saisissez la température réellement observée, sans arrondi automatique.');
  return normalized === '-0' ? '0' : normalized;
}
export function observationEditor(value: ReceivingObservationSnapshot): ObservationEditor {
  const editor = blankObservation(); const { temperature, condition } = value.data;
  editor.temperatureState = temperature.state; editor.conditionState = condition.state; editor.notes = value.data.notes ?? '';
  if (temperature.state === 'recorded') { editor.temperatureValue = temperature.value; editor.unit = temperature.unit; editor.quality = temperature.quality; editor.method = temperature.method.state === 'known' ? temperature.method.value : ''; editor.instrument = temperature.instrument.state === 'known' ? temperature.instrument.value : ''; editor.temperatureTime = observedTimeInput(temperature.observedAt); } else editor.temperatureReason = temperature.reason;
  if (condition.state === 'recorded') { editor.conditionValue = condition.value; editor.conditionMethod = condition.method.state === 'known' ? condition.method.value : ''; editor.conditionTime = observedTimeInput(condition.observedAt); } else editor.conditionReason = condition.reason;
  return editor;
}
export function observationCommand(site: SiteAccess, receiptId: string, receiptVersion: number, line: ReceiptEditorLine, profile: ReceivingObservationProfile, editor: ObservationEditor, id: string, previous: ReceivingObservationSnapshot | null): SaveReceivingObservation {
  const gap = (state: 'pending' | 'not_applicable', reason: string) => { if (state === 'not_applicable' && !reason.trim()) throw new Error('Justifiez chaque déclaration non applicable.'); return { state, reason: reason.trim() || 'Non observé — en attente' }; };
  if (editor.temperatureState === 'recorded' && (editor.unit !== 'Cel' || !editor.quality)) throw new Error('Précisez l’unité et si la lecture est mesurée ou estimée.');
  if (editor.conditionState === 'recorded' && !editor.conditionValue) throw new Error('Choisissez la condition réellement observée.');
  if (previous && !editor.correctionReason.trim()) throw new Error('Indiquez le motif de correction ; la version originale est conservée.');
  const priorTemperature = previous?.data.temperature.state === 'recorded' ? previous.data.temperature : undefined; const priorCondition = previous?.data.condition.state === 'recorded' ? previous.data.condition : undefined;
  const data: ReceivingObservationData = {
    temperature: editor.temperatureState === 'recorded' ? { state: 'recorded', value: amount(editor.temperatureValue), unit: 'Cel', quality: editor.quality as 'measured' | 'estimated', method: observedText(editor.method, priorTemperature?.method), instrument: observedText(editor.instrument, priorTemperature?.instrument), observedAt: actualTime(editor.temperatureTime, priorTemperature?.observedAt) } : gap(editor.temperatureState, editor.temperatureReason),
    condition: editor.conditionState === 'recorded' ? { state: 'recorded', value: editor.conditionValue as 'intact' | 'damaged', method: observedText(editor.conditionMethod, priorCondition?.method), observedAt: actualTime(editor.conditionTime, priorCondition?.observedAt) } : gap(editor.conditionState, editor.conditionReason), notes: editor.notes.trim() || null,
  };
  return { schemaVersion: 1, scope: { tenantId: site.tenantId, siteId: site.siteId }, id, operationId: crypto.randomUUID(), expectedVersion: previous?.version ?? 0, expectedReceiptVersion: receiptVersion, target: { receiptId, lineId: line.id, productId: line.productId, presentationId: line.presentationId, batchId: line.batchId }, profile: { id: profile.id, version: profile.version }, data, correctionReason: previous ? editor.correctionReason.trim() : null };
}
export async function observationRequest<T>(action: 'save' | 'list' | 'history', input: unknown, signal?: AbortSignal): Promise<T> {
  const bootstrap = await fetch('/api/session/csrf', { credentials: 'same-origin', cache: 'no-store', signal });
  if (!bootstrap.ok) throw new Error('DEPENDENCY_UNAVAILABLE'); const { csrfToken } = await bootstrap.json() as { csrfToken: string };
  const response = await fetch(`/api/observations/${action}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal, headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(input) });
  if (!response.ok) { const body = await response.json().catch(() => ({})) as { code?: string }; throw new Error(body.code ?? 'OUTCOME_UNCERTAIN'); }
  return response.json() as Promise<T>;
}
