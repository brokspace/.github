# brokspace/.github

Organization-wide configuration for [brokspace](https://github.com/brokspace).

| Path | Purpose |
|---|---|
| `profile/README.md` | The organization's landing page on github.com/brokspace |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md` | Default community health files, used by every repository that does not have its own |
| `.github/pull_request_template.md` | Default pull request template |
| `scripts/labels.sh` | Creates or updates the shared issue labels (triage roles, categories, areas) on a repository |
| `scripts/branch-flow.sh` | Applies the staging / main branch flow (default branch, merge settings, rulesets) to a repository |
| `scripts/release.mjs` | Versioning from Conventional Commits: plans the next release and bumps the version files and changelog |
| `.github/workflows/pr-policy.yml`, `promote.yml`, `dependabot.yml` | Reusable workflows every repository calls: PR checks, promotion and releases, Dependabot triage |
| `workflow-templates/` | The caller workflows, offered under Actions > New workflow in every repository |

Repositories inherit the community health files automatically. Issue forms, caller workflows and `AGENTS.md` live in each repository because GitHub does not inherit them.

## Labels

Every repository uses the same label vocabulary so the triage skills work everywhere:

```sh
./scripts/labels.sh brokspace/brok
./scripts/labels.sh brokspace/brok-sdk
```

The script is idempotent: run it again after changing a color or description. Label meanings are documented in [brok/docs/agents/triage-labels.md](https://github.com/brokspace/brok/blob/main/docs/agents/triage-labels.md).

## Branch flow

Every repository works the same way (details in [CONTRIBUTING.md](CONTRIBUTING.md#branches-and-pull-requests)):

```text
feature branch --PR, squash--> staging --release PR, merge commit--> main --> tag vX.Y.Z --> release.yml
```

- `staging` is the default branch. Nobody pushes to it: every change is a pull request with green CI and a Conventional Commits title, and merges itself once green (auto-merge).
- `main` is the release branch. It only takes the promotion PR from `staging`, which the Promote workflow opens and merges once its checks pass.

## Zero-touch releases

Nobody merges release PRs, bumps versions or pushes tags. On every push to `staging`, the Promote workflow reads the Conventional Commits since the last `v*` tag (`scripts/release.mjs`):

| Commits since the last tag | Release |
|---|---|
| `feat` | minor |
| `fix`, `perf`, `revert`, `build(deps)`, `chore(deps)` | patch |
| `type!:` or a `BREAKING CHANGE:` footer | major (minor while the version is 0.x) |
| only `docs`, `ci`, `test`, `refactor`, `chore`, `chore(deps-dev)`, ... | none |

1. A release is due: it opens `chore: release X.Y.Z` into `staging` (and refreshes it on every push), which bumps the version files (`Cargo.toml` and `Cargo.lock`, `package.json` and `package-lock.json`, `shard.json`) and moves the changelog's `## [Unreleased]` section under `## [X.Y.Z]` (or writes it from the commits when it is empty). It is merged only in the **release window**: the daily scheduled run of Promote (12:00 UTC) or a manual run (Actions > Promote > Run workflow). Until then commits accumulate, so a repository publishes at most one version a day, however many PRs merged. It merges itself once green.
2. Staging is promoted: the promotion PR into `main` merges itself once green.
3. On `main`, a version ahead of the last tag is tagged `vX.Y.Z`. The tag runs the repository's `release.yml`: binaries, GitHub release, crates.io, Marketplace and Open VSX.

Dependabot patch and minor updates merge themselves once green (`dependabot.yml`); major updates get `ready-for-human` and wait for a review.

Repositories opt into releases with `release: true` in their Promote caller; the others (website, examples) are only promoted.

### The brokspace-bot GitHub App

Pull requests, merges and tags made with the workflows' `GITHUB_TOKEN` start no other workflow, so the flow acts as **brokspace-bot**, a GitHub App of the organization. Without its secrets everything still works as before: PRs are opened and wait for a person, and the due version and tag are printed as notices.

One-time setup by an organization owner:

1. **Create the app**: github.com/organizations/brokspace/settings/apps/new. Name `brokspace-bot`, homepage `https://brokspace.org`, webhook off. Repository permissions: Contents, Pull requests, Workflows: **Read and write**; Commit statuses: **Read and write**; Metadata: Read. "Only on this account".
2. **Generate a private key** (downloads a `.pem`) and note the **App ID**.
3. **Install the app** on the organization, all repositories.
4. **Save the secrets** for Actions and for Dependabot (Dependabot runs only see Dependabot secrets):

   ```sh
   for app in actions dependabot; do
     gh secret set BROKSPACE_BOT_ID  --org brokspace --app $app --visibility all --body "<App ID>"
     gh secret set BROKSPACE_BOT_KEY --org brokspace --app $app --visibility all < brokspace-bot.private-key.pem
   done
   ```

Publishing needs no stored token: crates.io, the Visual Studio Marketplace and Open VSX use Trusted Publishing (OIDC) tied to each repository's `release.yml` and, for the extension, the `marketplace-production` environment. `CARGO_REGISTRY_TOKEN` remains only as an optional fallback in repositories that have not registered a trusted publisher yet (see `docs/publishing.md` in `brokspace/brok`).

To set up a new repository (or re-apply after changing its CI):

```sh
./scripts/labels.sh brokspace/<repo>
./scripts/branch-flow.sh brokspace/<repo> "<required CI check>" ...
```

then add the caller workflows from `workflow-templates/` (Actions > New workflow shows them) and the "Git workflow" section of `AGENTS.md`. Organization rulesets need GitHub Team, so the script applies repository rulesets one repository at a time; private repositories need GitHub Pro or Team for them.
