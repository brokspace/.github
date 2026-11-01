# Contributing to Brokspace

Thanks for your interest! This file is the default contributing guide for every repository in the [brokspace](https://github.com/brokspace) organization that does not have its own.

The full guide, including the polyrepo development setup, lives in [brok/CONTRIBUTING.md](https://github.com/brokspace/brok/blob/main/CONTRIBUTING.md). The short version:

1. **Check the scope.** Brokspace stays simple, local-first and zero-config. Domain-specific behaviour belongs in a shard or a skill. Read [SCOPE.md](https://github.com/brokspace/brok/blob/main/SCOPE.md) and [`.out-of-scope/`](https://github.com/brokspace/brok/tree/main/.out-of-scope) before proposing something new.
2. **Open an issue** with the bug or idea form. It is labelled `needs-triage` and goes through the triage flow described in [triage-labels.md](https://github.com/brokspace/brok/blob/main/docs/agents/triage-labels.md). Issues labelled `ready-for-human`, `ready-for-agent` or `good first issue` are ready to pick up.
3. **Agree on the approach** in the issue for anything non-trivial. Big changes get a spec and are split into small tickets.
4. **Open a pull request against `staging`** using the template: what and why, evidence it works, and the risk (one-way or two-way door). Titles follow [Conventional Commits](https://www.conventionalcommits.org/). CI must be green.

## Branches and pull requests

```text
feature branch --PR, squash--> staging --release PR, merge commit--> main --> tag vX.Y.Z
```

- **`staging`** is the default branch and the integration branch. Nobody pushes to it directly, maintainers included: every change arrives as a pull request.
- **`main`** is the release branch. It only takes the release PR from `staging`, opened and kept up to date by the Promote workflow. Releases and tags are cut from `main`.

A pull request into `staging` merges when:

- the CI checks of the repository pass;
- the title follows Conventional Commits (the `policy / title` check): it becomes the squash commit message;
- review conversations are resolved.

No approval is required, so nothing waits on a person: turn on auto-merge (`gh pr merge --auto --squash`) and the PR merges itself once green. Reviews are welcome and any open conversation blocks the merge until it is resolved. The human checkpoint is the release PR into `main`.

Pull requests written by coding agents follow the same rules. They carry a `Co-Authored-By:` trailer naming the agent and get the `ai-agent` label automatically. The "Git workflow" section of each repository's `AGENTS.md` spells the flow out for agents.

Coding agents: every repository has an `AGENTS.md` with its conventions and commands. Brokspace's built-in skills (`brok skill export`) encode the same workflow.

Questions go to [Discussions](https://github.com/brokspace/brok/discussions). Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
