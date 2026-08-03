---
title: clip-envelope-api-python-only
domain: dev
validated: 2026-08-02
evidence:
  "docs.cycling74.com/apiref/lom/clip/ + Cycling74 forum thread 'Programatic
  Clip Envelope Editing??' (Live 12.1)"
---

## Fact

`Clip.automation_envelope`, `Clip.create_automation_envelope`,
`AutomationEnvelope.insert_step`, and `AutomationEnvelope.value_at_time` exist
only in the Python remote-script API — the M4L LOM whitelist excludes them, so
M4L JS `LiveAPI.call()` cannot write or read clip envelopes. M4L JS only gets
`clear_envelope(param)`, `clear_all_envelopes()`, and the `has_envelopes`
property. No API anywhere enumerates envelope breakpoints; reading means
sampling `value_at_time` on a grid.

## Evidence

The Cycling74 LOM Clip reference lists `clear_envelope` and
`clear_all_envelopes` among its functions but no `automation_envelope` /
`create_automation_envelope`, and the LOM class index has no
`AutomationEnvelope` class. The Live 11 Python API XML documents
`automation_envelope(Clip, DeviceParameter) -> AutomationEnvelope`,
`create_automation_envelope`, `insert_step(double, double, double)`, and
`value_at_time(double)`. A Cycling74 forum thread confirms the gap persists in
Live 12.1 (users exposed the functions only by hex-editing `LomTypes.pyc`).

## Apply when

Touching `src/tools/clip/automate/**` or `live_browser_bridge/automation_ops.py`
— envelope write/read must route through the Python bridge, never the v8
adapter. Also when considering any new Live API surface: verify against the LOM
reference before assuming a Python-documented function is callable from M4L JS.
