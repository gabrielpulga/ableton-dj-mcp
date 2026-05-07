---
title: self-bootstrap-prereq
domain: workflow
validated: 2026-05-06
evidence:
  user confirmed "doesnt really work" on first lazy-boot test until default-set
  fixed
---

## Fact

Portal lazy-boot (`ADJ_AUTO_BOOT=true`) only launches Live. It does NOT load the
device. The device only auto-loads if the user has done **File → Save Live Set
as Default Set** with the device on a return/master track. Without that,
lazy-boot opens an empty Live, `:3350` never comes up, and the original tool
call still fails.

## Evidence

End-to-end test in conversation 2026-05-06:

1. `ADJ_AUTO_BOOT=true` set in Claude Code MCP config.
2. Live closed.
3. AI tool call → portal launched Live (verified: Live appeared on screen).
4. `curl http://localhost:3350/mcp` →
   `Failed to connect ... Couldn't connect to server`. State 4 from the
   lazy-boot state machine.
5. After dragging device on track + Save Live Set as Default Set + restart Live:
   `:3350` came up immediately, lazy-boot path worked end-to-end.

State 3 in `src/portal/lazy-boot.ts` (Live open without device) returns
`live-running-without-device` and skips relaunch to preserve unsaved work —
correct, but the underlying problem is the absent default set.

## Apply when

Debugging `:3350` down after lazy-boot launches Live, writing setup/install docs
that promise self-bootstrap, or designing a `template.als` ship as a fallback
when no default set is configured.
