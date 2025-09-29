#!/usr/bin/env node
const { execSync } = require('node:child_process');
const name = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const ok = /^(feature|release|hotfix)\/[a-z0-9._-]+$/i.test(name) || name === 'develop' || name === 'main';
if (!ok) {
  console.error(`❌ Invalid branch name "${name}". Use feature/*, release/*, hotfix/*, or develop/main.`);
  process.exit(1);
}
