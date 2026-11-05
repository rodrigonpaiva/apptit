import { quantityDraftData, validate } from '@apptit/domain-values';
/** Pure submitted-value validation only. No persistence, identity assertion or stock effect. */
export const quantityValidationSchema = `
  input QuantityValueInput { amount: String!, unit: String!, basis: String!, resolution: String! }
  input QuantityDatumInput { state: String!, reason: String, value: QuantityValueInput, quality: String, sourceRef: String }
  input ExpiryValueInput { kind: String!, date: String!, sourceRef: String!, procedureVersion: String }
  input ExpiryDatumInput { state: String!, reason: String, value: ExpiryValueInput, quality: String, sourceRef: String }
  input InstantDatumInput { state: String!, reason: String, value: String, quality: String, sourceRef: String }
  input QuantityDraftValidationInput { label: String!, quantity: QuantityDatumInput!, expiry: ExpiryDatumInput!, observedAt: InstantDatumInput! }
  type InputIssue { field: String!, code: String!, message: String! }
  type QuantityDraftValidation { ok: Boolean!, issues: [InputIssue!]! }
  extend type Query { validateQuantityDraft(input: QuantityDraftValidationInput!): QuantityDraftValidation! }
`;
export function validateQuantityDraftInput(_parent: unknown, args: { input: unknown }) {
  const result = validate(() => quantityDraftData(args.input));
  return { ok: result.ok, issues: result.ok ? [] : result.error.issues };
}
