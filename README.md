# brokspace/.github

Organization-wide configuration for [brokspace](https://github.com/brokspace).

| Path | Purpose |
|---|---|
| `profile/README.md` | The organization's landing page on github.com/brokspace |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md` | Default community health files, used by every repository that does not have its own |
| `scripts/labels.sh` | Creates or updates the shared issue labels (triage roles, categories, areas) on a repository |

Repositories inherit the community health files automatically. Issue forms, workflows and `AGENTS.md` live in each repository because GitHub does not inherit them.

## Labels

Every repository uses the same label vocabulary so the triage skills work everywhere:

```sh
./scripts/labels.sh brokspace/brok
./scripts/labels.sh brokspace/brok-sdk
```

The script is idempotent: run it again after changing a color or description. Label meanings are documented in [brok/docs/agents/triage-labels.md](https://github.com/brokspace/brok/blob/main/docs/agents/triage-labels.md).
