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

## Active native rulesets

On 2026-11-05 the owner changed the repository to public. GitHub then accepted both rulesets as active, and their configuration plus effective branch rules were read back and compared to the prepared payloads:

- [Main ruleset 26610391](https://github.com/rodrigonpaiva/apptit/rules/26610391)
- [Dev ruleset 26610401](https://github.com/rodrigonpaiva/apptit/rules/26610401)

Both require PRs, `foundation` and `branch-policy` from GitHub Actions app 15368, an up-to-date base and resolved review conversations. Deletion and force pushes are blocked. There are no bypass actors, including administrator roles/apps. Main permits merge commits only; dev permits merge commits or squash. No linear-history requirement conflicts with promotion ancestry.

The repository has one human maintainer, so no additional approval is mandatory yet; PR and CI requirements remain enforced. Add an independent-review requirement when an actual second reviewer is available. Repository administrators can still edit ruleset configuration; an empty bypass list does not remove their settings authority.

[Payloads, rationale and safe update/readback procedure](github-rulesets.md) are stored in this repository. Do not create duplicate rulesets or replace active rules blindly. Feature-to-main denial and exact-dev-push-CI gating rely on the required branch-policy workflow, not a source-branch selector in the ruleset itself.

## Local guard and historical limitation

`npm run git:setup` installs `.githooks/pre-push` and blocks local direct updates/deletions of main/dev. Each clone must install it. Native rulesets now add server-side enforcement independently of the hook.

Before the owner's visibility change, GitHub returned 403 for rulesets/branch protection on this private repository's plan. That limitation was observed on 2026-11-04 and 2026-11-05; it is historical, not the current public-repository state. No subscription was purchased by the assistant. Existing delivery records describing that prior state remain historical evidence.

The SP1-02 main baseline had a passing [push CI run 41868318492](https://github.com/rodrigonpaiva/apptit/actions/runs/41868318492); enabling rulesets does not change main's code or promote dev. Root AGENTS.md records the current workflow. These local configuration/documentation changes remain on chore/github-branch-rulesets until committed/reviewed.
