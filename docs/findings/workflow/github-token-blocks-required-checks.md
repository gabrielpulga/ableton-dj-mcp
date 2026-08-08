---
title: github-token-blocks-required-checks
domain: workflow
validated: 2026-08-08
evidence:
  "gh pr view 282 (BLOCKED -> clean after approving run 31283119338); gh run
  view 31283119338 (conclusion action_required, jobs: []); 9 consecutive Rebuild
  dist push failures (GH006: 5 of 5 required status checks expected)"
---

## Fact

Once main requires status checks, a PR opened with the default
`secrets.GITHUB_TOKEN` gets its `pull_request`-triggered CI run created but
stuck `action_required` (zero jobs ever start) until a maintainer approves it
via `POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve` or the UI. A
direct GITHUB_TOKEN push to protected main is rejected outright with no such run
at all (`GH006: N of N required status checks are expected`). Explicitly
dispatching CI (`gh workflow run <ci-workflow> --ref <branch>`) does post real
passing checks, but if the implicit stuck `pull_request` run lands _after_ the
dispatch run, it becomes the "latest" instance for those check names and the PR
stays `BLOCKED` regardless of the dispatch run's success — dispatch reduces but
does not reliably eliminate the need for one manual approval click.

## Evidence

`rebuild-dist.yml`'s direct push to main failed 9 times in a row after #281
added required checks. Release-please's PR (#282) showed
`mergeStateStatus: BLOCKED` / `statusCheckRollup: []` even after a
`workflow_dispatch` run posted all 5 required contexts as `success` (run
31283118466, `23:03:34`) — because a `pull_request`-triggered run for the same
commit (31283119338, `23:03:36`, conclusion `action_required`, `jobs: []`)
landed 2 seconds later and superseded it. Calling the approve endpoint on that
stuck run let its jobs actually execute; `mergeable_state` flipped to `clean`
once they passed.

## Apply when

Debugging why a bot-authored PR (release-please, a rebuild bot) stays
`BLOCKED`/`mergeable_state: blocked` despite required checks appearing to pass
elsewhere: check for an `action_required` run with `jobs: []` on the same commit
via `gh run view <id> --json status,conclusion,jobs` — that stuck run, not the
dispatch, is what's actually blocking, and needs an explicit approve call. Root
cause of the approval gate itself (likely an Actions setting requiring approval
for a class of actors) is not yet identified — flagged for follow-up rather than
fixed at the source.
