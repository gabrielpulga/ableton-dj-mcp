---
title: v8-task-needs-persistent-ref
domain: dev
validated: 2026-08-02
evidence:
  docs.cycling74.com/max8/vignettes/jstaskobject;
  src/shared/tests/v8-sleep.test.ts "Task retention" suite; confirmed live in
  Ableton Live 12.4.3 (adj-update-track freeze call returned promptly instead of
  hanging 30s)
---

## Fact

A Max `Task` created and scheduled inline with no other reference
(`new Task(cb).schedule(ms)`) risks garbage collection before its callback
fires. `sleep()` in `src/shared/v8-sleep.ts` used exactly that pattern, so any
`waitUntil()` poll loop (track freeze confirmation, locator playhead wait) could
hang past its coded timeout instead of resolving.

## Evidence

Cycling '74 Task docs: "Task objects persist beyond their code scope (otherwise,
the object could be garbage collected before its scheduled function is called),"
shown fixed via `var tsk = new Task(cb); tsk.schedule(200)`. Fixed by keeping
every in-flight Task in a module-level `Set` until its callback fires; retention
verified by `getPendingSleepTaskCount()` assertions in
`src/shared/tests/v8-sleep.test.ts`. Before the fix,
`adj-update-track { freeze: true }` hung for the full 30s client-side tool-call
timeout with zero output. After the fix, the same call returns immediately with
`freezeStatus: "in_progress"` per its coded ~10s polling ceiling.

## Apply when

Writing V8 Live API adapter code (`src/live-api-adapter/**`) that schedules a
Max `Task` directly, or that calls `sleep()`/`waitUntil()` in
`src/shared/v8-sleep.ts`.
