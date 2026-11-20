// UI interaction regression using the real production Next app and an explicit in-memory transport fixture.
// Backend authorization/durability remain covered by the separate PostgreSQL/HTTP suites.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
const { chromium } = await import(process.argv[2] ? pathToFileURL(path.resolve(process.argv[2])).href : 'playwright');
const site = { tenantId: '11111111-1111-4111-8111-111111111111', siteId: '22222222-2222-4222-8222-222222222222', name: 'Restaurant UI synthétique', timeZone: 'Europe/Paris', role: 'chef', membershipVersion: 1, capabilities: ['site.read', 'catalogue.read', 'receipt.draft.read', 'receipt.draft.write', 'storage.location.manage'] };
const profile = { user: { id: '33333333-3333-4333-8333-333333333333', login: 'ui@apptit.test', name: 'Chef UI' }, selectedSite: site, sites: [site], expiresAt: '2099-01-01T00:00:00Z' };
let rows = [], saveCount = 0, failSave = false, delayedSave;
const gatewayPort = Number(process.env.GATEWAY_PORT ?? 4000), webPort = Number(process.env.UI_TEST_PORT ?? 3100);
assert.ok(gatewayPort !== webPort);
const server = http.createServer(async (request, response) => {
  const parts = []; for await (const chunk of request) parts.push(chunk);
  const input = parts.length ? JSON.parse(Buffer.concat(parts)) : {};
  const send = (value, status = 200) => { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(value)); };
  switch (request.url) {
    case '/session/current': return send(profile);
    case '/session/csrf': return send({ csrfToken: 'synthetic-ui-only' });
    case '/graphql': return send({ data: { catalogue: { items: [], hasMore: false } } });
    case '/storage-locations/list': await pause(150); return send(rows);
    case '/storage-locations/save': {
      saveCount++;
      if (delayedSave) await delayedSave;
      if (failSave) return send({ code: 'VERSION_CONFLICT' }, 409);
      const row = { ...input, version: input.expectedVersion + 1 }; rows = [...rows.filter(value => value.id !== row.id), row]; return send(row, 201);
    }
    case '/storage-locations/remove': rows = rows.filter(value => value.id !== input.id); return send({ id: input.id }, 201);
    case '/receipts/locations': return send(rows);
    case '/receipts/list': return send([]);
    default: return send({ code: 'UI_FIXTURE_ROUTE_NOT_FOUND' }, 404);
  }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(gatewayPort, '127.0.0.1', resolve); });
