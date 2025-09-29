# Git Flow — Apptit

## Branches
- main: production
- develop: integration (next release)
- feature/*: new work off develop
- release/*: stabilization for version X.Y.Z
- hotfix/*: urgent fixes from main

## Rules
- Start feature: branch from develop → feature/<scope>-<short-desc>
- Finish feature: PR → develop (squash merge)
- Start release: branch from develop → release/<version> (e.g., release/1.3.0)
- Finish release: merge release/* → main (create tag v<version>), then back-merge into develop
- Hotfix: branch from main → hotfix/<version-patch>, then merge into main + develop

## Conventional Commits
Examples:
- feat(api): add menu endpoints
- fix(web): correct auth redirect
- refactor(common): simplify dto mapper
- test(ui): add button stories

## Changesets
- During feature work: optional `npx changeset` to queue bumps
- During release: consolidate bumps on release/*, run `npx changeset version`
- Tag on main: vX.Y.Z

## Branch naming
- feature/<area>-<slug>
- release/<semver>
- hotfix/<semver>
