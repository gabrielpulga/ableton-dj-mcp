---
title: transform-time-filter-needs-range
domain: dev
validated: 2026-08-04
evidence:
  "adj-update-clip transforms '4|1: duration = 3.5' → transform syntax error"
---

## Fact

A transform time selector must be a **range** (`bar|beat-bar|beat`). A single
`bar|beat` position fails to parse, and the error points at column 1 rather than
naming the selector as the problem.

## Evidence

```
transforms: "4|1: duration = 3.5"
→ transform syntax error at position 0 (line 1, column 1):
  Expected parameter assignment but "4" found

transforms: "4|1-4|1: duration = 3.5"
→ {id:"2333", noteCount:4, transformed:1}
```

`4|1-4|1` targets exactly the notes starting at that one position.

## Apply when

Writing `transforms` that target a single beat — trimming one sustained note,
deleting one hit. Degenerate ranges (`N|B-N|B`) are the supported form.
</content>
