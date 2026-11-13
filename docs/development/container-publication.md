# Release container publication

The release workflow publishes `ghcr.io/rodrigonpaiva/apptit-api:<release-tag>` and `ghcr.io/rodrigonpaiva/apptit-web:<release-tag>`. It runs on `release.published` or manually with the exact tag of an already published release. It never creates a tag/release, moves a tag, adds `latest`, overwrites an existing release tag or treats the current branch as a historical release.

## Source and validation

The workflow first checks out publisher tooling at the workflow commit, resolves the requested published release and peels its tag to a commit. A separate clean checkout of that exact commit is the Docker context. Required Dockerfiles, entry points, probes, lockfile and workspace dependencies must exist there; files from the publisher checkout are never overlaid onto older source. Tag identity is checked again immediately before publication.

`containers/Dockerfile` uses the root npm v3 lockfile and every actual workspace manifest, pinned Node 22.22.2 and npm 10.9.7. The API target generates both Prisma clients and compiles the gateway, identity, kitchen and internal packages. One API artifact supports explicit `gateway-api`, `identity`, `kitchen`, `migrate identity|kitchen` and `seed identity|kitchen` roles. The web target builds Next standalone output, static/public files, internal contracts and runtime configuration. Its gateway rewrite is compiled with `GATEWAY_PORT=4000`; changing that port requires rebuilding the web image. Both targets run as `node` and carry OCI source, version and full commit revision labels. `.dockerignore` excludes host configuration, credentials, Git metadata, generated output, dependency directories and local artifacts.

These images retain the application's **synthetic, loopback-only** safety model. They are not a production network/configuration redesign. The smoke harness starts a task-owned PostgreSQL container, runs migrations and seeds twice, then starts identity, kitchen, gateway and web in its network namespace. This lets the existing localhost-only database URLs and HTTP allowlists remain enforced. No host ports are published. Each application receives only its role's credentials; probe credentials are freshly generated from `.env.example`, not copied from a developer's `.env`. Owned containers, anonymous database volume and temporary environment files are removed in `finally`; existing environments and named volumes are untouched.

Before any registry login/push, both images must build and pass migration/initialization, API readiness, web HTTP, inherited authorization/CSRF/site-isolation/photo/observation HTTP smoke, draft/no-stock checks and dependency-unavailable behavior. The probe explicitly saves a receipt as `draft`, verifies the synthetic stock-disabled flag and compares any inventory-related table counts before/after. When SP2-05 exists, it saves pending observations and checks the synthetic/unvalidated profile and `not_activated` disposition. This is container regression evidence, not full Sprint 2 acceptance or validation of real food-safety thresholds.

Local commands from the root, with the repository toolchain and Docker running:

```sh
npm run containers:test
npm run containers:build -- --version local-validation --report /tmp/apptit-images.json
npm run containers:smoke -- --images /tmp/apptit-images.json --report /tmp/apptit-validation.json
```

A dirty local checkout is allowed for development evidence and marked `sourceDirty: true`; it cannot pass the release publisher. Local image IDs are not GHCR manifest digests. Local verification uses the host Docker architecture; the Ubuntu publication runner builds and validates its native Linux architecture. No untested multi-platform manifest is promised.

## Sprint 2 release gate

`v0.1.0-alpha.1` is handled exclusively by its historical commit. It is exempt from the new Sprint 2 acceptance gate but must still contain and validate its own application container sources. The existing tag lacks those sources, so it remains blocked and unchanged.

For `v0.1.0-alpha.2` and subsequent versions, the tagged source must include the real `docs/delivery/SPRINT-2-ACCEPTANCE.md` and a matching `docs/delivery/sprint-2-acceptance.json`. Create these only after executing and recording Sprint 2 acceptance, including SP2-06; SP2-05 alone is insufficient. The JSON contract is:

```json
{
  "schemaVersion": 1,
  "sprint": 2,
  "status": "passed",
  "validatedSourceCommit": "<full 40-character SHA of the actually validated source>",
  "completed": ["SP2-01", "SP2-02", "SP2-03", "SP2-04", "SP2-05", "SP2-06"],
  "evidence": "docs/delivery/SPRINT-2-ACCEPTANCE.md"
}
```

