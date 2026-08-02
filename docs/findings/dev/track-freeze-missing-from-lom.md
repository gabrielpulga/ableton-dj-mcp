---
title: track-freeze-missing-from-lom
domain: dev
validated: 2026-08-02
evidence:
  adj-update-track { freeze:true } left is_frozen false live in Ableton Live
  12.4.3, confirmed against docs.cycling74.com/apiref/lom/track/ and Ableton
  forum reports
---

## Fact

Ableton's Live Object Model has no way to trigger freeze or flatten on a Track,
in M4L JS or Python remote scripts. Only `can_be_frozen` (get) and `is_frozen`
(getobserve) exist — both read-only. `track.set("freeze", ...)` and
`track.call("flatten")` target API surface that doesn't exist; the
freeze/flatten feature (PR #241) was removed rather than fixed, since there is
no programmatic hook to reach for.

## Evidence

`adj-update-track { ids: "4", freeze: true }` against a real, connected Ableton
Live 12.4.3 instance returned `freezeStatus: "in_progress"`, and a follow-up
`adj-read-track` showed no `isFrozen` field at all (i.e. `is_frozen` stayed
false) — the freeze never took effect. Cross-checked against
`docs.cycling74.com/apiref/lom/track/`, which lists `can_be_frozen` and
`is_frozen` as the only freeze-related Track members, both read-only. Confirmed
independently on the Ableton forum: multiple threads asking how to
freeze/flatten via the API report the same absence, with no known workaround
short of OS-level UI automation.

## Apply when

Considering re-adding a freeze/flatten/bounce-in-place tool action. Read-only
freeze-state reporting (`isFrozen` on `adj-read-track`) is still valid and was
kept — only the trigger action was removed.
