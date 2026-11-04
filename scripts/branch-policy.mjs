import { URLSearchParams } from 'node:url';
export function validatePullRequest(pr, repository) {
  if (!pr?.head?.sha || !pr.base?.ref || !pr.head?.ref) throw new Error('Missing pull request context.');
  if (pr.base.ref === 'dev') {
    if (!/^(feature|fix|chore|docs|deps)\/[a-z0-9][a-z0-9.-]*$/.test(pr.head.ref)) {
      throw new Error('Changes to dev must come from a named feature/fix/chore/docs/deps branch.');
    }
    return 'feature';
  }
  if (pr.base.ref !== 'main' || pr.head.ref !== 'dev' || pr.head.repo?.full_name?.toLowerCase() !== repository.toLowerCase()) {
    throw new Error('Only this repository’s dev branch may target main.');
  }
  return 'promotion';
}
export async function checkBranchPolicy(pr, repository, token, request = fetch) {
  const route = validatePullRequest(pr, repository);
  if (route === 'feature') return;
  const url = new URL(`https://api.github.com/repos/${repository}/actions/workflows/ci.yml/runs`);
  url.search = new URLSearchParams({ branch: 'dev', event: 'push', head_sha: pr.head.sha, per_page: '100' }).toString();
  const response = await request(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error('Could not verify the dev push CI; promotion is blocked.');
  const body = await response.json();
  const run = body.workflow_runs?.filter(run => run.head_sha === pr.head.sha && run.head_branch === 'dev' && run.event === 'push')
    .sort((a, b) => b.id - a.id)[0];
  if (!run || run.status !== 'completed' || run.conclusion !== 'success') {
    throw new Error('The exact dev commit needs a successful push CI before promotion. Wait for dev CI, then rerun this check.');
  }
}
