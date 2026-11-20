import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const container=process.argv[2];
if(!/^apptit-(?:storage-eval|alpha2-local|synthetic)-postgres-1$/.test(container??'')) throw new Error('Explicit synthetic PostgreSQL container required');
const database='apptit_identity_upgrade_'+randomUUID().replaceAll('-',''), target='202611190001_product_identity', directory='services/kitchen/prisma/migrations';
const sql=(query,db=database)=>execFileSync('docker',['exec','-i',container,'psql','-U','postgres','-d',db,'-v','ON_ERROR_STOP=1','-At'],{input:query,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const tenant=randomUUID(),site=randomUUID(),productA=randomUUID(),productB=randomUUID(),receipt=randomUUID(),original={draft:{state:'draft',data:{legacyProduct:randomUUID(),legacyPresentation:randomUUID()}},preserved:true};
sql(`CREATE DATABASE "${database}";`,'postgres');
try{
 for(const name of fs.readdirSync(directory).filter(name=>name<target&&fs.existsSync(path.join(directory,name,'migration.sql'))).sort())sql(fs.readFileSync(path.join(directory,name,'migration.sql'),'utf8'));
 sql(`INSERT INTO "CatalogueProduct"(id,"tenantId","siteId",name,presentation,barcode) VALUES('${productA}','${tenant}','${site}','Legacy A','5 kg','0012345678905'),('${productB}','${tenant}','${site}','Legacy B','10 kg','0012345678905'); INSERT INTO "ReceiptDraft"(id,"tenantId","siteId",version,snapshot,"recordedAt") VALUES('${receipt}','${tenant}','${site}',1,'${JSON.stringify(original)}',now());`);
 sql(fs.readFileSync(path.join(directory,target,'migration.sql'),'utf8'));
 assert.deepEqual(JSON.parse(sql(`SELECT snapshot FROM "ReceiptDraft" WHERE id='${receipt}'`)),original);
 sql(fs.readFileSync(path.join(directory,'202611190002_product_identity_guards','migration.sql'),'utf8'));
 const rows=JSON.parse(sql('SELECT json_agg(r) FROM (SELECT id,"productId",version,"isActive",label,barcode FROM "ProductPresentation" ORDER BY label) r'));
 assert.equal(rows.length,2);assert.notEqual(rows[0].id,rows[1].id);assert.deepEqual(new Set(rows.map(row=>row.productId)),new Set([productA,productB]));assert.ok(rows.every(row=>row.version===1&&row.isActive&&row.barcode==='0012345678905'));
 assert.equal(sql('SELECT count(*) FROM "ProductReferenceOperation"'),'0');
 assert.throws(()=>sql('DELETE FROM "ProductPresentation"'));
 assert.throws(()=>sql(`UPDATE "ProductPresentation" SET id='${randomUUID()}' WHERE "productId"='${productA}'`));
 assert.throws(()=>sql(`INSERT INTO "ProductPresentation"(id,"productId","tenantId","siteId",label) VALUES('${randomUUID()}','${productA}','${randomUUID()}','${site}','Foreign scope')`));
 assert.throws(()=>sql(`UPDATE "ProductPresentation" SET version=0`));
 console.log(JSON.stringify({passed:true,target,populatedUpgrade:true,originalProductsPreserved:true,ambiguousBarcodeNotMerged:true,receiptSnapshotUnchanged:true,scopedForeignKey:true,positiveVersions:true,permanentPresentationIdentity:true}));
}finally{sql(`DROP DATABASE "${database}";`,'postgres');}
