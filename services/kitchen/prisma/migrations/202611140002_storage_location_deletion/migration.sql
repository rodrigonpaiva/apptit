ALTER TABLE "ReceiptLocation" ADD COLUMN "deletedAt" TIMESTAMPTZ(3);
ALTER TABLE "ReceiptLocation" ADD CONSTRAINT "ReceiptLocation_deleted_inactive" CHECK ("deletedAt" IS NULL OR "isActive" = false);
