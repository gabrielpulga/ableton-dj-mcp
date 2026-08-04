---
title: portal-restart-exposes-new-tools
domain: workflow
validated: 2026-08-02
evidence: "user confirmed (/mcp reconnect exposed adj-automate)"
---

## Fact

The MCP client's tool list is fixed when the portal connection is established.
A tool added by a server/portal update (e.g. `adj-automate` in v2.1.0) does not
appear in an already-connected session even though `adj-connect` reports the
new server version — the connection must be re-established.

## Evidence

Session on server 2.1.0 (build 82953bf1, which includes the adj-automate
commit): `adj-connect` succeeded and reported v2.1.0, but adj-automate was
absent from the tool registry and unresolvable. After the user ran `/mcp` →
reconnect, the tool appeared and a dub-throw write succeeded on the first call.

## Apply when

A documented adj-* tool is missing from a live session, or after deploying a
new server/portal build (`dist/**`, `src/portal/**`) — reconnect the MCP
connection before debugging deeper.
