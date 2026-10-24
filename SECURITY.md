# Security policy

This policy covers every repository in the [brokspace](https://github.com/brokspace) organization: `brok`, `brok-sdk`, `brok-agent`, `brok-shard-template` and official shards.

## Supported versions

Brokspace is pre-1.0: security fixes land on the latest minor release of each repository only.

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private vulnerability reporting on the affected repository (Security tab, "Report a vulnerability"), for example [brokspace/brok](https://github.com/brokspace/brok/security/advisories/new). Include:

- the affected repository and version (`brok doctor` prints the versions);
- steps to reproduce or a proof of concept;
- the impact as you understand it.

We acknowledge reports within 3 working days and aim to ship a fix within 30 days, crediting you in the advisory unless you prefer otherwise.

## Scope

Particularly interesting:

- bypassing topic permissions, spoofing event sources or reading replies meant for another client on the bus;
- connecting to a bus without a valid token, or from another user account;
- secrets leaking into shard environments, logs, MCP responses or LLM prompts;
- path traversal or code execution through `shard.json`, `SKILL.md`, `brok.yml` or `brok shard install` beyond what the user approved.

Known, documented limitation: shard file system and network permissions are not yet enforced by the operating system (see [ADR 0004](https://github.com/brokspace/brok/blob/main/docs/adr/0004-advisory-filesystem-and-network-sandbox.md)). Reports that rely only on this are not vulnerabilities, but ideas to close the gap are welcome.
