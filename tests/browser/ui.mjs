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
const { chromium } = await import(
  process.argv[2] ? pathToFileURL(path.resolve(process.argv[2])).href : 'playwright'
);
const site = {
  tenantId: '11111111-1111-4111-8111-111111111111',
  siteId: '22222222-2222-4222-8222-222222222222',
  name: 'Restaurant UI synthétique',
  timeZone: 'Europe/Paris',
  role: 'chef',
  membershipVersion: 1,
  capabilities: [
    'site.read',
    'catalogue.read',
    'receipt.draft.read',
    'receipt.draft.write',
    'storage.location.manage',
  ],
};
const secondSite = {
  ...site,
  siteId: '66666666-6666-4666-8666-666666666666',
  name: 'Restaurant B UI synthétique',
  role: 'cook',
  capabilities: ['site.read', 'catalogue.read'],
};
const profile = {
  user: { id: '33333333-3333-4333-8333-333333333333', login: 'ui@apptit.test', name: 'Chef UI' },
  selectedSite: site,
  sites: [site, secondSite],
  expiresAt: '2099-01-01T00:00:00Z',
};
const reference = {
  productId: '44444444-4444-4444-8444-444444444444',
  presentationId: '55555555-5555-4555-8555-555555555555',
  presentationVersion: 1,
};
const receiptAttempts = [],
  recorded = new Map();
let catalogueRows = [],
  catalogueFailure = false,
  catalogueGate,
  catalogueHasMore = false;
let loginFails = false,
  logoutFails = false,
  loginCalls = 0,
  lookupCalls = 0;
const catalogueScopes = [];
let loseReceiptAck = false;
let rows = [],
  saveCount = 0,
  failSave = false,
  delayedSave;
const gatewayPort = Number(process.env.GATEWAY_PORT ?? 4000),
  webPort = Number(process.env.UI_TEST_PORT ?? 3100);
