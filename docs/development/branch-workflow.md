# Branch workflow

Date: 2026-11-04. Direction: isolated feature work → integration/testing on `dev` → stable `main`.

| Branch | Purpose | Entry |
| --- | --- | --- |
| `main` | Stable tested baseline | Promotion PR from this repository's `dev` only |
| `dev` | Integration and complete test execution | PR from `feature/*`, `fix/*`, `chore/*`, `docs/*` or `deps/*` |
| Topic branches | One feature, fix or bounded maintenance change | Start from current `origin/dev` |

Branch names use lowercase letters, numbers, dots and hyphens after one type prefix. Current Sprint 1 verification uses `feature/sp1-06-foundation-verification`. After its integration, the next package can start as `feature/sp2-01-receiving-contracts`.

## Day-to-day sequence

```sh
git fetch origin
git switch dev
git pull --ff-only
git switch -c feature/sp2-01-receiving-contracts
npm run git:setup
```

Implement and verify the package; commit/push only the topic branch, then open a PR with base `dev`. The `foundation` job checks schemas, lint, types, contracts, tests, builds, actual PostgreSQL migrations/repeated seed and integration smoke. The `branch-policy` job checks the source/base route. Resolve failures and review the change before merging to dev. Delete only disposable merged topic branches, never main/dev.

After merge, **wait for push CI on the exact new dev head to pass**. Only then open a `dev` → `main` promotion PR. Its branch-policy job verifies that dev push CI succeeded on that exact SHA, not a prior commit or a feature PR check. A missing, running or failed dev run blocks the check; rerun the promotion check once dev CI finishes. The promotion PR also reruns the complete foundation suite on its merge candidate.

Promotions use a regular **merge commit**, preserving dev ancestry. Do not squash/rebase dev into main, delete dev or rewrite its history. Merge main back into dev through a bounded sync topic PR when needed to keep the integration line current. Features may use squash when that is appropriate to their individual PR history.

## Available safeguards and actual limitation

The latest SP1-02 main push CI passed: [run 41868318492](https://github.com/rodrigonpaiva/apptit/actions/runs/41868318492). This is a passing scaffold baseline, not a guarantee that every future defect is detected.

On 2026-11-04 the GitHub branch-protection API returned **403: Upgrade to GitHub Pro or make this repository public** for this private repository. Its visibility has not been changed, no subscription has been purchased, and native branch protections are **not enabled**. See [GitHub availability](https://docs.github.com/en/rest/branches/branch-protection).

`npm run git:setup` installs `.githooks/pre-push` in this checkout and blocks local direct updates/deletions of main/dev. It does not block GitHub PR merges. Each clone must install the hook; hooks can be bypassed and do not govern other clients/API calls. Actions produce pass/fail evidence, but without server protection they cannot prevent an administrator from ignoring failure or pushing directly. Do not describe this as fully protected branches.

When native protections become available, apply to **both main and dev**:

- Require pull requests; require `foundation` and `branch-policy` checks from GitHub Actions, with branches up to date.
- Enforce for administrators; block force pushes/deletions and require resolved review conversations.
- Do not require an invented second approver in a single-maintainer project; configure reviewer count when actual reviewers are assigned.
- Keep merge commits available for dev-to-main promotion. Do not require linear history on the long-lived integration/promotion branches.

Repository root `AGENTS.md` records this workflow for future work. The initial policy change itself is made on `chore/branch-workflow`, with a PR into dev; main is unchanged until the reviewed integration/promotion flow completes.
