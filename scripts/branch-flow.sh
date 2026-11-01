#!/usr/bin/env bash
# Applies the Brokspace branch flow to a repository: staging is the default
# branch and takes every change through a pull request; main is the release
# branch and only takes the promotion pull request from staging.
#
#   ./scripts/branch-flow.sh brokspace/brok "ubuntu-latest (default)" "msrv"
#
# Arguments after the repository are the CI check names a pull request must
# pass (as shown in the Checks tab). The PR policy check (`policy / title`) is
# always required on staging; the `staging` status, set by the Promote
# workflow on every commit that reaches staging, is always required on main.
#
# Idempotent: creates staging from main if missing, then replaces the
# repository's rulesets named "main" and "staging". Organization rulesets
# need GitHub Team, so this runs per repository. Private repositories need
# GitHub Pro/Team for rulesets: the script then only sets the branches.
set -euo pipefail

repo="${1:?usage: branch-flow.sh <owner/repo> [required check...]}"
shift
checks=("$@")

echo "Branch flow on $repo:"

# 1. staging exists and is the default branch.
if ! gh api "repos/$repo/branches/staging" --silent 2>/dev/null; then
  sha=$(gh api "repos/$repo/branches/main" --jq .commit.sha)
  gh api "repos/$repo/git/refs" -f ref=refs/heads/staging -f sha="$sha" --silent
  echo "  created staging from main"
fi
settings=(
  -f default_branch=staging
  -F allow_squash_merge=true -F allow_merge_commit=true -F allow_rebase_merge=false
  -F delete_branch_on_merge=true
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=COMMIT_MESSAGES
  -f merge_commit_title=PR_TITLE -f merge_commit_message=PR_BODY
)
# Auto-merge needs a public repository on GitHub Free.
if gh api -X PATCH "repos/$repo" --silent "${settings[@]}" -F allow_auto_merge=true 2>/dev/null; then
  echo "  default branch: staging; squash into staging, merge commits into main, auto-merge on"
else
  gh api -X PATCH "repos/$repo" --silent "${settings[@]}"
  echo "  default branch: staging; squash into staging, merge commits into main (auto-merge unavailable)"
fi

# 2. GitHub Actions may open the promotion pull request.
gh api -X PUT "repos/$repo/actions/permissions/workflow" --silent \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=true

# 3. Rulesets.
if [ "$(gh api "repos/$repo" --jq .private)" = true ] && ! gh api "repos/$repo/rulesets" --silent 2>/dev/null; then
  echo "  ! private repository on GitHub Free: rulesets unavailable, branches not enforced"
  exit 0
fi

check_list() {
  local first=1
  for check in "$@"; do
    [ $first = 1 ] || printf ','
    first=0
    printf '{"context":"%s"}' "${check//\"/\\\"}"
  done
}

ruleset() {
  local name="$1" branch="$2" method="$3" required="$4"
  cat <<JSON
{
  "name": "$name",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["refs/heads/$branch"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["$method"] } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [$required] } }
  ]
}
JSON
}

apply() {
  local name="$1" body="$2" id
  # The old "Protect main" ruleset targeted the default branch, now staging.
  for id in $(gh api "repos/$repo/rulesets" --jq ".[] | select(.name == \"$name\" or .name == \"Protect main\") | .id"); do
    gh api -X DELETE "repos/$repo/rulesets/$id" --silent
  done
  echo "$body" | gh api -X POST "repos/$repo/rulesets" --input - --silent
  echo "  ruleset $name"
}

apply staging "$(ruleset staging staging squash "$(check_list "policy / title" "${checks[@]}")")"
apply main "$(ruleset main main merge "$(check_list staging "${checks[@]}")")"

# 4. Open pull requests against main move to staging (main only takes promotions).
for pr in $(gh pr list --repo "$repo" --base main --state open --json number,headRefName --jq '.[] | select(.headRefName != "staging") | .number'); do
  gh pr edit "$pr" --repo "$repo" --base staging >/dev/null
  echo "  PR #$pr now targets staging"
done
