// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it, vi } from "vitest";
import {
  applySidechainRouting,
  isSidechainRoutableDevice,
  readSidechainRouting,
} from "../device-routing-helpers.ts";

interface MockRoutingInfo {
  display_name: string;
  identifier: string | number;
}

/**
 * Build a minimal mock device with a fixed type and property map.
 * @param type - Device type (LiveAPI's `.type` accessor)
 * @param properties - Property values returned by getProperty
 * @returns Mock LiveAPI-shaped device
 */
function mockDevice(type: string, properties: Record<string, unknown> = {}) {
  return {
    type,
    getProperty: vi.fn((prop: string) => properties[prop] ?? null),
    setProperty: vi.fn(),
  };
}

describe("isSidechainRoutableDevice", () => {
  it("returns true for CompressorDevice", () => {
    expect(isSidechainRoutableDevice("CompressorDevice")).toBe(true);
  });

  it("returns false for Gate-like or other device types", () => {
    // Gate and Glue Compressor have no dedicated LOM subclass for sidechain
    // routing, so they fall through as plain "PluginDevice" or similar —
    // never "CompressorDevice" (see #268/#93).
    expect(isSidechainRoutableDevice("PluginDevice")).toBe(false);
    expect(isSidechainRoutableDevice("RackDevice")).toBe(false);
    expect(isSidechainRoutableDevice("Chain")).toBe(false);
    expect(isSidechainRoutableDevice("DrumPad")).toBe(false);
  });
});

describe("readSidechainRouting", () => {
  it("returns empty object for non-Compressor devices", () => {
    const device = mockDevice("PluginDevice", {
      input_routing_type: { display_name: "Drums", identifier: 3 },
    });

    const result = readSidechainRouting(device as unknown as LiveAPI, {
      includeCurrent: true,
      includeAvailable: true,
    });

    expect(result).toStrictEqual({});
    expect(device.getProperty).not.toHaveBeenCalled();
  });

  it("reads current routing selection for a Compressor", () => {
    const type: MockRoutingInfo = { display_name: "Drums", identifier: 3 };
    const channel: MockRoutingInfo = { display_name: "Post FX", identifier: 1 };
    const device = mockDevice("CompressorDevice", {
      input_routing_type: type,
      input_routing_channel: channel,
    });

    const result = readSidechainRouting(device as unknown as LiveAPI, {
      includeCurrent: true,
      includeAvailable: false,
    });

    expect(result).toStrictEqual({
      sidechainInputRoutingType: { name: "Drums", id: "3" },
      sidechainInputRoutingChannel: { name: "Post FX", id: "1" },
    });
  });

  it("returns null current routing fields when unset", () => {
    const device = mockDevice("CompressorDevice", {});

    const result = readSidechainRouting(device as unknown as LiveAPI, {
      includeCurrent: true,
      includeAvailable: false,
    });

    expect(result).toStrictEqual({
      sidechainInputRoutingType: null,
      sidechainInputRoutingChannel: null,
    });
  });

  it("reads available routing options for a Compressor", () => {
    const device = mockDevice("CompressorDevice", {
      available_input_routing_types: [
        { display_name: "Drums", identifier: 3 },
        { display_name: "Bass", identifier: 4 },
      ],
      available_input_routing_channels: [
        { display_name: "Post FX", identifier: 1 },
        { display_name: "Pre FX", identifier: 2 },
      ],
    });

    const result = readSidechainRouting(device as unknown as LiveAPI, {
      includeCurrent: false,
      includeAvailable: true,
    });

    expect(result).toStrictEqual({
      availableSidechainInputRoutingTypes: [
        { name: "Drums", id: "3" },
        { name: "Bass", id: "4" },
      ],
      availableSidechainInputRoutingChannels: [
        { name: "Post FX", id: "1" },
        { name: "Pre FX", id: "2" },
      ],
    });
  });

  it("defaults available routing lists to empty arrays when unset", () => {
    const device = mockDevice("CompressorDevice", {});

    const result = readSidechainRouting(device as unknown as LiveAPI, {
      includeCurrent: false,
      includeAvailable: true,
    });

    expect(result).toStrictEqual({
      availableSidechainInputRoutingTypes: [],
      availableSidechainInputRoutingChannels: [],
    });
  });
});

describe("applySidechainRouting", () => {
  it("writes the type identifier as a number", () => {
    const device = mockDevice("CompressorDevice");

    applySidechainRouting(device as unknown as LiveAPI, {
      sidechainInputRoutingTypeId: "3",
    });

    expect(device.setProperty).toHaveBeenCalledWith("input_routing_type", {
      identifier: 3,
    });
    expect(device.setProperty).not.toHaveBeenCalledWith(
      "input_routing_channel",
      expect.anything(),
    );
  });

  it("writes the channel identifier as a number", () => {
    const device = mockDevice("CompressorDevice");

    applySidechainRouting(device as unknown as LiveAPI, {
      sidechainInputRoutingChannelId: "1",
    });

    expect(device.setProperty).toHaveBeenCalledWith("input_routing_channel", {
      identifier: 1,
    });
  });

  it("writes both when both are provided", () => {
    const device = mockDevice("CompressorDevice");

    applySidechainRouting(device as unknown as LiveAPI, {
      sidechainInputRoutingTypeId: "3",
      sidechainInputRoutingChannelId: "1",
    });

    expect(device.setProperty).toHaveBeenCalledTimes(2);
  });

  it("writes nothing when neither is provided", () => {
    const device = mockDevice("CompressorDevice");

    applySidechainRouting(device as unknown as LiveAPI, {});

    expect(device.setProperty).not.toHaveBeenCalled();
  });
});
