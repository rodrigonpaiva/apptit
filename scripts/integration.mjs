import { loadLocalEnv, run, safeFailure, serviceEnv } from './lib.mjs';
try {
  loadLocalEnv();
  await run(process.execPath, ['--test', 'tests/integration/quantity-draft.test.mjs'], { env: serviceEnv('kitchen') });
} catch { safeFailure(); }
