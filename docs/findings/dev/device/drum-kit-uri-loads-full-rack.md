---
title: drum-kit-uri-loads-full-rack
domain: dev
validated: 2026-05-07
evidence: PR #119, manual session
---

## Fact

Calling `Browser.load_item(item)` with a Drum Rack `.adg` URI creates a
populated Drum Rack (samples + macros + return-chain FX) on the focused track in
one step. Pre-inserting an empty `Drum Rack` device first is unnecessary and
produces a second empty rack — `load_item` does not load into a focused rack, it
spawns its own.

## Evidence

```
adj-create-device path=t6 browserUri=query:Drums#FileId_15636
  → loaded:true, deviceId=4812320176, deviceCountBefore=0, deviceCountAfter=1

adj-read-device path=t6/d0 include=["*"] maxDepth=3
  → drum-rack "808 Core Kit" with 16 pads, each pad → instrument-rack →
    Chain → Simpler with sample (e.g., "Bass Drum 808"), plus
    rc0/d0/c0 = Channel EQ | Saturator | Drum Buss | Limiter chain.
```

The compound path (`deviceName: "Drum Rack"` + `browserUri`) instead yields one
empty Drum Rack from the JS insert plus a populated one from `load_item` —
visible as `deviceCountBefore: 1` then unchanged after load.

## Apply when

Implementing the bridge dispatcher for `adj-create-device`, or extending
`live_browser_bridge/BrowserBridge.py`'s `_op_load_item` for kit/preset flows.
Drop the compound branch — pass `browserUri` alone whenever the URI points to a
`.adg` / kit file.
