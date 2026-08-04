---
title: param-write-silently-ignored
domain: dev
validated: 2026-08-04
evidence:
  "adj-update-device Ratio=5 / 2 Q A=1.1 both returned success, values unchanged
  on read"
---

## Fact

`adj-update-device` returns success even when a parameter write is rejected.
Parameters whose reported range is normalized (`min:0, max:1`) or degenerate
(`min:1, max:1`) silently ignore values expressed in the unit Live displays.

## Evidence

```
Compressor Ratio   → {value:4,    min:1, max:1}   ; "Ratio=5"   → still 4
EQ Eight  "2 Q A"  → {value:0.71, min:0, max:1}   ; "2 Q A=1.1" → still 0.71
```

Both calls returned `{id:"..."}` with no warning. Contrast with a genuinely
unknown name, which does warn:
`WARNING: updateDevice: param "DecayTime" not found on device`.

## Apply when

Any `adj-update-device` call. Read the parameter back and compare before relying
on the write — a success response only proves the parameter name resolved, not
that the value was accepted. </content>
