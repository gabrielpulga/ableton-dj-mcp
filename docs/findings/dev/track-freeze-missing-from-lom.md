---
title: track-freeze-missing-from-lom
domain: dev
validated: 2026-08-02
evidence: docs.cycling74.com/apiref/lom/track/ (unverified live against Live)
---

## Fact

Ableton's Live Object Model does not document any way to trigger freeze or
flatten on a Track. Only `can_be_frozen` (access: get) and `is_frozen` (access:
getobserve) exist. `track.set("freeze", freeze)` and `track.call("flatten")` in
`update-track-freeze-helpers.ts` target API surface that isn't documented to
exist, so freeze/unfreeze/flatten may silently never complete against real Live
regardless of polling logic.

## Evidence

docs.cycling74.com/apiref/lom/track/: `can_be_frozen` — "1 = the track can be
frozen, 0 = otherwise" (get only); `is_frozen` — "1 = the track is currently
frozen" (getobserve). No `freeze` or `flatten` entry exists on Track. Multiple
Cycling '74 forum threads asking how to freeze/flatten via the API report the
same absence. Not yet confirmed against a running Live instance.

## Apply when

Touching `src/tools/track/update/helpers/update-track-freeze-helpers.ts`, or
adding a tool action described as freeze/flatten/bounce-in-place on a track.
