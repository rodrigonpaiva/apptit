import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const container = process.argv[2];
if (!/^apptit-(?:storage-eval|alpha2-local|synthetic)-postgres-1$/.test(container ?? '')) throw new Error('An explicit synthetic test PostgreSQL container is required');
const db = 'apptit_upgrade_' + randomUUID().replaceAll('-', '');
function sql(query, database = db) { return execFileSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', database, '-v', 'ON_ERROR_STOP=1', '-At'], { input: query, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim(); }
const migrations = 'services/kitchen/prisma/migrations', target = '202611140001_storage_locations';
const id = randomUUID(), tenant = randomUUID(), site = randomUUID(), receiptId = randomUUID(), original = { draft: { state: 'finalized', destination: 'Ancienne destination libre sans association' }, untouched: true };
sql(`CREATE DATABASE "${db}";`, 'postgres');
try {
 for (const name of fs.readdirSync(migrations).filter(name => name < target && fs.existsSync(path.join(migrations, name, 'migration.sql'))).sort()) sql(fs.readFileSync(path.join(migrations, name, 'migration.sql'), 'utf8'));
 sql(`INSERT INTO "ReceiptLocation"(id,"tenantId","siteId",name) VALUES('${id}','${tenant}','${site}','Ancien lieu non classé'); INSERT INTO "CatalogueProduct"(id,"tenantId","siteId",name,presentation,barcode) VALUES('${id}','${tenant}','${site}','Ancienne référence','Vrac',NULL); INSERT INTO "ReceiptDraft"(id,"tenantId","siteId",version,snapshot,"recordedAt") VALUES('${receiptId}','${tenant}','${site}',1,'${JSON.stringify(original)}',now());`);
 sql(fs.readFileSync(path.join(migrations, target, 'migration.sql'), 'utf8'));
 const row = JSON.parse(sql(`SELECT row_to_json(r) FROM (SELECT name,category,"isActive",version FROM "ReceiptLocation" WHERE id='${id}') r;`)); assert.deepEqual(row, { name: 'Ancien lieu non classé', category: null, isActive: true, version: 1 });
 assert.deepEqual(JSON.parse(sql(`SELECT snapshot FROM "ReceiptDraft" WHERE id='${receiptId}';`)), original);
 assert.equal(sql(`SELECT "imageUrl" IS NULL FROM "CatalogueProduct" WHERE id='${id}';`), 't');
 assert.throws(() => sql(`UPDATE "ReceiptLocation" SET category='freezer' WHERE id='${id}';`));
 console.log(JSON.stringify({ passed: true, target, populatedUpgrade: true, legacyNameAndCategoryPreserved: true, legacySnapshotUnchanged: true, nullablePhotoCompatible: true, databaseRejectsUnknownCategory: true }));
} finally { sql(`DROP DATABASE "${db}";`, 'postgres'); }
