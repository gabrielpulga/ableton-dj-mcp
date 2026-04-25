---
title: empty-drum-rack-silent
domain: dev
validated: 2026-04-25
evidence: live tool call in conversation 2026-04-25
---

## Fact
`adj-create-device(deviceName="Drum Rack")` returns success but creates an empty rack with no samples loaded into pads. MIDI notes routed to it produce silence. There is no error or warning indicating the rack is empty.

## Evidence
```
adj-create-device(path=t0, deviceName="Drum Rack")
→ {id: "26", deviceIndex: 1}

# Subsequent adj-playback play-session-clips on a clip with C1 notes
# produced no audible output. Switched to Operator (default sine) → audible.
```

## Apply when
Using `adj-create-device` for testing audio. Use synth-style instruments (Operator, Drift, Simpler) for quick audible tests. Drum Rack requires sample-loading workflow not covered by current adj-* tools.
