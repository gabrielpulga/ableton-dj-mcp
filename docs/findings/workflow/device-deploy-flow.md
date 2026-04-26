---
title: device-deploy-flow
domain: workflow
validated: 2026-04-25
evidence: live deploy 1.6.0 → 1.8.0 → 1.8.1 in conversation 2026-04-25
---

## Fact

The `.amxd` device references sibling JS files via relative path. Build
artefacts must be copied from `dist/` into `max-for-live-device/` for new code
to take effect. Live caches V8 bytecode per session — restart Live (or eject +
reinsert device) to load updated JS.

## Evidence

`.amxd` patcher contains:

```
"text" : "v8 ./live-api-adapter.js"
"text" : "node.script ./mcp-server.mjs @watch 1"
```

`@watch 1` auto-reloads node.script on file change. V8 does NOT auto-reload —
requires device reload or Live restart.

Deploy commands:

```bash
git checkout main && git pull
npm run build
cp dist/live-api-adapter.js max-for-live-device/live-api-adapter.js
cp dist/mcp-server.mjs max-for-live-device/mcp-server.mjs
# Then restart Live OR eject + reinsert .amxd
```

Verify in Live console:

```
node.script: [...] Ableton DJ MCP <expected-version> running.
v8: [...] Ableton DJ MCP <expected-version> Live API adapter ready
```

## Apply when

Deploying any code change that needs to run inside the `.amxd`. Both V8 and
node.script versions must match the expected version string after restart.
