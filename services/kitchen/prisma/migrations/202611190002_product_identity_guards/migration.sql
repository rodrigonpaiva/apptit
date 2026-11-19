-- Preserve canonical presentation identity even outside application adapters.
CREATE FUNCTION guard_product_presentation_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN
  RAISE EXCEPTION 'Persistent presentation identities cannot be deleted';
 END IF;
 IF NEW.id IS DISTINCT FROM OLD.id OR NEW."productId" IS DISTINCT FROM OLD."productId"
    OR NEW."tenantId" IS DISTINCT FROM OLD."tenantId" OR NEW."siteId" IS DISTINCT FROM OLD."siteId" THEN
  RAISE EXCEPTION 'Persistent presentation identities cannot be reassigned';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER "ProductPresentation_identity_guard" BEFORE UPDATE OR DELETE ON "ProductPresentation"
 FOR EACH ROW EXECUTE FUNCTION guard_product_presentation_identity();
