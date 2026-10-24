#!/usr/bin/env bash
# Creates or updates the shared Brokspace issue labels on a repository.
#
#   ./scripts/labels.sh brokspace/brok
#
# Idempotent: `gh label create --force` updates color and description of
# labels that already exist. Requires an authenticated `gh` with write access.
set -euo pipefail

repo="${1:?usage: labels.sh <owner/repo>}"

label() {
  gh label create "$1" --repo "$repo" --color "$2" --description "$3" --force >/dev/null
  echo "  $1"
}

echo "Labels on $repo:"

# Category roles
label "bug"              "d73a4a" "Something is broken"
label "enhancement"      "a2eeef" "New capability or improvement"

# State roles (exactly one per triaged issue)
label "needs-triage"     "fbca04" "A maintainer needs to evaluate this issue"
label "needs-info"       "d4c5f9" "Waiting on the reporter; closes after 14 days without reply"
label "ready-for-agent"  "0e8a16" "Fully specified, ready for an AFK coding agent"
label "ready-for-human"  "1d76db" "Needs a human: judgment, access or manual testing"
label "wontfix"          "ffffff" "Will not be actioned"

# Supporting labels
label "good first issue" "7057ff" "Small, well scoped, a good entry point"
label "help wanted"      "008672" "Maintainers would welcome a contribution"
label "documentation"    "0075ca" "Docs only"
label "dependencies"     "0366d6" "Dependency updates"

# Areas
label "area:cli"          "c5def5" "brok CLI, setup and doctor"
label "area:index"        "c5def5" "Chunking, embeddings, stores and search"
label "area:bus"          "c5def5" "Event bus, protocol and brok run"
label "area:shards"       "c5def5" "Shard install, registry, sandbox and supervisor"
label "area:skills"       "c5def5" "Built-in skills and skill shards"
label "area:integrations" "c5def5" "MCP, coding agents, LLM providers, sync"
