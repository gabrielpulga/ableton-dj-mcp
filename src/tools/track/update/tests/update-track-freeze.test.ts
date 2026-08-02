// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { beforeEach, describe, expect, it } from "vitest";
import { livePath } from "#src/shared/live-api-path-builders.ts";
import {
  type RegisteredMockObject,
  registerMockObject,
} from "#src/test/mocks/mock-registry.ts";
import { updateTrack } from "../update-track.ts";
import "#src/live-api-adapter/live-api-extensions.ts";

const FLATTEN_WARNING =
  "Flatten is irreversible: devices were removed and frozen audio was committed as clips.";

describe("updateTrack - freeze and flatten", () => {
  let track123: RegisteredMockObject;

  beforeEach(() => {
    track123 = registerMockObject("123", { path: livePath.track(0) });
    registerMockObject("456", { path: livePath.track(1) });
  });

  /**
   * Wire track123's set/get mocks so `is_frozen` reflects the last value
   * written via `freeze`, simulating Live confirming the operation on the
   * very next poll.
   * @param initiallyFrozen - Starting frozen state before any `set` call
   */
  function mockFreezeConfirmsImmediately(initiallyFrozen: boolean): void {
    let frozen = initiallyFrozen;

    track123.set.mockImplementation((prop: string, value: unknown) => {
      if (prop === "freeze") {
        frozen = Boolean(value);
      }
    });
    track123.get.mockImplementation((prop: string) => {
      if (prop === "is_frozen") return [frozen ? 1 : 0];

      return [0];
    });
  }

  it("should freeze a track and report isFrozen once confirmed", async () => {
    mockFreezeConfirmsImmediately(false);

    const result = await updateTrack({ ids: "123", freeze: true });

    expect(track123.set).toHaveBeenCalledWith("freeze", true);
    expect(result).toStrictEqual({ id: "123", isFrozen: true });
  });

  it("should unfreeze a track and report isFrozen once confirmed", async () => {
    mockFreezeConfirmsImmediately(true);

    const result = await updateTrack({ ids: "123", freeze: false });

    expect(track123.set).toHaveBeenCalledWith("freeze", false);
    expect(result).toStrictEqual({ id: "123", isFrozen: false });
  });

  it("should report freezeStatus in_progress when Live doesn't confirm within the polling window", async () => {
    // is_frozen stays at the default (0) no matter what freeze is set to,
    // simulating a freeze that hasn't finished rendering yet.
    const result = await updateTrack({ ids: "123", freeze: true });

    expect(track123.set).toHaveBeenCalledWith("freeze", true);
    expect(outlet).toHaveBeenCalledWith(
      1,
      "updateTrack: track 123 did not confirm freeze within the polling window",
    );
    expect(result).toStrictEqual({ id: "123", freezeStatus: "in_progress" });
  });

  it("should skip polling and report in_progress once the request deadline has passed", async () => {
    mockFreezeConfirmsImmediately(false);

    // timeoutMs: 0 puts the computed deadline in the past, so the freeze is
    // set but completion is never polled for.
    const result = await updateTrack(
      { ids: "123", freeze: true },
      { timeoutMs: 0 },
    );

    expect(track123.set).toHaveBeenCalledWith("freeze", true);
    expect(result).toStrictEqual({ id: "123", freezeStatus: "in_progress" });
  });

  it("should skip flatten and warn when the track isn't frozen", async () => {
    const result = await updateTrack({ ids: "123", flatten: true });

    expect(track123.call).not.toHaveBeenCalledWith("flatten");
    expect(outlet).toHaveBeenCalledWith(
      1,
      "updateTrack: track 123 must be frozen before flatten, skipping",
    );
    expect(result).toStrictEqual({ id: "123" });
  });

  it("should flatten a frozen track and surface an irreversibility warning", async () => {
    track123.get.mockImplementation((prop: string) => {
      if (prop === "is_frozen") return [1];

      return [0];
    });

    const result = await updateTrack({ ids: "123", flatten: true });

    expect(track123.call).toHaveBeenCalledWith("flatten");
    expect(result).toStrictEqual({
      id: "123",
      flattened: true,
      $meta: [FLATTEN_WARNING],
    });
  });

  it("should freeze then flatten in a single call", async () => {
    mockFreezeConfirmsImmediately(false);

    const result = await updateTrack({
      ids: "123",
      freeze: true,
      flatten: true,
    });

    expect(track123.set).toHaveBeenCalledWith("freeze", true);
    expect(track123.call).toHaveBeenCalledWith("flatten");
    expect(result).toStrictEqual({
      id: "123",
      isFrozen: true,
      flattened: true,
      $meta: [FLATTEN_WARNING],
    });
  });

  it("should not touch freeze state when neither freeze nor flatten is provided", async () => {
    const result = await updateTrack({ ids: "123", name: "Untouched" });

    expect(track123.set).not.toHaveBeenCalledWith("freeze", expect.anything());
    expect(track123.call).not.toHaveBeenCalledWith("flatten");
    expect(result).toStrictEqual({ id: "123" });
  });
});
