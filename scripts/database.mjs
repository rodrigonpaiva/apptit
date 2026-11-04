import { loadLocalEnv, root, run, safeFailure, serviceEnv } from './lib.mjs';
try {
  loadLocalEnv();
  const action = process.argv[2];
  const selected = process.argv[3];
  const services = selected ? [selected] : ['identity', 'kitchen'];
  if (!['generate', 'validate', 'migrate', 'seed'].includes(action) || services.some(s => !['identity', 'kitchen'].includes(s))) throw new Error('Unsupported database action.');
  for (const service of services) {
    const env = serviceEnv(service);
    if (action === 'seed') {
      await run(process.execPath, [`services/${service}/dist/seed.js`], { env });
    } else {
      const args = [action === 'migrate' ? 'migrate' : action];
      if (action === 'migrate') args.push('deploy');
      args.push('--config', `services/${service}/prisma.config.ts`);
      await run(process.execPath, [`${root}node_modules/prisma/build/index.js`, ...args], { env });
    }
  }
} catch { safeFailure(); }
