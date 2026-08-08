---
title: clip-groove-write-no-op
domain: dev
validated: 2026-08-08
evidence:
  adj-raw-live-api probe against Live 12.4.3, branch
  gabriel/feat-268-compressor-sidechain-routing@651bdd48
---

## Fact

`Clip.groove` is a `child` object reference in the LOM (`type Groove`), not a
plain settable property. Generic `set_property("groove", <id>)` via the M4L JS
`LiveAPI` binding reports success but does not actually assign the groove.

## Evidence

`adj-raw-live-api` on a real session clip:
`{type:"set", property:"groove", value:57}` (57 = a real Groove's id from
`live_set groove_pool grooves 0`) returned `result: 1`. Immediate readback
`{type:"get", property:"groove"}` returned `["id", 20]` — id 20 was an unrelated
device object elsewhere in the set, not the target Groove. No working assignment
path found on the JS surface.

## Apply when

Building any feature that applies a GroovePool template to a clip. Don't rely on
`set`/`set_property` on `groove` via M4L JS — check whether the Python
remote-script bridge (`live_browser_bridge/`) supports real attribute assignment
first, the same way it already does for clip automation envelopes
(`docs/findings/dev/device/clip-envelope-api-python-only.md`).
