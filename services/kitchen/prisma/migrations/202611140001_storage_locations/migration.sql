BEGIN;
ALTER TABLE "CatalogueProduct" ADD COLUMN "imageUrl" VARCHAR(500);
-- Unknown legacy categories remain unknown; no temperature or category is inferred from a name.
ALTER TABLE "ReceiptLocation" ADD COLUMN "category" VARCHAR(32), ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ReceiptLocation" ADD CONSTRAINT "ReceiptLocation_category_check" CHECK ("category" IS NULL OR "category" IN ('cold_bof','cold_produce','cold_raw_meat_fish','cold_finished','dry'));
ALTER TABLE "ReceiptLocation" ADD CONSTRAINT "ReceiptLocation_version_check" CHECK ("version">0);
CREATE TABLE "ReceiptLocationRevision" ("id" UUID PRIMARY KEY,"locationId" UUID NOT NULL REFERENCES "ReceiptLocation"("id") ON DELETE RESTRICT,"tenantId" UUID NOT NULL,"siteId" UUID NOT NULL,"version" INTEGER NOT NULL,"actorId" UUID NOT NULL,"sessionId" UUID NOT NULL,"correlationId" UUID NOT NULL,"recordedAt" TIMESTAMPTZ(3) NOT NULL,"before" JSONB,"snapshot" JSONB NOT NULL,UNIQUE("locationId","version"));
CREATE INDEX "ReceiptLocationRevision_scope_idx" ON "ReceiptLocationRevision"("tenantId","siteId","locationId");
CREATE TRIGGER "ReceiptLocationRevision_append_only" BEFORE UPDATE OR DELETE ON "ReceiptLocationRevision" FOR EACH ROW EXECUTE FUNCTION reject_receipt_draft_history_change();
COMMIT;