assert.ok(gatewayPort !== webPort);
const server = http.createServer(async (request, response) => {
  const parts = [];
  for await (const chunk of request) parts.push(chunk);
  const input = parts.length ? JSON.parse(Buffer.concat(parts)) : {};
  const send = (value, status = 200) => {
    response.writeHead(status, { 'content-type': 'application/json' });
    response.end(JSON.stringify(value));
  };
  switch (request.url) {
    case '/session/current':
      return send(profile);
    case '/session/csrf':
      return send({ csrfToken: 'synthetic-ui-only' });
    case '/session/login':
      loginCalls++;
      return loginFails ? send({ code: 'INVALID_CREDENTIALS' }, 401) : send(profile);
    case '/session/logout':
      return logoutFails ? send({ code: 'DEPENDENCY_UNAVAILABLE' }, 503) : send({ success: true });
    case '/session/site':
      profile.selectedSite = profile.sites.find((value) => value.siteId === input.siteId);
      return send(profile);
    case '/graphql':
      if (input.query.includes('productLookup')) {
        lookupCalls++;
        return send({ code: 'DEPENDENCY_UNAVAILABLE' }, 503);
      }
      catalogueScopes.push(input.variables.input);
      if (catalogueGate) await catalogueGate;
      if (catalogueFailure) return send({ code: 'DEPENDENCY_UNAVAILABLE' }, 503);
      return send({
        data: {
          catalogue: {
            items:
              input.variables.input.siteId === secondSite.siteId
                ? [
                    {
                      id: 'site-b-product',
                      name: 'Produit du restaurant B',
                      presentation: 'Paquet UI',
                      barcode: null,
                    },
                  ]
                : catalogueRows,
            hasMore: catalogueHasMore,
          },
        },
      });
    case '/storage-locations/list':
      await pause(150);
      return send(rows);
    case '/storage-locations/save': {
      saveCount++;
      if (delayedSave) await delayedSave;
      if (failSave) return send({ code: 'VERSION_CONFLICT' }, 409);
      const row = { ...input, version: input.expectedVersion + 1 };
      rows = [...rows.filter((value) => value.id !== row.id), row];
      return send(row, 201);
    }
    case '/storage-locations/remove':
      rows = rows.filter((value) => value.id !== input.id);
      return send({ id: input.id }, 201);
    case '/receipts/locations':
      return send(rows);
    case '/receipts/list':
      return send(
        [...recorded.values()].map((value) => ({
          id: value.draft.id,
          version: value.draft.version,
          recordedAt: value.draft.recordedAt,
          lineCount: value.items.length,
        })),
      );
    case '/receipts/resolve':
      return send({ reference });
    case '/receipts/save': {
      receiptAttempts.push(input);
      let snapshot = recorded.get(input.command.operationId);
      if (!snapshot) {
        snapshot = {
          draft: {
            id: input.command.receiptId,
            version: input.command.expectedVersion + 1,
            scope: input.command.scope,
            state: 'draft',
            data: input.command.payload,
            recordedAt: new Date().toISOString(),
          },
          items: input.items,
        };
        recorded.set(input.command.operationId, snapshot);
      }
      if (loseReceiptAck) {
        loseReceiptAck = false;
        return send({ code: 'OUTCOME_UNCERTAIN' }, 503);
      }
      return send(snapshot, 201);
    }
    case '/evidence/list':
      return send({ mode: 'disabled', items: [], mediaTypes: ['image/png'], maxBytes: 2097152 });
    case '/observations/list':
      return send({ mode: 'disabled', profiles: [], entries: [] });
    default:
      return send({ code: 'UI_FIXTURE_ROUTE_NOT_FOUND' }, 404);
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(gatewayPort, '127.0.0.1', resolve);
});
const child = spawn(
  process.execPath,
  [
    '../../node_modules/next/dist/bin/next',
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    String(webPort),
  ],
  {
    cwd: 'apps/web',
    env: { ...process.env, GATEWAY_PORT: String(gatewayPort), NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
let output = '';
for (const stream of [child.stdout, child.stderr])
  stream.on('data', (value) => {
    output = (output + value).slice(-4000);
  });
let browser;
const directory = '.local/qa-ui',
  report = {
    passed: false,
    transport: 'in-memory synthetic fixture; real production Next application',
    checks: [],
    widths: [],
  },
  errors = [];
const check = (name) => {
  report.checks.push(name);
  console.log('PASS: ' + name);
};
try {
  const origin = `http://127.0.0.1:${webPort}`;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Next exited: ' + output);
    try {
      ready = (await fetch(origin, { signal: AbortSignal.timeout(500) })).ok;
    } catch {
      /* bounded startup */
    }
    if (ready) break;
    await pause(250);
  }
  assert.ok(ready, 'Production Next server became ready');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(origin + '/workspace#storage');
  await page.getByText('Aucun lieu configuré pour ce restaurant.', { exact: true }).waitFor();
  const save = page.getByRole('button', { name: 'Enregistrer le lieu', exact: true });
  await save.click();
  await page.getByText('Renseignez le nom du lieu.', { exact: true }).waitFor();
  assert.equal(saveCount, 0);
  assert.equal(
    await page.getByLabel('Nom du lieu', { exact: true }).getAttribute('aria-invalid'),
    'true',
  );
  check('required fields show associated errors without sending a command');
  const name = page.getByLabel('Nom du lieu', { exact: true });
  await name.fill('Économat UI synthétique');
  await page.getByLabel('Catégorie', { exact: true }).selectOption('dry');
  let finishSave;
  delayedSave = new Promise((resolve) => {
    finishSave = resolve;
  });
  await save.click();
  await page.getByRole('button', { name: 'Enregistrement…', exact: true }).waitFor();
  assert.equal(await name.isDisabled(), true);
  finishSave();
  delayedSave = undefined;
  await page.getByText('Lieu enregistré pour ce restaurant.', { exact: true }).waitFor();
  assert.equal(saveCount, 1);
  assert.equal(await name.inputValue(), '');
  check('save disables the form while pending and resets only after confirmed response');
  const edit = page.getByRole('button', { name: 'Modifier', exact: true });
  await edit.click();
  assert.equal(await name.inputValue(), 'Économat UI synthétique');
  failSave = true;
  await name.fill('Modification non confirmée');
  await save.click();
  await page
    .getByText('Opération non confirmée. Rechargez les lieux avant de réessayer.', { exact: true })
    .waitFor();
  assert.equal(await name.inputValue(), 'Modification non confirmée');
  assert.equal(await save.isDisabled(), true);
  failSave = false;
  await page.getByRole('button', { name: 'Recharger les lieux', exact: true }).click();
  await save.waitFor();
  await page.waitForFunction(() => !globalThis.document.querySelector('#storage-name').disabled);
  assert.equal(await name.inputValue(), 'Économat UI synthétique');
  check('conflict preserves typed values, blocks resubmit and reload restores server version');
  const remove = page.getByRole('button', {
    name: 'Supprimer Économat UI synthétique',
    exact: true,
  });
  await remove.click();
  const dialog = page.getByRole('alertdialog');
  await dialog.waitFor();
  const cancel = page.getByRole('button', { name: 'Conserver ce lieu', exact: true });
  const contrast = await cancel.evaluate((element) => {
    const style = globalThis.getComputedStyle(element);
    const luminance = (value) => {
      const rgb = value
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const s = channel / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const text = luminance(style.color),
      background = luminance(style.backgroundColor);
    return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
  });
  assert.ok(contrast >= 4.5, 'outline control meets normal text contrast');
  assert.equal(
    await cancel.evaluate((element) => element === globalThis.document.activeElement),
    true,
  );
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    assert.equal(
      await dialog.evaluate((element) => element.contains(globalThis.document.activeElement)),
      true,
    );
  }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(
    (element) => element === globalThis.document.activeElement,
    await remove.elementHandle(),
  );
  check(
    'destructive dialog focuses cancel, traps keyboard focus, closes on Escape and restores trigger',
  );
  await mkdir(directory, { recursive: true });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await remove.click();
    await dialog.waitFor();
    assert.ok(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1,
      ),
    );
    const box = await dialog.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
    await page.screenshot({ path: `${directory}/storage-dialog-${width}.png`, fullPage: false });
    await cancel.click();
    await page.waitForFunction(
      (element) => element === globalThis.document.activeElement,
      await remove.elementHandle(),
    );
    report.widths.push(width);
  }
  check('production CSS keeps storage and modal within phone/tablet/desktop viewports');
  await remove.click();
  await page.getByRole('button', { name: 'Confirmer la suppression', exact: true }).click();
  await page
    .getByText('Lieu supprimé. L’historique des réceptions est conservé.', { exact: true })
    .waitFor();
  assert.equal(await remove.count(), 0);
  check('confirmed removal updates the list and leaves an enduring status message');
  await page.evaluate(() => globalThis.window.dispatchEvent(new globalThis.Event('offline')));
  await page.getByRole('heading', { name: 'Accès individuel', exact: true }).waitFor();
  assert.equal(await page.getByRole('alertdialog').count(), 0);
  check('access lock unmounts private form and portal content');
  await page.getByRole('button', { name: 'Vérifier l’accès', exact: true }).click();
  await page.getByRole('link', { name: 'Réception', exact: true }).click();
  await page.getByRole('button', { name: 'Ajouter sans code', exact: true }).click();
  const line = page.locator('fieldset.receipt-line').first();
  await line.getByLabel('Nom du produit', { exact: true }).fill('Produit UI synthétique');
  await line.getByLabel('Présentation observée', { exact: true }).fill('Sac de 5 kg');
  await line.getByLabel('Lot réel', { exact: true }).fill('UI-LOT-A');
  await line.getByLabel('Mode de saisie', { exact: true }).selectOption('packs');
  await line.getByLabel('Nombre de conditionnements', { exact: true }).fill('10');
  await line.getByLabel('Contenu par conditionnement', { exact: true }).fill('5');
  await line.getByLabel('Unité', { exact: true }).selectOption('kg');
  await line
    .getByLabel('Nombre et contenu par conditionnement vérifiés sur les unités livrées.', {
      exact: true,
    })
    .check();
  await line.getByText('50 kg', { exact: true }).waitFor();
  const receiving = page.locator('#receiving');
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1,
      ),
    );
  }
  check('shared receiving controls preserve explicit pack conversion and responsive layout');
  loseReceiptAck = true;
  await page.getByRole('button', { name: 'Enregistrer le brouillon', exact: true }).click();
  await receiving
    .getByText(
      'Enregistrement non confirmé. Réessayez la même opération ou rechargez le brouillon avant de continuer.',
      { exact: true },
    )
    .waitFor();
  assert.equal(await page.locator('[data-sonner-toast]').count(), 0);
  assert.equal(await line.getByLabel('Nom du produit', { exact: true }).isDisabled(), true);
  await page.setViewportSize({ width: 320, height: 1000 });
  assert.ok(
    await page.evaluate(
      () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1,
    ),
  );
  await page.getByRole('button', { name: 'Réessayer le même enregistrement', exact: true }).click();
  await receiving
    .getByText('Brouillon enregistré — version 1. Aucun stock créé.', { exact: true })
    .waitFor();
  assert.equal(receiptAttempts.length, 2);
  assert.equal(receiptAttempts[0].command.operationId, receiptAttempts[1].command.operationId);
  assert.deepEqual(receiptAttempts[0], receiptAttempts[1]);
  assert.equal(recorded.size, 1);
  assert.equal(receiptAttempts[0].command.payload.lines[0].received.value.amount, '50000');
  await page
    .locator('[data-sonner-toast]')
    .getByText('Brouillon enregistré. Aucun stock créé.', { exact: true })
    .waitFor();
  check(
    'unconfirmed receipt response shows no success; retry preserves exact command and confirmed success notification',
  );
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1,
      ),
    );
    await receiving.screenshot({ path: `${directory}/receiving-${width}.png` });
  }
  await page.evaluate(() => globalThis.window.dispatchEvent(new globalThis.Event('offline')));
  await page.getByRole('heading', { name: 'Accès individuel', exact: true }).waitFor();
  assert.equal(await page.locator('[data-sonner-toast]').count(), 0);
  await page.getByRole('button', { name: 'Vérifier l’accès', exact: true }).click();
  await page.getByRole('heading', { name: 'Brouillon de réception', exact: true }).waitFor();
  assert.equal(await page.locator('[data-sonner-toast]').count(), 0);
  assert.equal(await page.locator('fieldset.receipt-line').count(), 0);
  check('private notification provider clears on lock and cannot replay previous context success');
  // Login UI uses only synthetic credentials against the explicit transport fixture.
  await page.goto(origin + '/login');
  const login = page.getByLabel('Identifiant', { exact: true });
  const password = page.getByLabel('Mot de passe', { exact: true });
  await login.fill('ui@apptit.test');
  await password.fill('short');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  assert.equal(loginCalls, 0);
  await password.fill('Synthetic-UI-password-123');
  await page.getByRole('button', { name: 'Afficher le mot de passe', exact: true }).click();
  assert.equal(await password.getAttribute('type'), 'text');
  await page.getByRole('button', { name: 'Masquer le mot de passe', exact: true }).click();
  assert.equal(await password.getAttribute('type'), 'password');
  loginFails = true;
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  const loginError = page.getByRole('alert');
  await loginError.getByText('Identifiant ou mot de passe incorrect.', { exact: true }).waitFor();
  assert.equal(await password.inputValue(), '');
  await page.waitForFunction(() => globalThis.document.activeElement?.id === 'login-error');
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1,
      ),
    );
    if ([320, 1440].includes(width))
      await page.screenshot({ path: `${directory}/login-${width}.png`, fullPage: true });
  }
  check(
    'login retains native validation, accessible password visibility and focused error feedback with cleared credentials',
  );
  loginFails = false;
  catalogueFailure = true;
  await password.fill('Synthetic-UI-password-123');
  await password.press('Enter');
  await page.waitForURL('**/workspace');
  await page.getByRole('heading', { name: 'Catalogue indisponible', exact: true }).waitFor();
  assert.equal(
    await page.getByText('Aucune référence pour ce restaurant', { exact: true }).count(),
    0,
  );
  catalogueFailure = false;
  catalogueHasMore = true;
  catalogueRows = [
    {
      id: 'ui-flour',
      name: 'Farine UI',
      presentation: 'Sac de 5 kg',
      barcode: '0012345678905',
      reviewState: 'unreviewed',
    },
    { id: 'ui-lentils', name: 'Lentilles UI', presentation: 'Paquet de 1 kg', barcode: null },
  ];
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  const search = page.getByLabel('Rechercher par nom, présentation ou code-barres', {
    exact: true,
  });
  await search.waitFor();
  await page.waitForFunction(() => globalThis.document.activeElement?.id === 'product-search');
  await search.fill('0012345678905');
  assert.equal(await page.locator('.product-card').count(), 1);
  await search.fill('unmatched-product');
  await page.getByRole('heading', { name: 'Aucun résultat', exact: true }).waitFor();
  await page
    .locator('.catalogue-search')
    .getByRole('button', { name: 'Effacer la recherche', exact: true })
    .click();
  assert.equal(await search.inputValue(), '');
  await page.waitForFunction(() => globalThis.document.activeElement?.id === 'product-search');
  assert.equal(await page.locator('.product-card').count(), 2);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1,
      ),
    );
    if ([320, 1440].includes(width))
      await page.screenshot({ path: `${directory}/catalogue-${width}.png`, fullPage: true });
  }
  check(
    'catalogue distinguishes transport failure and no search results, preserves textual barcodes and restores search focus',
  );
  let finishCatalogue;
  catalogueGate = new Promise((resolve) => {
    finishCatalogue = resolve;
  });
  await page.reload();
  await page.getByRole('heading', { name: 'Chargement des produits…', exact: true }).waitFor();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(
    await page
      .locator('[data-slot="skeleton"]')
      .first()
      .evaluate((element) => globalThis.getComputedStyle(element).animationName),
    'none',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  assert.equal(
    await page.getByText('Aucune référence pour ce restaurant', { exact: true }).count(),
    0,
  );
  catalogueRows = [];
  catalogueHasMore = false;
  finishCatalogue();
  catalogueGate = undefined;
  await page
    .getByRole('heading', { name: 'Aucune référence pour ce restaurant', exact: true })
    .waitFor();
  check('loading skeleton is distinct from a confirmed empty catalogue');
  await page.getByRole('link', { name: 'Identifier un produit', exact: true }).click();
  await page.getByRole('heading', { name: 'Identifier un produit', exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole('link', { name: 'Identifier un produit', exact: true })
      .getAttribute('aria-current'),
    'page',
  );
  const skip = page.getByRole('link', { name: 'Aller au contenu', exact: true });
  await skip.focus();
  await skip.click();
  await page.waitForFunction(() => globalThis.document.activeElement?.id === 'workspace-content');
  await page.getByRole('heading', { name: 'Identifier un produit', exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole('link', { name: 'Identifier un produit', exact: true })
      .getAttribute('aria-current'),
    'page',
  );
  check('keyboard skip link focuses main content without changing the active feature');
  await page.getByLabel('Code-barres', { exact: true }).fill('0012345678905');
  await page.getByRole('button', { name: 'Rechercher le produit', exact: true }).click();
  await page
    .getByText('Identification indisponible. Vous pouvez continuer manuellement.', { exact: true })
    .waitFor();
  assert.equal(lookupCalls, 1);
  await page.evaluate(() => {
    Object.defineProperty(globalThis.navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => {
        throw new globalThis.DOMException('Synthetic denial', 'NotAllowedError');
      },
    });
  });
  await page.getByRole('button', { name: 'Lire avec la caméra', exact: true }).click();
  await page
    .getByText('Caméra inaccessible ou permission refusée. Saisissez le code manuellement.', {
      exact: true,
    })
    .waitFor();
  await page.getByRole('button', { name: 'Fermer la caméra', exact: true }).click();
  await page
    .getByRole('button', { name: 'Saisir sans code / depuis l’étiquette', exact: true })
    .click();
  await page.getByLabel('Nom observé', { exact: true }).fill('Produit manuel UI');
  await page.getByLabel('Présentation observée (facultatif)', { exact: true }).fill('Sac UI');
  await page
    .getByLabel('J’ai comparé le nom, la marque et la présentation à l’emballage réel.', {
      exact: true,
    })
    .check();
  await page.getByRole('button', { name: 'Prévisualiser la référence', exact: true }).click();
  await page.locator('.lookup-preview').getByText('Produit manuel UI', { exact: true }).waitFor();
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1,
      ),
    );
    const navigation = page.getByRole('navigation', { name: 'Navigation du restaurant' });
    for (const link of await navigation.getByRole('link').all()) {
      const box = await link.boundingBox();
      assert.ok(box.height >= 48 && box.width >= 48);
    }
    if ([320, 1440].includes(width))
      await page.screenshot({ path: `${directory}/identification-${width}.png`, fullPage: true });
  }

  await page.getByRole('button', { name: 'Préparer la réception', exact: true }).click();
  await page.getByRole('heading', { name: 'Brouillon de réception', exact: true }).waitFor();
  assert.equal(
    await page.getByLabel('Nom du produit', { exact: true }).inputValue(),
    'Produit manuel UI',
  );
  assert.equal(recorded.size, 1);
  check(
    'lookup and controlled camera denial retain manual identification and explicit unsaved receipt preparation',
  );
  await page.getByRole('link', { name: 'Catalogue produits', exact: true }).click();
  await page.getByLabel('Restaurant actif', { exact: true }).selectOption(secondSite.siteId);
  await page.getByRole('heading', { name: 'Produit du restaurant B', exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Réception', exact: true }).count(), 0);
  assert.equal(await page.getByRole('link', { name: 'Lieux de stockage', exact: true }).count(), 0);
  assert.equal(await page.getByText('Produit manuel UI', { exact: true }).count(), 0);
  assert.equal(catalogueScopes.at(-1).siteId, secondSite.siteId);
  check('site switch requests the selected scope and hides unavailable navigation capabilities');
  logoutFails = true;
  await page
    .getByRole('button', { name: 'Se déconnecter / changer d’utilisateur', exact: true })
    .click();
  await page.getByRole('button', { name: 'Réessayer la déconnexion', exact: true }).waitFor();
  assert.equal(await page.locator('.product-card').count(), 0);
  assert.equal(await page.getByLabel('Restaurant actif', { exact: true }).count(), 0);
  logoutFails = false;
  await page.getByRole('button', { name: 'Réessayer la déconnexion', exact: true }).click();
  await page.waitForURL('**/login');
  assert.equal(await page.getByLabel('Mot de passe', { exact: true }).inputValue(), '');
  check('unconfirmed logout keeps the workspace locked until explicit retry succeeds');
  assert.deepEqual(errors, []);
  report.passed = true;
} finally {
  await mkdir(directory, { recursive: true });
  await writeFile(
    directory + '/browser.json',
    JSON.stringify({ ...report, pageErrors: errors }, null, 2) + '\n',
  );
  await browser?.close();
  if (child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([
      once(child, 'exit'),
      pause(3000).then(() => {
        if (child.exitCode === null) child.kill('SIGKILL');
      }),
    ]);
  }
  await new Promise((resolve) => server.close(resolve));
}
