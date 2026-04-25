---
title: barbeat-notation-order
domain: dev
validated: 2026-04-25
evidence: PR #84 (commit 11fb180c)
---

## Fact
Barbeat parser is stateful. Pitch token must appear BEFORE time position in the same note expression. Reverse order silently buffers pitch for the NEXT emission, dropping the first note and shifting all subsequent positions by one.

## Evidence
Tested live against Ableton Live 12.3.7 via `adj-generate(pattern=tresillo, bars=2)` → `adj-create-clip`:

```
WRONG: "1|1 v100 t/8 C1\n1|2.5 v100 t/8 C1\n..."
→ noteCount: 5 (expected 6)
→ WARNING: Time position 1|1 has no pitches
→ WARNING: 1 pitch(es) buffered but no time position to emit them

RIGHT: "v100 t/8 C1 1|1,2.5,4 2|1,2.5,4"
→ noteCount: 6, no warnings
```

## Apply when
Generating bar|beat notation strings programmatically. Touching `src/notation/barbeat/` or anything emitting `notes` strings for `adj-create-clip` / `adj-update-clip`.
