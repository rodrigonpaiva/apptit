# GitHub branch rulesets — active and verified

Date: 2026-11-05. Repository: `rodrigonpaiva/apptit` (public after the owner’s visibility change).

**Status: active native protection, created and verified on 2026-11-05.** The owner made the repository public after the private-plan API returned 403. GitHub accepted both POST requests, and independent GET readback confirmed enforcement=active, exact targets, all configured rule parameters and empty bypass lists. The effective rules endpoints for main/dev also returned all four intended rule types with the corresponding ruleset IDs.

| Branch | Active GitHub ruleset | Tracked payload |
| --- | --- | --- |
| main | [26610391](https://github.com/rodrigonpaiva/apptit/rules/26610391) | [main.json](../../.github/rulesets/main.json) |
| dev | [26610401](https://github.com/rodrigonpaiva/apptit/rules/26610401) | [dev.json](../../.github/rulesets/dev.json) |

PR #5 remained OPEN/CLEAN with both required checks passing after activation. No branch deletion, force push, direct protected-branch update or PR merge was used as a test. No subscription was purchased or visibility changed by the assistant.

## Policy

| Rule | Main | Dev |
| --- | --- | --- |
| Exact target | refs/heads/main | refs/heads/dev |
| Pull request required | Yes | Yes |
| Required checks | branch-policy + foundation | branch-policy + foundation |
| Expected check issuer | GitHub Actions, integration ID 15368 | Same |
| Up-to-date base required | Yes | Yes |
| Unresolved review conversations | Block merge | Block merge |
| Force push / deletion | Blocked | Blocked |
| Bypass actors, including admin roles/apps | None | None |
| Merge methods | Merge commit only | Merge commit or squash |
| Required approvals initially | 0: one human maintainer | 0: one human maintainer |

GitHub API confirmed only `rodrigonpaiva` as a collaborator. Requiring a different human's approval would lock out this single-maintainer workflow; a PR author cannot supply independent approval to their own PR. CI and PR requirements still apply. When an actual second reviewer is added, raise required_approving_review_count to 1 and consider require_last_push_approval and Code Owners after verifying the reviewer can approve. An AI/local inspection is not counted as an independent approval.

The required `branch-policy` job enforces feature/fix/chore/docs/deps → dev and this repository's dev → main. Promotion also requires successful **push CI on the exact dev head**, not only a prior feature PR run. The ruleset itself does not select the PR's source branch; enforcement combines the required check with the existing workflow. On 2026-11-05 the two real CI checks were verified as emitted by GitHub Actions app ID 15368.

Merge commits are required on main to retain dev ancestry. After a promotion, sync main back into dev through a sync topic PR when needed before the next promotion; strict checks require the latest base. Do not enable linear history, which conflicts with this merge policy. Do not use restrict-updates with an empty bypass list: it would block the intended update/merge path. Deletion and force pushes are blocked explicitly instead.

Signed commits are not required by these payloads: contributor/bot keys and the existing unsigned incoming history need a separate rollout, without rewriting protected history. Merge queue, deployment checks, CodeQL/coverage and secret-scanning rules are not added as fictitious requirements; they need the corresponding available plan, configured services and actual check evidence first.

## Safe update or import in another eligible repository

The current public repository is eligible. A future personal private repository requires GitHub Pro (or an applicable organization plan). Do not change visibility/billing as part of a ruleset update. See [GitHub ruleset availability](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).

1. Inspect **all** existing repository/parent rulesets before writing. This repository already has the two IDs above: review and update the matching ID rather than POSTing duplicates or weakening existing rules.

```sh
gh api repos/rodrigonpaiva/apptit/rulesets
```

2. For the current repository, use Settings → Rules → Rulesets to edit the existing IDs or the documented PUT endpoint. To apply a reviewed payload to an existing ID:

```sh
gh api --method PUT repos/rodrigonpaiva/apptit/rulesets/26610391 \
  -H 'X-GitHub-Api-Version: 2026-03-10' \
  --input .github/rulesets/main.json
```

Only in an eligible repository with no matching ruleset, import/create via the documented API:

```sh
gh api --method POST repos/rodrigonpaiva/apptit/rulesets \
  -H 'X-GitHub-Api-Version: 2026-03-10' \
  --input .github/rulesets/main.json

gh api --method POST repos/rodrigonpaiva/apptit/rulesets \
  -H 'X-GitHub-Api-Version: 2026-03-10' \
  --input .github/rulesets/dev.json
```

3. Read back each created/updated ruleset, compare its complete targets/rules/bypass list to the payloads, then inspect the active rules for each branch:

```sh
gh api repos/rodrigonpaiva/apptit/rules/branches/main
gh api repos/rodrigonpaiva/apptit/rules/branches/dev
```

4. Check PR mergeability and required checks against actual open PRs. Do not test deletion/force push against main/dev, bypass controls or merge a feature into main. Only report protection as active after successful readback; a file, successful local test or plan upgrade alone is not enforcement evidence.

## Verification and limits

The local pre-push hook remains defense in depth; active server rules apply independently of this checkout. Empty bypass lists apply to administrators too, but administrators retain authority to edit settings. A required check proves its configured result, not exhaustive correctness of every change.

Local JSON invariants and documentation links passed. GitHub accepted the payload schema, and server readback confirmed all intended rules. The API adds default review-related fields; supplied parameters were compared individually without dropping those defaults. No destructive branch action or bypass was attempted.

These payloads/documentation are recorded on chore/github-branch-rulesets at the user’s commit/push request. Their activation on GitHub is already effective and does not depend on merging these files.

References: [available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [REST create/update schema](https://docs.github.com/en/rest/repos/rules#create-a-repository-ruleset), [branch workflow](branch-workflow.md).
