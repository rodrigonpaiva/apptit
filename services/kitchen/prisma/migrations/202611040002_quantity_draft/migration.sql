BEGIN;

CREATE TABLE "QuantityDraft" (
  "id" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "siteId" UUID NOT NULL,
  "siteTimeZone" VARCHAR(100) NOT NULL,
  "version" INTEGER NOT NULL,
  "label" VARCHAR(200) NOT NULL,
  "quantityState" VARCHAR(10) NOT NULL,
  "quantityReason" VARCHAR(500),
  "amount" DECIMAL(24,9),
  "unit" VARCHAR(10),
  "basis" VARCHAR(20),
  "resolution" DECIMAL(24,9),
  "quantityQuality" VARCHAR(10),
  "quantitySourceRef" VARCHAR(500),
  "expiryState" VARCHAR(10) NOT NULL,
  "expiryReason" VARCHAR(500),
  "expiryKind" VARCHAR(20),
  "expiryDate" DATE,
  "expirySourceRef" VARCHAR(500),
  "expiryQuality" VARCHAR(10),
  "expiryDatumSource" VARCHAR(500),
  "procedureVersion" VARCHAR(500),
  "observedState" VARCHAR(10) NOT NULL,
  "observedReason" VARCHAR(500),
  "observedAt" TIMESTAMPTZ(3),
  "observedQuality" VARCHAR(10),
  "observedSourceRef" VARCHAR(500),
  "createdById" UUID NOT NULL,
  "createdByName" VARCHAR(200) NOT NULL,
  "updatedById" UUID NOT NULL,
  "updatedByName" VARCHAR(200) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "QuantityDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuantityDraftRevision" (
  "draftId" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "siteId" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "actorId" UUID NOT NULL,
  "actorName" VARCHAR(200) NOT NULL,
  "sessionId" UUID NOT NULL,
  "correlationId" UUID NOT NULL,
  "recordedAt" TIMESTAMPTZ(3) NOT NULL,
  "before" JSONB,
  "after" JSONB NOT NULL,
  CONSTRAINT "QuantityDraftRevision_pkey" PRIMARY KEY ("draftId", "version")
);

CREATE UNIQUE INDEX "QuantityDraft_id_tenantId_siteId_key" ON "QuantityDraft"("id", "tenantId", "siteId");

CREATE INDEX "QuantityDraft_tenantId_siteId_idx" ON "QuantityDraft"("tenantId", "siteId");

CREATE INDEX "QuantityDraftRevision_tenantId_siteId_draftId_idx" ON "QuantityDraftRevision"("tenantId", "siteId", "draftId");

ALTER TABLE "QuantityDraftRevision" ADD CONSTRAINT "QuantityDraftRevision_draftId_tenantId_siteId_fkey" FOREIGN KEY ("draftId", "tenantId", "siteId") REFERENCES "QuantityDraft"("id", "tenantId", "siteId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Runtime parsers reject over-precision before SQL can round NUMERIC input.
ALTER TABLE "QuantityDraft" ADD CONSTRAINT "QuantityDraft_version_positive" CHECK ("version" > 0);
ALTER TABLE "QuantityDraft" ADD CONSTRAINT "QuantityDraft_label_nonempty" CHECK (length(btrim("label")) > 0);
ALTER TABLE "QuantityDraft" ADD CONSTRAINT "QuantityDraft_quantity_state" CHECK (
  ("quantityState" = 'unknown' AND "quantityReason" IS NOT NULL AND length(btrim("quantityReason")) > 0
    AND "amount" IS NULL AND "unit" IS NULL AND "basis" IS NULL AND "resolution" IS NULL AND "quantityQuality" IS NULL AND "quantitySourceRef" IS NULL)
  OR
  ("quantityState" = 'known' AND "quantityReason" IS NULL
    AND "amount" IS NOT NULL AND "amount" >= 0 AND "resolution" IS NOT NULL AND "resolution" > 0
    AND "unit" IS NOT NULL AND "unit" IN ('g', 'ml', 'each')
    AND "basis" IS NOT NULL AND "basis" IN ('as_received', 'raw_net', 'prepared')
    AND "quantityQuality" IS NOT NULL AND "quantityQuality" IN ('measured', 'estimated', 'imported')
    AND "quantitySourceRef" IS NOT NULL AND length(btrim("quantitySourceRef")) > 0
    AND ("unit" <> 'each' OR (trunc("amount") = "amount" AND trunc("resolution") = "resolution"))
    AND ("quantityQuality" <> 'measured' OR mod("amount", "resolution") = 0))
);
ALTER TABLE "QuantityDraft" ADD CONSTRAINT "QuantityDraft_expiry_state" CHECK (
  ("expiryState" = 'unknown' AND "expiryReason" IS NOT NULL AND length(btrim("expiryReason")) > 0
    AND "expiryKind" IS NULL AND "expiryDate" IS NULL AND "expirySourceRef" IS NULL AND "expiryQuality" IS NULL AND "expiryDatumSource" IS NULL AND "procedureVersion" IS NULL)
  OR
  ("expiryState" = 'known' AND "expiryReason" IS NULL AND "expiryDate" IS NOT NULL
    AND "expiryKind" IS NOT NULL AND "expiryKind" IN ('use_by', 'best_before', 'after_opening')
    AND "expiryQuality" IS NOT NULL AND "expiryQuality" IN ('measured', 'estimated', 'imported')
    AND "expirySourceRef" IS NOT NULL AND length(btrim("expirySourceRef")) > 0
    AND "expiryDatumSource" IS NOT NULL AND length(btrim("expiryDatumSource")) > 0)
);
ALTER TABLE "QuantityDraft" ADD CONSTRAINT "QuantityDraft_observed_state" CHECK (
  ("observedState" = 'unknown' AND "observedReason" IS NOT NULL AND length(btrim("observedReason")) > 0
    AND "observedAt" IS NULL AND "observedQuality" IS NULL AND "observedSourceRef" IS NULL)
  OR
  ("observedState" = 'known' AND "observedReason" IS NULL AND "observedAt" IS NOT NULL
    AND "observedQuality" IS NOT NULL AND "observedQuality" IN ('measured', 'estimated', 'imported')
    AND "observedSourceRef" IS NOT NULL AND length(btrim("observedSourceRef")) > 0)
);
ALTER TABLE "QuantityDraftRevision" ADD CONSTRAINT "QuantityDraftRevision_version_positive" CHECK ("version" > 0);
ALTER TABLE "QuantityDraftRevision" ADD CONSTRAINT "QuantityDraftRevision_snapshots" CHECK (
  jsonb_typeof("after") = 'object' AND ("before" IS NULL OR jsonb_typeof("before") = 'object')
);
CREATE FUNCTION reject_quantity_draft_revision_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Quantity draft revisions are append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER "QuantityDraftRevision_append_only"
  BEFORE UPDATE OR DELETE ON "QuantityDraftRevision"
  FOR EACH ROW EXECUTE FUNCTION reject_quantity_draft_revision_change();

COMMIT;
