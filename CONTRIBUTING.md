# Contributing to Brokspace

Thanks for your interest! This file is the default contributing guide for every repository in the [brokspace](https://github.com/brokspace) organization that does not have its own.

The full guide, including the polyrepo development setup, lives in [brok/CONTRIBUTING.md](https://github.com/brokspace/brok/blob/main/CONTRIBUTING.md). The short version:

1. **Check the scope.** Brokspace stays simple, local-first and zero-config. Domain-specific behaviour belongs in a shard or a skill. Read [SCOPE.md](https://github.com/brokspace/brok/blob/main/SCOPE.md) and [`.out-of-scope/`](https://github.com/brokspace/brok/tree/main/.out-of-scope) before proposing something new.
2. **Open an issue** with the bug or idea form. It is labelled `needs-triage` and goes through the triage flow described in [triage-labels.md](https://github.com/brokspace/brok/blob/main/docs/agents/triage-labels.md). Issues labelled `ready-for-human`, `ready-for-agent` or `good first issue` are ready to pick up.
3. **Agree on the approach** in the issue for anything non-trivial. Big changes get a spec and are split into small tickets.
4. **Open a pull request** using the template: what and why, evidence it works, and the risk (one-way or two-way door). Titles follow [Conventional Commits](https://www.conventionalcommits.org/). CI must be green.

Coding agents: every repository has an `AGENTS.md` with its conventions and commands. Brokspace's built-in skills (`brok skill export`) encode the same workflow.

Questions go to [Discussions](https://github.com/brokspace/brok/discussions). Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
