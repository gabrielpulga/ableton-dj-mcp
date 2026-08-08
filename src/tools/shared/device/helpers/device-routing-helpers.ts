// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

const COMPRESSOR_DEVICE_TYPE = "CompressorDevice";

interface RoutingInfo {
  display_name: string;
  identifier: string | number;
}

interface RoutingRef {
  name: string;
  id: string;
}

export interface SidechainRoutingReadOptions {
  includeCurrent: boolean;
  includeAvailable: boolean;
}

export interface SidechainRoutingWriteParams {
  sidechainInputRoutingTypeId?: string;
  sidechainInputRoutingChannelId?: string;
}

/**
 * Check if a device type supports sidechain input routing. Only the
 * standard Compressor exposes this in the Live Object Model — Gate and
 * Glue Compressor have no dedicated LOM subclass for it.
 * @param type - Device type (LiveAPI's `.type` accessor, e.g. "CompressorDevice")
 * @returns True if the device supports sidechain input routing
 */
export function isSidechainRoutableDevice(type: string): boolean {
  return type === COMPRESSOR_DEVICE_TYPE;
}

/**
 * Read a Compressor's sidechain input routing (current selection and/or
 * available options). No-op for any other device type.
 * @param device - Device to read
 * @param options - Which parts to include
 * @returns Sidechain routing fields, or an empty object if not applicable
 */
export function readSidechainRouting(
  device: LiveAPI,
  options: SidechainRoutingReadOptions,
): Record<string, unknown> {
  if (!isSidechainRoutableDevice(device.type)) return {};

  const result: Record<string, unknown> = {};

  if (options.includeCurrent) {
    const type = device.getProperty("input_routing_type") as RoutingInfo | null;
    const channel = device.getProperty(
      "input_routing_channel",
    ) as RoutingInfo | null;

    result.sidechainInputRoutingType = toRoutingRef(type);
    result.sidechainInputRoutingChannel = toRoutingRef(channel);
  }

  if (options.includeAvailable) {
    const types = (device.getProperty("available_input_routing_types") ??
      []) as RoutingInfo[];
    const channels = (device.getProperty("available_input_routing_channels") ??
      []) as RoutingInfo[];

    result.availableSidechainInputRoutingTypes = types.map(toRoutingRefStrict);
    result.availableSidechainInputRoutingChannels =
      channels.map(toRoutingRefStrict);
  }

  return result;
}

/**
 * Apply sidechain input routing to a Compressor device.
 * @param device - Compressor device to update
 * @param params - Routing identifiers (from readSidechainRouting's
 *   available-routing lists)
 */
export function applySidechainRouting(
  device: LiveAPI,
  params: SidechainRoutingWriteParams,
): void {
  if (params.sidechainInputRoutingTypeId != null) {
    device.setProperty("input_routing_type", {
      identifier: Number(params.sidechainInputRoutingTypeId),
    });
  }

  if (params.sidechainInputRoutingChannelId != null) {
    device.setProperty("input_routing_channel", {
      identifier: Number(params.sidechainInputRoutingChannelId),
    });
  }
}

/**
 * Convert a raw Live API routing dict to a name/id ref, or null.
 * @param routing - Raw routing property value
 * @returns Simplified ref, or null when absent
 */
function toRoutingRef(routing: RoutingInfo | null): RoutingRef | null {
  return routing ? toRoutingRefStrict(routing) : null;
}

/**
 * Convert a raw Live API routing dict to a name/id ref.
 * @param routing - Raw routing property value
 * @returns Simplified ref
 */
function toRoutingRefStrict(routing: RoutingInfo): RoutingRef {
  return { name: routing.display_name, id: String(routing.identifier) };
}
