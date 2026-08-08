// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import { livePath } from "#src/shared/live-api-path-builders.ts";
import { setupTrackMock } from "../helpers/read-track-registry-test-helpers.ts";
import { readTrack } from "../read-track.ts";

describe("readTrack - meter properties", () => {
  it("excludes meter properties by default", () => {
    setupTrackMock();

    const result = readTrack({ trackIndex: 0 });

    expect(result).not.toHaveProperty("meterLeft");
    expect(result).not.toHaveProperty("meterRight");
    expect(result).not.toHaveProperty("meterLevel");
  });

  it("includes meter properties when requested", () => {
    setupTrackMock({
      properties: {
        output_meter_left: 0.75,
        output_meter_right: 0.5,
        output_meter_level: 0.6,
      },
    });

    const result = readTrack({ trackIndex: 0, include: ["meters"] });

    expect(result).toHaveProperty("meterLeft", 0.75);
    expect(result).toHaveProperty("meterRight", 0.5);
    expect(result).toHaveProperty("meterLevel", 0.6);
  });

  it("reads zero levels while the transport is stopped", () => {
    setupTrackMock({
      properties: {
        output_meter_left: 0,
        output_meter_right: 0,
        output_meter_level: 0,
      },
    });

    const result = readTrack({ trackIndex: 0, include: ["meters"] });

    expect(result).toHaveProperty("meterLeft", 0);
    expect(result).toHaveProperty("meterRight", 0);
    expect(result).toHaveProperty("meterLevel", 0);
  });

  it("includes meter properties for the master track", () => {
    setupTrackMock({
      trackPath: String(livePath.masterTrack()),
      trackId: "master",
      properties: {
        has_midi_input: 0,
        name: "Master",
        output_meter_left: 0.9,
        output_meter_right: 0.85,
        output_meter_level: 0.87,
      },
    });

    const result = readTrack({ trackType: "master", include: ["meters"] });

    expect(result).toHaveProperty("meterLeft", 0.9);
    expect(result).toHaveProperty("meterRight", 0.85);
    expect(result).toHaveProperty("meterLevel", 0.87);
  });

  it("includes meters with wildcard include", () => {
    setupTrackMock({
      properties: {
        output_meter_left: 0.3,
        output_meter_right: 0.2,
        output_meter_level: 0.25,
      },
    });

    const result = readTrack({ trackIndex: 0, include: ["*"] });

    expect(result).toHaveProperty("meterLeft", 0.3);
    expect(result).toHaveProperty("meterRight", 0.2);
    expect(result).toHaveProperty("meterLevel", 0.25);
  });
});
