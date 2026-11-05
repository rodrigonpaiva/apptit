import { execFileSync } from 'node:child_process';
import { root } from './lib.mjs';
execFileSync('git', ['config', '--local', 'core.hooksPath', '.githooks'], { cwd: root, stdio: 'inherit' });
console.log('Local pre-push hook configured: direct pushes to main/dev are blocked.');