const child = spawn(process.execPath, ['../../node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(webPort)], { cwd: 'apps/web', env: { ...process.env, GATEWAY_PORT: String(gatewayPort), NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let output = ''; for (const stream of [child.stdout, child.stderr]) stream.on('data', value => { output = (output + value).slice(-4000); });
let browser;
const directory = '.local/qa-ui', report = { passed: false, transport: 'in-memory synthetic fixture; real production Next application', checks: [], widths: [] }, errors = [];
const check = name => { report.checks.push(name); console.log('PASS: ' + name); };
try {
  const origin = `http://127.0.0.1:${webPort}`;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Next exited: ' + output);
    try { ready = (await fetch(origin, { signal: AbortSignal.timeout(500) })).ok; } catch { /* bounded startup */ }
    if (ready) break;
    await pause(250);
  }
  assert.ok(ready, 'Production Next server became ready');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/workspace#storage');
  await page.getByText('Aucun lieu configuré pour ce restaurant.', { exact: true }).waitFor();
  const save = page.getByRole('button', { name: 'Enregistrer le lieu', exact: true });
  await save.click();
  await page.getByText('Renseignez le nom du lieu.', { exact: true }).waitFor();
  assert.equal(saveCount, 0);
  assert.equal(await page.getByLabel('Nom du lieu', { exact: true }).getAttribute('aria-invalid'), 'true');
  check('required fields show associated errors without sending a command');
  const name = page.getByLabel('Nom du lieu', { exact: true });
  await name.fill('Économat UI synthétique');
  await page.getByLabel('Catégorie', { exact: true }).selectOption('dry');
  let finishSave;
  delayedSave = new Promise(resolve => { finishSave = resolve; });
  await save.click();
  await page.getByRole('button', { name: 'Enregistrement…', exact: true }).waitFor();
  assert.equal(await name.isDisabled(), true);
  finishSave(); delayedSave = undefined;
  await page.getByText('Lieu enregistré pour ce restaurant.', { exact: true }).waitFor();
  assert.equal(saveCount, 1); assert.equal(await name.inputValue(), '');
  check('save disables the form while pending and resets only after confirmed response');
  const edit = page.getByRole('button', { name: 'Modifier', exact: true });
  await edit.click(); assert.equal(await name.inputValue(), 'Économat UI synthétique');
  failSave = true; await name.fill('Modification non confirmée'); await save.click();
  await page.getByText('Opération non confirmée. Rechargez les lieux avant de réessayer.', { exact: true }).waitFor();
  assert.equal(await name.inputValue(), 'Modification non confirmée'); assert.equal(await save.isDisabled(), true);
  failSave = false; await page.getByRole('button', { name: 'Recharger les lieux', exact: true }).click();
  await save.waitFor(); await page.waitForFunction(() => !globalThis.document.querySelector('#storage-name').disabled);
  assert.equal(await name.inputValue(), 'Économat UI synthétique');
  check('conflict preserves typed values, blocks resubmit and reload restores server version');
  const remove = page.getByRole('button', { name: 'Supprimer Économat UI synthétique', exact: true });
  await remove.click(); const dialog = page.getByRole('alertdialog'); await dialog.waitFor();
  const cancel = page.getByRole('button', { name: 'Conserver ce lieu', exact: true });
  const contrast = await cancel.evaluate(element => {
    const style = globalThis.getComputedStyle(element);
    const luminance = value => {
      const rgb = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(channel => { const s = channel / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const text = luminance(style.color), background = luminance(style.backgroundColor);
    return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
  });
  assert.ok(contrast >= 4.5, 'outline control meets normal text contrast');
  assert.equal(await cancel.evaluate(element => element === globalThis.document.activeElement), true);
  for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); assert.equal(await dialog.evaluate(element => element.contains(globalThis.document.activeElement)), true); }
  await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(element => element === globalThis.document.activeElement, await remove.elementHandle());
  check('destructive dialog focuses cancel, traps keyboard focus, closes on Escape and restores trigger');
  await mkdir(directory, { recursive: true });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await remove.click(); await dialog.waitFor();
    assert.ok(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1));
    const box = await dialog.boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
    await page.screenshot({ path: `${directory}/storage-dialog-${width}.png`, fullPage: false });
    await cancel.click(); report.widths.push(width);
  }
  check('production CSS keeps storage and modal within phone/tablet/desktop viewports');
  await remove.click(); await page.getByRole('button', { name: 'Confirmer la suppression', exact: true }).click();
  await page.getByText('Lieu supprimé. L’historique des réceptions est conservé.', { exact: true }).waitFor();
  assert.equal(await remove.count(), 0);
  check('confirmed removal updates the list and leaves an enduring status message');
  await page.evaluate(() => globalThis.window.dispatchEvent(new globalThis.Event('offline')));
  await page.getByRole('heading', { name: 'Accès individuel', exact: true }).waitFor();
  assert.equal(await page.getByRole('alertdialog').count(), 0);
  check('access lock unmounts private form and portal content');
  assert.deepEqual(errors, []); report.passed = true;
} finally {
  await mkdir(directory, { recursive: true }); await writeFile(directory + '/browser.json', JSON.stringify({ ...report, pageErrors: errors }, null, 2) + '\n');
  await browser?.close();
  if (child.exitCode === null) { child.kill('SIGTERM'); await Promise.race([once(child, 'exit'), pause(3000).then(() => { if (child.exitCode === null) child.kill('SIGKILL'); })]); }
  await new Promise(resolve => server.close(resolve));
}
