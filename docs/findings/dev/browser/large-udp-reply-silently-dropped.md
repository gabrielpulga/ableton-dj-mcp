---
title: large-udp-reply-silently-dropped
domain: dev
validated: 2026-08-08
evidence: PR #290, live Ableton 12.4.3 session log
---

## Fact

A `browse` reply over macOS's `net.inet.udp.maxdgram` (9216 bytes) fails
`sendto()` with `EMSGSIZE`. `BrowserBridge._send()` catches that and only logs
it, so the reply is silently dropped and the caller just sees its own request
time out — with nothing indicating the real cause. A folder with ~65-70 items of
typical name length already exceeds this, well under the tool's default
`limit=100`.

## Evidence

Live console log during the exact failure:

```
[adj-bridge] udp send failed: [Errno 40] Message too long
```

Capping enumeration speed alone (`browser_ops.children_of` early-exit) did not
fix the reported timeout on a real Live instance; only bounding the serialized
reply to `MAX_REPLY_BYTES` (8192, see `browser_ops.browse`) did.

## Apply when

Adding fields to `browse`'s per-item payload, raising `depth`, or debugging any
bridge op (`browse`, `automation_read`) that returns a variable-length list over
UDP — check reply byte size before assuming a timeout means slow enumeration.