This is a schema example, not an acceptance assertion. The publisher requires the validated commit to be an ancestor of the release tag and rejects application/service/package changes between validation and release. Packaging is independently rebuilt and tested by the release job. Record actual commands, outcomes, evidence and reviewer status in the acceptance document. No passed manifest is supplied by this infrastructure change.

## Private publication and failure recovery

The workflow uses only the job's `GITHUB_TOKEN`, with `contents: read` and `packages: write`. Registry credentials go through `docker login --password-stdin` into a temporary Docker configuration that is removed afterwards. No PAT, persistent registry secret or local CLI token is substituted.

GitHub documents that newly published container packages are private by default and recommends `org.opencontainers.image.source` for repository association: [GHCR documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry). Existing package visibility is checked through authenticated registry reads and anonymous-access denial for both names before any push, including packages whose requested release tag is absent; a nonprivate package blocks publication without changing its visibility. The publisher verifies private visibility again after each push. An unavailable preflight result does not prove that a package is absent; if the token cannot create/access/verify the private package, publication fails and the report must be inspected. Existing private packages must grant this repository Actions access. See also [GitHub's Docker publication tutorial](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images).

Both validated local image IDs are rechecked before the first push. The registry's returned manifest digest is checkpointed after each push in `publication.json` and the job summary; reports and build logs are retained even on failure. An API push followed by a web failure is explicitly reported as partial. Cross-package publication is not atomic. A push that fails after an ambiguous registry response may also have had an effect: inspect GHCR even when the local checkpoint lacks a digest. Never infer rollback from a red job.

If either package already carries the release tag, the publisher refuses to overwrite either image and records any existing digest/partial state. The only recovery exception is a reviewed versioned prior-run receipt matching tag, commit, repository, platform and exact digest, with both original images validated and current private visibility proven. The matching existing image is retained without docker tag/push; any unmatched existing tag still blocks both pushes. For recovery, first inspect both package versions, compare the recorded tag commit, labels and registry digests, and obtain a bounded recovery change/review as needed. Do not retag a release or silently push different source. Digest-qualified pull commands and package links belong in the actual publication handoff only after successful registry verification.

## Integration and dispatch

Integrate this topic through a PR into `dev`, wait for exact-head CI, then use the repository's reviewed `dev` → `main` promotion procedure. Manual dispatch requires the workflow to exist on the default branch. Do not bypass branch protections to make it visible.

After a release is published and its tagged source satisfies the gates, open **Actions → Publish release containers → Run workflow**, select the reviewed workflow ref and enter the exact release tag. Alternatively:

```sh
gh workflow run publish-containers.yml --ref main -f release_tag=v0.1.0-alpha.2
```

This command is an operational example; it has not been executed for alpha.2. Verify the job artifact, both private package versions and both registry digests before reporting publication complete. Do not dispatch alpha.2 until Sprint 2 acceptance and the corresponding release exist.


## Public-package blocker and reviewed alpha.2 recovery

A REST metadata 404 does not prove a package is absent or private. The registry inspector uses GITHUB_TOKEN for a bounded GHCR bearer exchange, verifies manifest bytes/digest and checks anonymous access. It checks package existence independently when the requested tag is missing, so an existing public package cannot receive a new release tag unnoticed. An anonymous token alone grants no proof of public access; the manifest/tags read must succeed. Unexpected errors never become private proof. Organization internal visibility cannot be called private without authoritative REST metadata.

The first alpha.2 run is partial and its API manifest is publicly readable; web was not pushed. See [the retained receipt and current blocker](../evidence/ghcr/alpha2-first-attempt/README.md). GitHub does not allow an already public package to become private again. Preserve both Git tags and the recorded digest; obtain an owner decision about new package names or properly inventoried recreation. Do not delete data, silently rename packages, overwrite an existing tag or rerun the original failed workflow to resolve this. The reviewed receipt permits retaining only the exact known digest if its namespace is currently private; while the package remains public, the corrected publisher intentionally refuses all pushes.
