---
title: midi-track-no-stereo-meter
domain: dev
validated: 2026-08-08
evidence: "live adj-read-track calls against Ableton Live 12.4.3, PR #295"
---

## Fact

`output_meter_left`/`output_meter_right` are absent (not zero, absent) on MIDI
tracks with no audio-producing device, while `output_meter_level` is always
present. Audio tracks, return tracks, and the master track expose all three.

## Evidence

Live `adj-read-track { trackIndex: 0/1, include: ["meters"] }` against two MIDI
tracks (one with the MCP host device, one empty) returned only `meterLevel: 0` —
`meterLeft`/`meterRight` missing from the response entirely. The same call
against audio tracks (index 2/3), both return tracks, and the master track
returned all three fields. `track.getProperty()` returns `undefined` for the
missing pair; `Object.assign` + JSON serialization drops the `undefined` keys,
so no explicit per-type branching was needed in `readMeterProperties`
(`src/tools/track/read/helpers/read-track-helpers.ts`).

## Apply when

Reading or documenting `output_meter_left`/`output_meter_right` on a track of
unknown type — a MIDI track without a stereo-producing instrument will omit both
from the result even though `output_meter_level` reads fine.
