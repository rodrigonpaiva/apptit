# SP2-05 — Procedure-bound receiving observations

Sources: spec v0.80 RF-07.1/RF-08, sections 21.4/21.5/21.8 and T02/T08; SP2-05 AC1–AC3; AP-036/079/080/081/086/025. This is a narrow synthetic capture/assessment slice, not an activated PMS, legal rule set, safety certification, chef disposition or usable-stock operation.

## Profile and authority

Kitchen owns the synthetic receiving registry. Explicit chilled/frozen/ambient engineering examples define category, stage, required fields, Celsius unit, illustrative decimal limits, method/instrument requirements and freshness/future tolerance. Every profile is marked synthetic and not validated for operation, scoped to the authorized site, with a source ID and exact version. The operator explicitly chooses an illustration; OFF cannot silently classify goods into a safety regime.

The client sends only profile ID/version. It cannot supply thresholds, approval, actor, recording time, assessment or disposition. New observations require the current server-owned profile. Existing corrections keep their original full profile snapshot, even if later registry versions change; changing classification requires a future deliberate reclassification workflow. There is no PMS authoring/activation endpoint. Fixture values are not legal or restaurant recommendations.

Identity grants `observation.read` and `observation.capture` to chef/storekeeper in the synthetic role map. Cook has neither. Capture is independent of future `receipt.disposition`, which remains ungranted/inactive. Saving a deviation cannot release goods or close an incident. Both gateway and Kitchen obtain fresh individual authorization; service credentials, role headers or client scope alone are not authority.

## Data and assessment

Each saved line has one versioned observation aggregate bound to the actual receipt/line/product/presentation/batch IDs and receipt version. It records temperature and condition independently:

- pending: actual reading/check is absent, with an explicit gap reason; no value is invented;
- recorded: actual decimal temperature/unit/quality or observed condition, method, observation time and instrument where required;
- not_applicable: explicit operator declaration with a nonempty reason; a required control stays inconclusive rather than being waived.

Observation instants are separate from server recording time. Known/unknown and measured/estimated/imported context remain explicit. Wrong temperature units/unsupported values are rejected; this slice does not infer Fahrenheit conversions. Estimated temperature, uncertain time/method/instrument, missing context, stale or excessively future time is inconclusive. Confirmed values compare exactly against the captured synthetic limits using scaled decimals. Condition deviation and temperature deviation stay distinct from missing data.

Aggregate assessment preserves deviation even when another control is pending; task state remains in progress if any control is pending/inconclusive. Complete recorded data can be within the illustrative rule or a deviation. Recording never claims operational compliance, current eligibility, completed incident handling or notification delivery. UI labels explicitly refer to the last server-saved version and assessment at recording time.

The editor begins without a reading, expected temperature, condition, unit, quality or time prefilled. Time fields are device-local and labelled separately from restaurant timezone; server values use UTC instants. Unchanged stored instants retain their exact seconds/milliseconds and provenance through correction, including DST-fold instants; they are not rebuilt from the minute-resolution display. New manually entered times rely on the operator's device/time interpretation, not a calibrated sensor clock.

## Commands, history and consistency

Same-origin JSON POST routes are `/api/observations/save`, `/list` and `/history`, rewritten to gateway `/observations/*`; internal Kitchen counterparts are `/internal/v1/observations/*`. Session-bound CSRF, exact Origin, current individual scope/capability and existing 32 KiB body bounds apply. No new secret or external endpoint is exposed.

SaveReceivingObservation schemaVersion 1 includes operation/id/scope, expected observation and receipt versions, actual target IDs, profile reference, observations and correction reason. First save requires expectedVersion 0; corrections require an exact version and nonempty reason. Receipt identity and version are revalidated inside the transaction. Receipt edits cannot silently delete or reassign lines with original observations. Version/profile/link conflicts require reload/review.

The transaction locks the receipt in the same order as draft/evidence operations and commits aggregate, immutable attributable revision and durable save outcome together. Actor/site/operation uniqueness prevents duplicate saves; same normalized intent returns the original result, mismatched intent is 409. Replay is checked again after the lock, so a concurrently completed operation is returned before applying newer receipt-version validation. Context changes cannot reattribute the original command. Failure of revision/outcome persistence rolls back the whole write.

Original actor/name, first recording time, later updater and reason are retained. History is scope-checked, newest first, 20 revisions per page with beforeVersion pagination. No update/delete endpoint or mutable history exists. New capture can be disabled while authorized history/list and already committed identical replay remain available; this does not authorize a new mutation.

## Configuration and boundaries

`OBSERVATION_MODE=disabled` is the checked-in default; `fixture` is the only enabled mode and `live` is rejected. `npm run local:env` adds the new setting without overwriting existing values. For explicit synthetic interaction:

```sh
OBSERVATION_MODE=fixture npm run dev
```

Combine with the [private evidence settings](private-evidence.md) if testing photos too. No measured data or legal thresholds are auto-loaded. The synthetic smoke enables both fixture capabilities only in its child processes. Manual fields are memory-only until server acknowledgment; timeout retains the same command for explicit retry. Lock/navigation removes unsaved fields. Offline capture, sensor integration, full establishment/PMS lifecycle, actual chef disposition, incidents and stock effects remain unavailable.

[Delivery and actual checks](../../delivery/SP2-05.md). SP2-06 must consolidate receipt/photo/observation durability and failure scenarios; this contract does not mark the entire sprint or parent AP items complete.
