import { readFileSync } from 'node:fs';
import { checkBranchPolicy } from './branch-policy.mjs';
try {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request' || !process.env.GITHUB_REPOSITORY || !process.env.GITHUB_TOKEN) throw new Error('Missing GitHub pull request context.');
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  await checkBranchPolicy(event.pull_request, process.env.GITHUB_REPOSITORY, process.env.GITHUB_TOKEN);
  console.log('Branch policy passed.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
