# Repository workflow

- Start feature work from an up-to-date `dev`, using `feature/<package>-<topic>`; use `fix/`, `chore/`, `docs/` or `deps/` for the corresponding bounded changes.
- Never develop or commit directly on `main` or `dev`. Preserve unrelated local changes.
- Open implementation PRs into `dev`. Run the applicable checks and integration smoke; CI must pass before merge.
- Promote only this repository's `dev` into `main`, after push CI passes on the exact dev head and promotion PR checks pass. Preserve ancestry with a merge commit for dev → main; do not squash/rebase promotions.
- Do not force-push, delete main/dev, bypass hooks/checks or treat missing/skipped test evidence as a pass.
- `npm run git:setup` installs the local direct-push guard. GitHub server-side protections are unavailable on the current private-repository plan; local hooks/Actions are not equivalent enforcement. Report that limitation accurately.
- See `docs/development/branch-workflow.md` for setup, merge flow and protection configuration when available.
