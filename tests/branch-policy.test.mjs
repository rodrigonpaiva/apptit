import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { checkBranchPolicy, validatePullRequest } from '../scripts/branch-policy.mjs';
const repository = 'rodrigonpaiva/apptit';
const promotion = { base: { ref: 'main' }, head: { ref: 'dev', sha: 'abc123', repo: { full_name: repository } } };
test('feature PR targets dev; direct feature/main, forks named dev and arbitrary source branches are denied', () => {
  assert.equal(validatePullRequest({ ...promotion, base: { ref: 'dev' }, head: { ...promotion.head, ref: 'feature/sp1-03-persistence' } }, repository), 'feature');
  for (const pr of [
    { ...promotion, head: { ...promotion.head, ref: 'feature/sp1-03-persistence' } },
    { ...promotion, head: { ...promotion.head, repo: { full_name: 'other/apptit' } } },
    { ...promotion, base: { ref: 'dev' } },
  ]) assert.throws(() => validatePullRequest(pr, repository));
});
test('promotion requires completed green push CI on the exact dev SHA and rejects missing, stale, failed or running evidence', async () => {
  const green = { id: 1, head_sha: 'abc123', head_branch: 'dev', event: 'push', status: 'completed', conclusion: 'success' };
  for (const runs of [[], [{ ...green, head_sha: 'old' }], [{ ...green, conclusion: 'failure' }], [{ ...green, status: 'in_progress' }], [green, { ...green, id: 2, conclusion: 'failure' }]]) {
    await assert.rejects(checkBranchPolicy(promotion, repository, 'fixture-token', async () => ({ ok: true, json: async () => ({ workflow_runs: runs }) })));
  }
  await assert.rejects(checkBranchPolicy(promotion, repository, 'fixture-token', async () => ({ ok: false })));
  await checkBranchPolicy(promotion, repository, 'fixture-token', async () => ({ ok: true, json: async () => ({ workflow_runs: [green] }) }));
});
test('pre-push protocol blocks protected-branch updates/deletions, including multi-ref pushes', () => {
  const hook = input => spawnSync(process.execPath, ['scripts/pre-push.mjs'], { input, encoding: 'utf8' }).status;
  assert.equal(hook('refs/heads/feature/example abc refs/heads/feature/example 000\n'), 0);
  assert.equal(hook('refs/heads/feature/example abc refs/heads/main def\n'), 1);
  assert.equal(hook('(delete) 000 refs/heads/dev abc\n'), 1);
  assert.equal(hook('refs/heads/feature/example abc refs/heads/feature/example 000\nrefs/heads/dev abc refs/heads/dev def\n'), 1);
});
