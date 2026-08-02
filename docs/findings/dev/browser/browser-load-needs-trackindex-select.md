---
title: browser-load-needs-trackindex-select
domain: dev
validated: 2026-08-02
evidence:
  adj-create-device with browserUri loaded onto the wrong track live in Ableton
  Live 12.4.3; fixed and reconfirmed on the correct track
---

## Fact

`adj-create-device`'s `browserUri` path silently loaded devices onto whatever
track Live already had selected, ignoring the caller's `path` argument. The
dispatcher's pre-select step passed `{ path, detailView }` to `adj-select`, but
that tool has no such fields (only `trackIndex`, `devicePath`, `slot`, etc.) —
Zod strips unrecognized keys, so the select silently no-op'd. Switching to
`devicePath` isn't enough either: `adj-select`'s `devicePath` requires an
existing device index, but `browserUri` loads usually target a track with zero
devices (there's nothing to index yet). The fix is to select by `trackIndex`,
parsed from the leading `t<N>` segment of the path.

## Evidence

`adj-create-device { path: "1/0", browserUri: "query:Synths#Operator" }`
returned `{ loaded: true, deviceCountBefore: 1, deviceCountAfter: 2 }`, but
`adj-read-track` on the target track showed 0 devices — Operator had loaded onto
track 0 (the currently-selected track) instead. After parsing `trackIndex` from
the path and passing `{ trackIndex }` to `adj-select`,
`adj-create-device { path: "t1", browserUri: "query:Synths#Operator" }`
correctly reported `deviceCountBefore: 0, deviceCountAfter: 1` on track 1,
confirmed via `adj-read-track` showing `devices: [{ path: "t1/d0", ... }]`.

## Apply when

Touching `src/mcp-server/bridge-dispatcher.ts`'s pre-select logic, or adding any
new cross-tool call where one tool's args object is reused/reshaped for another
tool without checking the target tool's actual Zod schema — Zod's default
unknown-key stripping means a typo'd field name fails silently instead of
throwing.
