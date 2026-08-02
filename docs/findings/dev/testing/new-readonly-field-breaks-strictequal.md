---
title: new-readonly-field-breaks-strictequal
domain: dev
validated: 2026-08-02
evidence: PRs #236, #237, #238, #239, #240 test diffs
---

## Fact

Adding a new always-present field to `readLiveSet`/`readTrack`/`readClip`'s
result object breaks every existing test that asserts the full response with
`toStrictEqual`, because `toStrictEqual` treats a missing key and an
unlisted-but-present key as different. The mock's default value for an unmocked
LiveAPI property is typically `0` (numeric) or the falsy equivalent for booleans
built from `(x as number) > 0`.

## Evidence

Adding `grooveAmount: liveSet.getProperty("groove_amount")` unconditionally to
`readLiveSet`'s result broke two `toStrictEqual` assertions in
`read-live-set-basic.test.ts` with:

```
- Expected
+ Received
+   "grooveAmount": 0,
```

Same pattern repeated for `linkEnabled`/`linkPeers` (#237), `isFoldable`/
`isGrouped`/`isFolded` (#239), and `punchIn`/`punchOut`/`overdub` (#240) — each
addition required updating pre-existing `toStrictEqual` fixtures with the new
field's mock-default value, not just adding new tests for it.

## Apply when

Adding any field to the unconditional (always-present) part of a read tool's
result object. Search the tool's existing test files for `toStrictEqual` and
update every match, not just the tests for the new field itself.
