---
title: clip-envelope-survives-duplicate
domain: dev
validated: 2026-08-02
evidence: "user confirmed (Live 12.4.3, server 2.1.0)"
---

## Fact

Clip envelopes written on a session clip survive `adj-duplicate` to the
arrangement. Since the envelope API is session-clip-only (see
clip-envelope-api-python-only), this is the only path to arrangement automation:
write envelope on session source → duplicate to arrangement position → clear the
source's envelope.

## Evidence

Live 12.4.3 session: `adj-automate` dub-throw recipe on session clip (19 points,
B-Delay send), `adj-duplicate` to arrangement 21|1, user confirmed the envelope
visible in the arrangement clip's Envelopes box and audible as a delay throw.
API read-back cannot verify — `adj-automate read` on the arrangement clip raises
the session-clip error.

## Apply when

Generating arrangement automation via `src/tools/clip/automate/**` or
`src/tools/operations/duplicate/**`. Caveats: the duplicate replaces the target
tile wholesale (custom notes/transforms in that tile are lost — match session
content first), and carried envelopes are invisible to the API afterward.
