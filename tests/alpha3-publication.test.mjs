import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { alpha3Acceptance, approvedAlpha3Publication } from '../scripts/containers/alpha3-policy.mjs';
import { publishPair } from '../scripts/containers/release.mjs';
import { requiredContainerFiles } from '../scripts/containers/build.mjs';
const sha='a'.repeat(40),tag='v0.1.0-alpha.3',metadata={tag,revision:sha,repository:'rodrigonpaiva/apptit',owner:'rodrigonpaiva',ownerType:'User'};
const acceptance={schemaVersion:1,releaseTag:tag,status:'passed',scope:'synthetic-receiving',stockEnabled:false,validatedSourceCommit:sha,baseAcceptance:'docs/delivery/sprint-2-acceptance.json',evidence:'docs/delivery/RELEASE-ALPHA3-ACCEPTANCE.md',extensions:['EXT-LOCAL-COMPOSE','EXT-OFF-LIVE','EXT-LABEL-OCR','EXT-RECEIVING-PHOTOS-STORAGE','EXT-STORAGE-DELETE-LAYOUT','EXT-PERSISTENT-PRODUCT-IDENTITY']};
const approval={schemaVersion:1,action:'publish-new-public-images',tag,repository:metadata.repository,visibility:'public',platform:'linux/amd64',validatedSourceCommit:sha,packages:['ghcr.io/rodrigonpaiva/apptit-api','ghcr.io/rodrigonpaiva/apptit-web']};
const images={api:{image:'test-api',imageId:'api-id',platform:'linux/amd64'},web:{image:'test-web',imageId:'web-id',platform:'linux/amd64'}},build={status:'built',sourceDirty:false,version:tag,revision:sha,repository:metadata.repository,images},validation={passed:true,images};
test('alpha.3 acceptance requires actual extension evidence, no-stock scope and its own exact source',()=>{
 alpha3Acceptance(acceptance);
 for(const change of [{status:'pending'},{stockEnabled:true},{extensions:acceptance.extensions.slice(1)},{releaseTag:'v0.1.0-alpha.4'},{validatedSourceCommit:'dev'}])assert.throws(()=>alpha3Acceptance({...acceptance,...change}));
});
test('owner public authorization never widens to another version, source, owner, package or unvalidated platform',()=>{
 assert.equal(approvedAlpha3Publication(metadata,approval,acceptance,build),true);
 for(const change of [{tag:'v0.1.0-alpha.2'},{owner:'other'},{ownerType:'Organization'},{repository:'other/apptit'}])assert.equal(approvedAlpha3Publication({...metadata,...change},approval,acceptance,build),false);
 for(const change of [{tag:'v0.1.0-alpha.4'},{validatedSourceCommit:'b'.repeat(40)},{packages:['ghcr.io/other/apptit-api','ghcr.io/other/apptit-web']},{action:'retain-existing-public-digest-only'}])assert.equal(approvedAlpha3Publication(metadata,{...approval,...change},acceptance,build),false);
 assert.equal(approvedAlpha3Publication(metadata,null,acceptance,build),false);
 assert.equal(approvedAlpha3Publication(metadata,approval,acceptance,{...build,images:{...images,web:{...images.web,platform:'linux/arm64'}}}),false);
});
async function scenario(t,{approved=true,failWeb=false,existing=false,drift=false}={}){
 const source=await fs.mkdtemp(path.join(os.tmpdir(),'apptit-alpha3-policy-'));t.after(()=>fs.rm(source,{recursive:true,force:true}));
 for(const file of requiredContainerFiles){await fs.mkdir(path.dirname(path.join(source,file)),{recursive:true});await fs.writeFile(path.join(source,file),'fixture');}
 for(const [file,data]of Object.entries({'docs/delivery/sprint-2-acceptance.json':{schemaVersion:1,sprint:2,status:'passed',validatedSourceCommit:sha,evidence:'docs/delivery/SPRINT-2-ACCEPTANCE.md',completed:Array.from({length:6},(_,i)=>'SP2-0'+(i+1))},'docs/delivery/release-alpha3-acceptance.json':acceptance})) {await fs.mkdir(path.dirname(path.join(source,file)),{recursive:true});await fs.writeFile(path.join(source,file),JSON.stringify(data));}
 for(const file of ['docs/delivery/SPRINT-2-ACCEPTANCE.md',acceptance.evidence])await fs.writeFile(path.join(source,file),'Executed fixture evidence');
 const pushed={},events=[],digests={api:'sha256:'+'1'.repeat(64),web:'sha256:'+'2'.repeat(64)};
 const request=async route=>route==='/repos/rodrigonpaiva/apptit'?{full_name:metadata.repository,owner:{login:metadata.owner,type:'User'}}:route.includes('/releases/tags/')?{tag_name:tag,published_at:'2026-11-20',draft:false}:route.includes('/git/ref/')?{object:{type:'commit',sha}}:route.includes('/packages/')?{visibility:'public'}:null;
 const execute=async(command,args)=>{events.push([command,...args].join(' '));if(command==='git'){if(args[0]==='rev-parse')return sha;if(args[0]==='diff'&&drift)throw new Error('runtime source drift');return '';}if(args[0]==='image')return JSON.stringify([{Id:args.at(-1)==='test-api'?'api-id':'web-id'}]);if(args[0]==='push'){const kind=args[1].includes('apptit-api:')?'api':'web';if(kind==='web'&&failWeb)throw new Error('web push failed');pushed[kind]=digests[kind];return 'digest: '+digests[kind];}return '';};
 const inspectRegistry=async kind=>({exists:Boolean(pushed[kind])||existing,packageExists:true,existingDigest:pushed[kind]??(existing?digests[kind]:null),visibility:'public',verification:'authenticated-and-anonymous-manifest'});
 const reportFile=path.join(source,'report.json');let error;
 try{await publishPair({metadata,source,build,validation,reportFile,request,execute,token:'fixture-token',inspectRegistry,publicApproval:approved?approval:undefined});}catch(e){error=e;}
 return {error,events,report:JSON.parse(await fs.readFile(reportFile))};
}
test('approved public alpha.3 publishes both tested images and verifies both public digests',async t=>{
 const {error,report,events}=await scenario(t);assert.equal(error,undefined);assert.equal(report.status,'published');assert.equal(report.finalRegistryVerified,true);assert.equal(report.publicationPartial,false);
 for(const kind of ['api','web']){assert.equal(report.published[kind].visibility,'public');assert.equal(report.published[kind].ownerApprovedPublicPublication,true);}
 assert.equal(events.filter(e=>e.startsWith('docker push')).length,2);assert.ok(events.every(e=>!e.includes(':latest')&&!e.includes(':v0.1.0-alpha.2')));
});
for(const [name,options]of Object.entries({unauthorized:{approved:false},existing:{existing:true},drift:{drift:true}}))test(`alpha.3 ${name} blocks every push`,async t=>{const {error,events}=await scenario(t,options);assert.ok(error);assert.equal(events.some(e=>e.startsWith('docker push')),false);});
test('approved public alpha.3 still records partial/uncertain state after second push failure',async t=>{const {error,report}=await scenario(t,{failWeb:true});assert.ok(error);assert.equal(report.publicationPartial,true);assert.equal(report.publicationUncertain,true);assert.equal(report.published.api.visibility,'public');assert.equal(report.published.web,undefined);});
