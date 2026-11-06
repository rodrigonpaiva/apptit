import { loadLocalEnv, run, safeFailure, serviceEnv } from './lib.mjs';
try {
  loadLocalEnv();
  await run(process.execPath, ['--test', 'tests/integration/quantity-draft.test.mjs', 'tests/integration/catalogue.test.mjs', 'tests/integration/product-lookup.test.mjs'], { env: serviceEnv('kitchen') });
  await run(process.execPath, ['--test', 'tests/integration/sessions.test.mjs'], { env: serviceEnv('identity') });
} catch { safeFailure(); }
