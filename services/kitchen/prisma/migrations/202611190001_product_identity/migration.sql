ALTER TABLE "CatalogueProduct" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX "CatalogueProduct_id_tenantId_siteId_key" ON "CatalogueProduct"(id,"tenantId","siteId");
CREATE TABLE "ProductPresentation" (
 id UUID PRIMARY KEY, "productId" UUID NOT NULL, "tenantId" UUID NOT NULL, "siteId" UUID NOT NULL,
 label VARCHAR(200) NOT NULL CHECK(length(trim(label)) > 0), barcode VARCHAR(64),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0), "isActive" BOOLEAN NOT NULL DEFAULT true,
 CONSTRAINT "ProductPresentation_barcode_check" CHECK(barcode IS NULL OR barcode ~ '^[0-9]{1,64}$'),
 CONSTRAINT "ProductPresentation_scope_fk" FOREIGN KEY("productId","tenantId","siteId") REFERENCES "CatalogueProduct"(id,"tenantId","siteId") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "ProductPresentation_id_tenantId_siteId_key" ON "ProductPresentation"(id,"tenantId","siteId");
CREATE INDEX "ProductPresentation_scope_barcode_idx" ON "ProductPresentation"("tenantId","siteId",barcode);
INSERT INTO "ProductPresentation"(id,"productId","tenantId","siteId",label,barcode)
 SELECT gen_random_uuid(),id,"tenantId","siteId",presentation,barcode FROM "CatalogueProduct";
CREATE TABLE "ProductReferenceOperation" (
 "tenantId" UUID NOT NULL,"siteId" UUID NOT NULL,"actorId" UUID NOT NULL,"operationId" UUID NOT NULL,
 "sessionId" UUID NOT NULL,"correlationId" UUID NOT NULL,"recordedAt" TIMESTAMPTZ(3) NOT NULL,
 "intentHash" VARCHAR(64) NOT NULL,result JSONB NOT NULL,
 PRIMARY KEY("tenantId","siteId","actorId","operationId")
);
CREATE TRIGGER "ProductReferenceOperation_immutable" BEFORE UPDATE OR DELETE ON "ProductReferenceOperation"
 FOR EACH ROW EXECUTE FUNCTION reject_receipt_draft_history_change();
-- Existing receipt snapshots, revisions, label/observation links and operations are deliberately unchanged.
