// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearMockRegistry,
  registerMockObject,
} from "#src/test/mocks/mock-registry.ts";
import { readDevice } from "../read-device.ts";

describe("readDevice - sidechain routing (#268, #93)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRegistry();
  });

  it("includes current sidechain routing for a Compressor with routings", () => {
    registerMockObject("comp-1", {
      path: "id comp-1",
      type: "CompressorDevice",
      properties: {
        class_display_name: "Compressor",
        type: 2, // LIVE_API_DEVICE_TYPE_AUDIO_EFFECT
        can_have_chains: 0,
        can_have_drum_pads: 0,
        is_active: 1,
        input_routing_type: [
          '{"input_routing_type": {"display_name": "Drums", "identifier": 3}}',
        ],
        input_routing_channel: [
          '{"input_routing_channel": {"display_name": "Post FX", "identifier": 1}}',
        ],
      },
    });

    const result = readDevice({ deviceId: "comp-1", include: ["routings"] });

    expect(result).toMatchObject({
      sidechainInputRoutingType: { name: "Drums", id: "3" },
      sidechainInputRoutingChannel: { name: "Post FX", id: "1" },
    });
  });

  it("includes available sidechain routing options for a Compressor", () => {
    registerMockObject("comp-2", {
      path: "id comp-2",
      type: "CompressorDevice",
      properties: {
        class_display_name: "Compressor",
        type: 2,
        can_have_chains: 0,
        can_have_drum_pads: 0,
        is_active: 1,
        available_input_routing_types: [
          '{"available_input_routing_types": [{"display_name": "Drums", "identifier": 3}, {"display_name": "Bass", "identifier": 4}]}',
        ],
        available_input_routing_channels: [
          '{"available_input_routing_channels": [{"display_name": "Post FX", "identifier": 1}]}',
        ],
      },
    });

    const result = readDevice({
      deviceId: "comp-2",
      include: ["available-routings"],
    });

    expect(result).toMatchObject({
      availableSidechainInputRoutingTypes: [
        { name: "Drums", id: "3" },
        { name: "Bass", id: "4" },
      ],
      availableSidechainInputRoutingChannels: [{ name: "Post FX", id: "1" }],
    });
  });

  it("omits sidechain routing fields for non-Compressor devices", () => {
    registerMockObject("plugin-1", {
      path: "id plugin-1",
      type: "PluginDevice",
      properties: {
        class_display_name: "Operator",
        type: 1, // LIVE_API_DEVICE_TYPE_INSTRUMENT
        can_have_chains: 0,
        can_have_drum_pads: 0,
        is_active: 1,
        input_routing_type: { display_name: "Drums", identifier: 3 },
      },
    });

    const result = readDevice({
      deviceId: "plugin-1",
      include: ["routings", "available-routings"],
    });

    expect(result).not.toHaveProperty("sidechainInputRoutingType");
    expect(result).not.toHaveProperty("availableSidechainInputRoutingTypes");
  });

  it("omits sidechain routing fields when not requested, even for a Compressor", () => {
    registerMockObject("comp-3", {
      path: "id comp-3",
      type: "CompressorDevice",
      properties: {
        class_display_name: "Compressor",
        type: 2,
        can_have_chains: 0,
        can_have_drum_pads: 0,
        is_active: 1,
        input_routing_type: { display_name: "Drums", identifier: 3 },
      },
    });

    const result = readDevice({ deviceId: "comp-3" });

    expect(result).not.toHaveProperty("sidechainInputRoutingType");
  });
});
