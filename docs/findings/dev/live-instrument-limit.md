---
title: live-instrument-limit
domain: dev
validated: 2026-04-25
evidence: live tool calls in conversation 2026-04-25
---

## Fact
Ableton Live allows only one instrument device per MIDI track. Attempting to insert a second instrument via `adj-create-device` fails with vague error message that does not name the cause.

## Evidence
After successful `adj-create-device(path=t0, deviceName="Drum Rack")`:

```
adj-create-device(path=t0, deviceName="Operator")
→ Error: createDevice failed: could not insert "Operator" at end in path "t0"

adj-create-device(path=t0, deviceName="Drift")
→ Error: createDevice failed: could not insert "Drift" at end in path "t0"
```

After `adj-delete(type=device, path=t0/d1)`:

```
adj-create-device(path=t0, deviceName="Operator")
→ {id: "27", deviceIndex: 1}  # success
```

## Apply when
Diagnosing "could not insert at end" errors from `adj-create-device`. Check existing devices on the track first; delete the existing instrument before adding a new one. Also relevant when designing tools that swap instruments.
