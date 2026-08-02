---
title: live-api-property-names-need-external-check
domain: dev
validated: 2026-08-02
evidence:
  fixes confirmed live in Ableton Live 12.4.2/12.4.3 via adj-read-live-set and
  adj-read-clip; 3819+ tests passing
---

## Fact

Two shipped properties used names that don't exist on the real Live API. Ableton
Link's real property is `is_ableton_link_enabled`, not `link_enable` (PR #237).
RAM mode's real property is `ram_mode`, not `clip_mode` (PR #238). There is also
no `link_num_peers` property at all in the exposed Live Object Model. Mocked
unit tests passed against all three wrong names because the mock only checks
that code calls `.set`/`.getProperty` with the string the code itself provides —
it can't catch a property name that doesn't exist on the real Live API.

## Evidence

`liveSet.set("link_enable", true)` returned success and `adj-read-live-set`
echoed `link: true`, but a subsequent read showed `linkEnabled: false` — a
silent no-op against real Live, invisible to the mocked test suite. Same pattern
for `clip.set("clip_mode", 1)`: succeeded, but `ram_mode` (added to
`adj-read-clip` specifically to catch this class of bug) stayed absent from the
read-back. Confirmed correct names against AbletonOSC's `song.py`/`clip.py`
`properties_rw` lists and Adam Murray's Max-for-Live LiveAPI reference — both
list `is_ableton_link_enabled` and `ram_mode`, neither lists any peer-count
property. After renaming both and dropping `linkPeers`,
`adj-update-live-set { link: true }` → `adj-read-live-set` returned
`linkEnabled: true`, and `adj-update-clip { ramMode: true }` →
`adj-read-clip { include: ["sample"] }` returned `ramMode: true`, both live.

## Apply when

Adding or changing any `liveSet.set(...)`/`getProperty(...)` call for a property
name not already proven elsewhere in this codebase. Cross-check the exact string
against a working third-party implementation (AbletonOSC's
`song.py`/`track.py`/`clip.py`) or Adam Murray's Live Object Model reference
before shipping — don't trust a mocked test alone to catch a wrong name.
