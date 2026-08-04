---
title: automate-normalized-log-scale
domain: dev
validated: 2026-08-04
evidence: "adj-automate write 0.34 → adj-read-device reports 224 Hz"
---

## Fact

`adj-automate` normalized 0..1 values map **logarithmically** onto frequency
parameters, not linearly. On an Auto Filter Frequency (min 20, max 20000),
`0.34` resolves to **224 Hz**, not the ~6800 Hz a linear reading implies.
Approximate mapping: `hz = min * (max / min) ** value`.

## Evidence

```
adj-automate  devicePath t7/d2  paramName Frequency  points "1|1:0.34"
adj-read-device 3563 → {name:"Frequency", value:224, min:20, max:20000, unit:"Hz"}
```

Half the 0..1 range sits below 630 Hz. Values under ~0.5 on a full-range filter
are far darker than they look: 0.34 = 224 Hz, 0.53 = 780 Hz, 0.80 = 5 kHz, 0.98
= 17 kHz.

## Apply when

Writing envelopes for any frequency-domain parameter (filter cutoff, EQ
frequency, delay time). Compute the target in Hz first, invert the formula, then
read the device back to confirm before duplicating the clip to the arrangement.
</content>
