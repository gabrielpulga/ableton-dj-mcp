// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

export interface RoutingParams {
  inputRoutingTypeId?: string;
  inputRoutingChannelId?: string;
  outputRoutingTypeId?: string;
  outputRoutingChannelId?: string;
}

/**
 * Apply routing properties to a track
 * @param track - Track object
 * @param params - Routing properties
 */
export function applyRoutingProperties(
  track: LiveAPI,
  params: RoutingParams,
): void {
  const {
    inputRoutingTypeId,
    inputRoutingChannelId,
    outputRoutingTypeId,
    outputRoutingChannelId,
  } = params;

  if (inputRoutingTypeId != null) {
    track.setProperty("input_routing_type", {
      identifier: Number(inputRoutingTypeId),
    });
  }

  if (inputRoutingChannelId != null) {
    track.setProperty("input_routing_channel", {
      identifier: Number(inputRoutingChannelId),
    });
  }

  if (outputRoutingTypeId != null) {
    track.setProperty("output_routing_type", {
      identifier: Number(outputRoutingTypeId),
    });
  }

  if (outputRoutingChannelId != null) {
    track.setProperty("output_routing_channel", {
      identifier: Number(outputRoutingChannelId),
    });
  }
}
