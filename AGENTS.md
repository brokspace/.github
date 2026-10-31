# AGENTS.md

Operating guide for coding agents working in `brokspace/.github`: the organization profile, default community health files, shared labels and the reusable workflows every Brokspace repository calls.

## Layout

```text
profile/            organization landing page (github.com/brokspace)
.github/workflows/  reusable workflows: pr-policy.yml, promote.yml (+ this repository's callers)
workflow-templates/ the caller workflows other repositories copy
scripts/            labels.sh, branch-flow.sh (run with an authenticated gh)
*.md                default CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT
```

Changes to `pr-policy.yml` and `promote.yml` affect every repository once they reach `main` (callers pin `@main`): keep job names stable, because rulesets require the `policy / title` check and the `staging` status by name.

## Git workflow

- Start from `staging`: `git fetch origin && git switch -c <type>/<short-topic> origin/staging`.
- Commit with Conventional Commits (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`) and end each commit message with a `Co-Authored-By:` trailer naming you, for example `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Never push to `staging` or `main`, never force-push a branch someone else pushed to. Both branches reject direct pushes anyway.
- Open the PR against `staging`, fill in the template, then turn on auto-merge:

  ```sh
  gh pr create --base staging --fill
  gh pr merge --auto --squash
  ```

- If a check fails, fix it on the same branch and push again; auto-merge stays on. If you cannot fix it, say so in the PR and stop.
- Do not open or merge PRs into `main`: the release PR is opened by the Promote workflow and merged by a maintainer.
