---
title: browser-bridge-needs-live-restart
domain: workflow
validated: 2026-08-08
evidence: PR #290 live verification session
---

## Fact

`npm run install:bridge` copies `live_browser_bridge/` into Live's Remote
Scripts folder, but Live loads the Python remote script once at startup.
Re-running `install:bridge` (or rebuilding) while Live keeps running does not
reload edited Python — a full Live restart is required, separate from the
`.amxd`'s own V8/node.script reload path in
[`device-deploy-flow`](device-deploy-flow.md).

## Evidence

Editing `live_browser_bridge/browser_ops.py`, rebuilding, and re-running
`install:bridge` while Live stayed open left `adj-browse` failing with the
pre-fix behavior on the next call; `adj-connect` still reported the same bridge
as before. Only after the user restarted Live did the edited `browser_ops.py`
take effect — reproduced twice in the same session, once per fix iteration.

## Apply when

Deploying any change under `live_browser_bridge/` for live verification —
`install:bridge` alone is not enough, Live itself must restart.
