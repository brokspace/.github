# Brokspace

**Your workspace, supercharged. Local-first, zero-config, built to be extended.**

Brokspace (`brok`) makes a development workspace more productive for individuals and teams. It indexes your code (including nested git submodules) into a local hybrid search engine, connects it to the LLM you choose (Ollama, LM Studio or a hosted provider), and plugs it into the coding agents you already use. Everything runs on your machine.

The platform is built around two ideas:

- **Shards**: small, event-driven programs anyone can write. They react to workspace events (a file changed, a question was asked) on a local, permissioned event bus.
- **Integrations**: built-in skills and an MCP server for Claude Code, Codex, Cursor and GitHub Copilot; OpenAI-compatible local and hosted LLMs; git; S3-compatible storage.

## Quick start

```sh
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/brokspace/brok/main/scripts/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/brokspace/brok/main/scripts/install.ps1 | iex

# then, inside any repository
brok init
```

`brok init` sets everything up: it detects a local LLM (or tells you how to get one for your hardware), downloads the embedding model, installs the default agent and indexes the workspace. Then:

```sh
brok search "where do we validate tokens"   # hybrid search over your code
brok run                                    # live indexing + agent
brok ask "how does the refresh flow work?"  # answers grounded in your code
brok setup agents                           # skills + MCP for your coding agent
```

## Repositories

| Repository | What it is |
|---|---|
| [brok](https://github.com/brokspace/brok) | The CLI and runtime: index, event bus, shard lifecycle, skills and integrations. **Start here.** |
| [brok-sdk](https://github.com/brokspace/brok-sdk) | Protocol, `shard.json` schema and Rust client for writing shards |
| [brok-agent](https://github.com/brokspace/brok-agent) | The default system shard: change tracking, pre-indexation review, RAG answers |
| [brok-shard-template](https://github.com/brokspace/brok-shard-template) | A ready-to-fork template for your own shard |

## Build on Brokspace

- **Build a shard**: click "Use this template" on [brok-shard-template](https://github.com/brokspace/brok-shard-template), or run `brok shard new my-shard`. The [shard guide](https://github.com/brokspace/brok/blob/main/docs/shards.md) covers the manifest, capabilities and topics.
- **Write a skill**: `brok skill new my-skill` scaffolds an [Agent Skills](https://github.com/brokspace/brok/tree/main/skills) `SKILL.md`. Share it as a skill shard, a repository whose `shard.json` lists its `skills`.

## Contribute

- Read [SCOPE.md](https://github.com/brokspace/brok/blob/main/SCOPE.md) and the [contributing guide](https://github.com/brokspace/brok/blob/main/CONTRIBUTING.md): every change flows issue, triage, spec, tickets, implementation, pull request.
- Look for issues labelled [`good first issue`](https://github.com/search?q=org%3Abrokspace+label%3A%22good+first+issue%22+state%3Aopen&type=issues) or [`ready-for-human`](https://github.com/search?q=org%3Abrokspace+label%3Aready-for-human+state%3Aopen&type=issues).
- Ask questions in [Discussions](https://github.com/brokspace/brok/discussions).
- Report vulnerabilities privately, as described in the [security policy](https://github.com/brokspace/.github/blob/main/SECURITY.md).

Brokspace is dual-licensed under MIT or Apache-2.0.
