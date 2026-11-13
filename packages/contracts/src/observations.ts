import type { ActorSnapshot, Datum, Instant, Scope } from './quantity-draft.js';

export type ObservationAssessmentState = 'pending' | 'within_rule' | 'deviation' | 'inconclusive' | 'not_applicable';
export interface ReceivingObservationProfile {
  id: string; version: number; scope: Scope; name: string;
  category: 'synthetic_chilled' | 'synthetic_frozen' | 'synthetic_ambient'; stage: 'receiving';
  synthetic: true; validatedForOperation: false; sourceRef: string;
  temperature: { required: boolean; unit: 'Cel'; minimum: string; maximum: string; requireMethod: true; requireInstrument: boolean };
  condition: { required: true; expected: 'intact'; requireMethod: true };
  maxAgeSeconds: number; futureToleranceSeconds: number;
}
type ObservationGap = { state: 'pending'; reason: string } | { state: 'not_applicable'; reason: string };
export type TemperatureObservation = ObservationGap | { state: 'recorded'; value: string; unit: 'Cel'; quality: 'measured' | 'estimated'; method: Datum<string>; instrument: Datum<string>; observedAt: Datum<Instant> };
export type ConditionObservation = ObservationGap | { state: 'recorded'; value: 'intact' | 'damaged'; method: Datum<string>; observedAt: Datum<Instant> };
export interface ReceivingObservationData { temperature: TemperatureObservation; condition: ConditionObservation; notes: string | null }
export interface ObservationAssessment { state: ObservationAssessmentState; reasons: string[] }
export interface ReceivingAssessment { temperature: ObservationAssessment; condition: ObservationAssessment; overall: ObservationAssessmentState }
export interface ObservationTarget { receiptId: string; lineId: string; productId: string; presentationId: string; batchId: string }
export interface SaveReceivingObservation {
  schemaVersion: 1; scope: Scope; id: string; operationId: string; expectedVersion: number; expectedReceiptVersion: number;
  target: ObservationTarget; profile: { id: string; version: number }; data: ReceivingObservationData; correctionReason: string | null;
}
export interface ReceivingObservationSnapshot {
  id: string; scope: Scope; version: number; target: ObservationTarget; receiptVersion: number;
  profile: ReceivingObservationProfile; data: ReceivingObservationData; assessment: ReceivingAssessment;
  originalAuthor: ActorSnapshot; updatedBy: ActorSnapshot; firstRecordedAt: Instant; recordedAt: Instant; correctionReason: string | null;
  taskState: 'in_progress' | 'recorded'; disposition: 'not_activated';
}
export interface ReceivingObservationListing { mode: 'disabled' | 'fixture'; profiles: ReceivingObservationProfile[]; entries: ReceivingObservationSnapshot[] }
export interface ReceivingObservationHistory { items: ReceivingObservationSnapshot[]; nextBeforeVersion: number | null }
