// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPendingSleepTaskCount, waitUntil } from "#src/shared/v8-sleep.ts";

const g = globalThis as Record<string, unknown>;

// Mock the Task object for the Max for Live environment
class MockTask {
  private callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }

  schedule(_ms: number) {
    // Immediately resolve for testing
    setTimeout(this.callback, 0);
  }
}
g.Task = MockTask;

describe("v8-sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("waitUntil", () => {
    it("returns true immediately when predicate is true on first check", async () => {
      const predicate = vi.fn().mockReturnValue(true);

      const result = await waitUntil(predicate);

      expect(result).toBe(true);
      expect(predicate).toHaveBeenCalledTimes(1);
    });

    it("returns true after predicate becomes true on subsequent check", async () => {
      let callCount = 0;
      const predicate = vi.fn().mockImplementation(() => {
        callCount++;

        return callCount >= 3;
      });

      const resultPromise = waitUntil(predicate, { pollingInterval: 10 });

      // Advance timers to allow async operations
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result).toBe(true);
      expect(predicate).toHaveBeenCalledTimes(3);
    });

    it("returns false when max retries exceeded", async () => {
      const predicate = vi.fn().mockReturnValue(false);

      const resultPromise = waitUntil(predicate, {
        pollingInterval: 10,
        maxRetries: 5,
      });

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result).toBe(false);
      expect(predicate).toHaveBeenCalledTimes(5);
    });

    it("uses default options when none provided", async () => {
      const predicate = vi.fn().mockReturnValue(true);

      const result = await waitUntil(predicate);

      expect(result).toBe(true);
    });
  });

  // Real Max Tasks can be garbage collected before their scheduled callback
  // fires unless something keeps referencing them (see Cycling '74's Task
  // docs). Node's GC won't reproduce that nondeterministically in a test, so
  // these assert the retention mechanism itself: a Task must stay reachable
  // for as long as its sleep() is outstanding, and get released once it
  // fires - otherwise every wait either hangs forever (unreleased Task never
  // called back) or leaks Tasks indefinitely (never removed from tracking).
  describe("Task retention", () => {
    it("keeps the Task referenced while waiting and releases it once it fires", async () => {
      expect(getPendingSleepTaskCount()).toBe(0);

      let callCount = 0;
      const predicate = vi.fn().mockImplementation(() => {
        callCount++;

        return callCount >= 2;
      });

      const resultPromise = waitUntil(predicate, { pollingInterval: 10 });

      // The first (false) predicate check runs synchronously, which starts a
      // sleep() before any timer has advanced - the underlying Task must
      // already be tracked at this point, or it would be eligible for
      // premature collection in the real M4L runtime.
      expect(getPendingSleepTaskCount()).toBe(1);

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result).toBe(true);
      expect(getPendingSleepTaskCount()).toBe(0);
    });

    it("tracks multiple concurrent sleeps independently", async () => {
      const first = waitUntil(() => false, {
        pollingInterval: 10,
        maxRetries: 1,
      });
      const second = waitUntil(() => false, {
        pollingInterval: 20,
        maxRetries: 1,
      });

      expect(getPendingSleepTaskCount()).toBe(2);

      await vi.runAllTimersAsync();
      await Promise.all([first, second]);

      expect(getPendingSleepTaskCount()).toBe(0);
    });
  });
});
