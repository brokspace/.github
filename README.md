# brokspace/.github

Organization-wide configuration for [brokspace](https://github.com/brokspace).

| Path | Purpose |
|---|---|
| `profile/README.md` | The organization's landing page on github.com/brokspace |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md` | Default community health files, used by every repository that does not have its own |
| `.github/pull_request_template.md` | Default pull request template |
| `scripts/labels.sh` | Creates or updates the shared issue labels (triage roles, categories, areas) on a repository |
| `scripts/branch-flow.sh` | Applies the staging / main branch flow (default branch, merge settings, rulesets) to a repository |
| `.github/workflows/pr-policy.yml`, `promote.yml` | Reusable workflows every repository calls: PR checks and the staging to main promotion |
| `workflow-templates/` | The two caller workflows, offered under Actions > New workflow in every repository |

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
feature branch --PR, squash--> staging --release PR, merge commit--> main --> tag vX.Y.Z
```

- `staging` is the default branch. Nobody pushes to it: every change is a pull request with green CI and a Conventional Commits title, and merges itself once green (auto-merge).
- `main` is the release branch. It only takes the release PR from `staging`, which the Promote workflow keeps open and up to date. Merging it is the release decision.

To set up a new repository (or re-apply after changing its CI):

```sh
./scripts/labels.sh brokspace/<repo>
./scripts/branch-flow.sh brokspace/<repo> "<required CI check>" ...
```

then add the two caller workflows from `workflow-templates/` (Actions > New workflow shows them) and the "Git workflow" section of `AGENTS.md`. Organization rulesets need GitHub Team, so the script applies repository rulesets one repository at a time; private repositories need GitHub Pro or Team for them.
