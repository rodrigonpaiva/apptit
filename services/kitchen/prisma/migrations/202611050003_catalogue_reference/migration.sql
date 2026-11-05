BEGIN;
CREATE TABLE "CatalogueProduct" (
  "id" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "siteId" UUID NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "presentation" VARCHAR(200) NOT NULL,
  "barcode" VARCHAR(64),
  CONSTRAINT "CatalogueProduct_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CatalogueProduct_text" CHECK (length(trim("name")) > 0 AND length(trim("presentation")) > 0),
  CONSTRAINT "CatalogueProduct_barcode" CHECK ("barcode" IS NULL OR "barcode" ~ '^[0-9]{1,64}$')
);
CREATE INDEX "CatalogueProduct_tenantId_siteId_name_id_idx" ON "CatalogueProduct"("tenantId", "siteId", "name", "id");
COMMIT;
