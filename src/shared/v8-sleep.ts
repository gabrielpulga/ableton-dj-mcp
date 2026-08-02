// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Sleep utility for V8 environment in Max for Live
 * Uses Max's Task object for scheduling
 */

// Declare global Task type from Max for Live environment
declare const Task: new (callback: () => void) => {
  schedule: (ms: number) => void;
};

/**
 * Keeps in-flight sleep Tasks reachable so the Max v8 engine can't
 * garbage-collect them before their scheduled callback fires.
 *
 * Per Cycling '74's Task documentation, "Task objects persist beyond their
 * code scope (otherwise, the object could be garbage collected before its
 * scheduled function is called)." Their own example assigns the Task to a
 * variable that outlives the creating function
 * (`var tsk = new Task(cb); tsk.schedule(200)`) for exactly this reason.
 * Creating and scheduling a Task inline with no other reference - e.g.
 * `new Task(cb).schedule(ms)` - is the unsafe pattern the docs warn against:
 * once the enclosing function returns, nothing keeps the Task alive, so it
 * can be collected before it ever fires, leaving the Promise permanently
 * unresolved. This module-level Set is that persistent reference for every
 * in-flight `sleep()` call.
 */
const pendingSleepTasks = new Set<object>();

/**
 * Sleep for the specified number of milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Resolves after the delay
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    const task = new Task(() => {
      pendingSleepTasks.delete(task);
      resolve();
    });

    pendingSleepTasks.add(task);
    task.schedule(ms);
  });

/**
 * Number of Tasks currently scheduled and kept alive by `sleep()`.
 * Real garbage collection is nondeterministic and can't be forced from a
 * test, so this exposes the retention mechanism directly for assertions.
 * @internal test-only
 * @returns Count of Tasks awaiting their scheduled callback
 */
export function getPendingSleepTaskCount(): number {
  return pendingSleepTasks.size;
}

interface WaitUntilOptions {
  pollingInterval?: number;
  maxRetries?: number;
}

/**
 * Wait until a predicate returns true, polling at intervals
 * @param predicate - Function that returns true when condition is met
 * @param options - Options
 * @param options.pollingInterval - Milliseconds between polls (default: 10)
 * @param options.maxRetries - Maximum number of retries before giving up (default: 10)
 * @returns True if predicate became true, false if max retries exceeded
 */
export async function waitUntil(
  predicate: () => boolean,
  { pollingInterval = 10, maxRetries = 10 }: WaitUntilOptions = {},
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    if (predicate()) {
      return true;
    }

    await sleep(pollingInterval);
  }

  return false;
}
