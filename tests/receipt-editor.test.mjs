import test from 'node:test';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

test('receipt editor preserves distinct product/presentation identity and version across save/reopen instead of breaking photo links',async()=>{
  const temporary=await mkdtemp(path.join(tmpdir(),'apptit-editor-'));
  try {
    // Execute the pure browser serializer; ordinary workspace typecheck verifies its full types.
    for(const name of ['receipt-decimal','receipts']) {
      const source=await readFile(new URL(`../apps/web/src/lib/${name}.ts`,import.meta.url),'utf8');
      const result=ts.transpileModule(source.replace("'./receipt-decimal'","'./receipt-decimal.mjs'"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
      await writeFile(path.join(temporary,name+'.mjs'),result.outputText);
    }
    const {newReceiptLine,receiptCommand,restoreReceipt}=await import(pathToFileURL(path.join(temporary,'receipts.mjs')).href);
    const line=newReceiptLine({name:'Synthetic rice',presentation:'Physical 5 kg bag',barcode:'0012345678905'});
    assert.notEqual(line.productId,line.presentationId);line.presentationVersion=7;line.batch='SYNTHETIC-A';line.amount='10';line.unit='each';
    const site={tenantId:randomUUID(),siteId:randomUUID()},id=randomUUID();
    const first=receiptCommand(site,id,0,'','',[line]);
    const restored=restoreReceipt({draft:{data:first.command.payload},items:first.items});
    const next=receiptCommand(site,id,1,'','',restored);
    assert.deepEqual(next.command.payload.lines[0].product,first.command.payload.lines[0].product);
    assert.deepEqual(next.command.payload.lines[0].batch,first.command.payload.lines[0].batch);
    assert.equal(next.command.payload.lines[0].product.presentationVersion,7);
    assert.deepEqual(next.items,first.items);
  } finally { await rm(temporary,{recursive:true,force:true}); }
});
