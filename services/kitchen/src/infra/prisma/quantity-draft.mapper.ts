import type { QuantityDraftData, VersionedQuantityDraft } from '@apptit/contracts';
import { quantityDraftData, timeZone } from '@apptit/domain-values';
import type { QuantityDraft } from '../../generated/prisma/client.js';
export function mapDraft(row: QuantityDraft): VersionedQuantityDraft {
  // @db.Date uses a Date transport container in Prisma; it is never a UTC expiry deadline.
  const data = quantityDraftData({
    label: row.label,
    quantity: row.quantityState === 'unknown' ? { state: 'unknown', reason: row.quantityReason } : {
      state: 'known', quality: row.quantityQuality, sourceRef: row.quantitySourceRef,
      value: { amount: row.amount?.toFixed(), unit: row.unit, basis: row.basis, resolution: row.resolution?.toFixed() },
    },
    expiry: row.expiryState === 'unknown' ? { state: 'unknown', reason: row.expiryReason } : {
      state: 'known', quality: row.expiryQuality, sourceRef: row.expiryDatumSource,
      value: { kind: row.expiryKind, date: row.expiryDate?.toISOString().slice(0, 10), sourceRef: row.expirySourceRef,
        ...(row.procedureVersion === null ? {} : { procedureVersion: row.procedureVersion }) },
    },
    observedAt: row.observedState === 'unknown' ? { state: 'unknown', reason: row.observedReason } : {
      state: 'known', quality: row.observedQuality, sourceRef: row.observedSourceRef, value: row.observedAt?.toISOString(),
    },
  });
  return { id: row.id, scope: { tenantId: row.tenantId, siteId: row.siteId }, siteTimeZone: timeZone(row.siteTimeZone), version: row.version,
    data, createdBy: { userId: row.createdById, nameAtAction: row.createdByName }, updatedBy: { userId: row.updatedById, nameAtAction: row.updatedByName },
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
export function draftColumns(data: QuantityDraftData) {
  const q = data.quantity;
  const e = data.expiry;
  const o = data.observedAt;
  return {
    label: data.label, quantityState: q.state, quantityReason: q.state === 'unknown' ? q.reason : null,
    amount: q.state === 'known' ? q.value.amount : null, unit: q.state === 'known' ? q.value.unit : null,
    basis: q.state === 'known' ? q.value.basis : null, resolution: q.state === 'known' ? q.value.resolution : null,
    quantityQuality: q.state === 'known' ? q.quality : null, quantitySourceRef: q.state === 'known' ? q.sourceRef : null,
    expiryState: e.state, expiryReason: e.state === 'unknown' ? e.reason : null,
    expiryKind: e.state === 'known' ? e.value.kind : null, expiryDate: e.state === 'known' ? new Date(`${e.value.date}T00:00:00.000Z`) : null,
    expirySourceRef: e.state === 'known' ? e.value.sourceRef : null, expiryQuality: e.state === 'known' ? e.quality : null,
    expiryDatumSource: e.state === 'known' ? e.sourceRef : null, procedureVersion: e.state === 'known' ? e.value.procedureVersion ?? null : null,
    observedState: o.state, observedReason: o.state === 'unknown' ? o.reason : null,
    observedAt: o.state === 'known' ? new Date(o.value) : null, observedQuality: o.state === 'known' ? o.quality : null,
    observedSourceRef: o.state === 'known' ? o.sourceRef : null,
  };
}
