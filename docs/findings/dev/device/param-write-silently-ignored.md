---
title: param-write-silently-ignored
domain: dev
validated: 2026-08-04
evidence:
  "PR #271 — Live ignores out-of-range sets; adj-update-device now clamps and
  warns"
---

## Fact

Live **ignores** a parameter set whose value falls outside the parameter's raw
range — it does not clamp. Before PR #271 `adj-update-device` passed such values
straight through, so the call reported success while the parameter kept its old
value. It now clamps into range and warns.

Params whose min/max labels are unparseable still cannot be set by display value
at all: the display-to-raw mapping can't be derived, so the input is treated as
raw and clamped.

## Evidence

```
Compressor Ratio: raw range 0-1, max label "inf:1" (unparseable)
  "Ratio=5"   → set raw 5 → ignored by Live, value unchanged   (pre-#271)
              → clamped to 1 + warning                          (post-#271)
EQ Eight "2 Q A": raw range 0-1
  "2 Q A=1.1" → set raw 1.1 → ignored by Live                   (pre-#271)
              → clamped to 1 + warning                          (post-#271)
```

## Apply when

Setting a device parameter to a value near or beyond its bounds, or on a
parameter whose displayed unit differs from raw (ratios, Q). A clamp warning
means the requested value was unreachable — read the parameter back rather than
assuming the intent landed. </content>
