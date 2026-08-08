---
title: github-token-blocks-required-checks
domain: workflow
validated: 2026-08-08
evidence:
  "gh pr view 282 --json mergeStateStatus -> BLOCKED, statusCheckRollup: []; 9
  consecutive Rebuild dist run failures (GH006: 5 of 5 required status checks
  are expected)"
---

## Fact

A push or PR made with the default `secrets.GITHUB_TOKEN` inside a workflow
never triggers `push`/`pull_request` runs on other workflows (GitHub Actions'
anti-recursion rule). Once main requires status checks to merge, any
GITHUB_TOKEN-authored PR sits permanently `BLOCKED` with an empty
`statusCheckRollup`, and any GITHUB_TOKEN-authored direct push to main is
rejected outright.

## Evidence

After PR #281 added 5 required status checks to main: `rebuild-dist.yml`'s
direct `git push` to main failed 9 times in a row with
`remote: - 5 of 5 required status checks are expected` /
`protected branch hook declined` (`gh run list --workflow="Rebuild dist"`).
Separately, release-please's own release PR (#282) showed
`mergeStateStatus: BLOCKED`, `mergeable: MERGEABLE`, `statusCheckRollup: []` —
mergeable by content, blocked only because no check run had ever attached to its
head commit.

## Apply when

Adding required status checks to a branch that any workflow pushes to or opens
PRs against using `secrets.GITHUB_TOKEN` (release-please, a dist/docs rebuild
bot, etc.). Fix: after the push/PR-open step, explicitly
`gh workflow run <ci-workflow> --ref <branch>` (requires `actions: write` and a
`workflow_dispatch:` trigger on that workflow) — the dispatched run's check
results attach to the branch's head SHA the same as a normal trigger would,
satisfying the requirement. A PAT/GitHub App token would also work but adds a
secret to manage; dispatch needs no new credentials.
