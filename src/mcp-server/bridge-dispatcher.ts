// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Dispatcher wrapper that intercepts browser-aware tool calls and forwards
// them to the Python sidecar over UDP. Other tool calls pass straight through
// to the existing v8 LiveAPI dispatcher.

import { formatErrorResponse } from "#src/shared/mcp-response-utils.ts";
import {
  BridgeCallError,
  type BrowserBridgeClient,
} from "./browser-bridge-client.ts";
import { type CallLiveApiFunction } from "./create-mcp-server.ts";
import { type McpResponse } from "./max-api-adapter.ts";

interface BrowseToolArgs {
  category?: string;
  path?: string;
  search?: string;
  depth?: number;
  limit?: number;
}

interface CreateDeviceArgs {
  deviceName?: string;
  path?: string;
  name?: string;
  browserUri?: string;
  focus?: boolean;
}

const INSTALL_HINT =
  "Bridge unavailable. Run `npm run install:bridge`, then restart Live and " +
  "enable AbletonDjMcp under Preferences → Link/Tempo/MIDI → Control Surface.";

/**
 * Wrap the v8 dispatcher with bridge-aware handling for browser tools.
 *
 * @param next - Underlying call (forwards to Max v8 over Max API)
 * @param bridge - Browser bridge client (lazy: ping is deferred until use)
 * @returns Wrapped dispatcher with the same callable signature
 */
export function makeBridgeDispatcher(
  next: CallLiveApiFunction,
  bridge: BrowserBridgeClient,
): CallLiveApiFunction {
  return async (tool: string, args: object): Promise<object> => {
    if (tool === "adj-browse") {
      return await handleBrowse(bridge, args);
    }

    if (tool === "adj-create-device") {
      const cdArgs = args as CreateDeviceArgs;

      if (cdArgs.browserUri) {
        return await handleCreateDeviceBrowserUri(bridge, next, cdArgs);
      }
    }

    return await next(tool, args);
  };
}

async function handleBrowse(
  bridge: BrowserBridgeClient,
  args: BrowseToolArgs,
): Promise<McpResponse> {
  if (!(await bridge.ensureAlive())) {
    return formatErrorResponse(INSTALL_HINT);
  }

  try {
    const result = await bridge.browse(args);

    return successPayload(result);
  } catch (err) {
    return formatErrorResponse(formatBridgeError("browse", err));
  }
}

async function handleCreateDeviceBrowserUri(
  bridge: BrowserBridgeClient,
  next: CallLiveApiFunction,
  args: CreateDeviceArgs,
): Promise<McpResponse> {
  if (!args.path) {
    return formatErrorResponse(
      "createDevice failed: path is required when using browserUri",
    );
  }

  if (!(await bridge.ensureAlive())) {
    return formatErrorResponse(INSTALL_HINT);
  }

  // Pre-select the target track/chain via the v8 layer so the bridge's
  // load_item lands in the right place. selected_track is the only handle the
  // browser API accepts for routing the load.
  const selectArgs: Record<string, unknown> = {
    path: args.path,
    detailView: "device",
  };
  const selectResult = (await next("adj-select", selectArgs)) as McpResponse;

  if (selectResult.isError) return selectResult;

  // Drum-kit compound: caller passed deviceName=Drum Rack + browserUri. Insert
  // the rack first, then load the kit into the now-focused rack.
  if (args.deviceName) {
    const insertArgs: Record<string, unknown> = {
      deviceName: args.deviceName,
      path: args.path,
    };

    if (args.name != null) insertArgs.name = args.name;
    const insertResult = (await next(
      "adj-create-device",
      insertArgs,
    )) as McpResponse;

    if (insertResult.isError) return insertResult;
  }

  try {
    const result = await bridge.loadItem({ uri: args.browserUri ?? "" });

    return successPayload(result);
  } catch (err) {
    return formatErrorResponse(formatBridgeError("load_item", err));
  }
}

function successPayload(value: unknown): McpResponse {
  return {
    content: [{ type: "text", text: JSON.stringify(value) }],
  };
}

function formatBridgeError(op: string, err: unknown): string {
  if (err instanceof BridgeCallError) {
    return `Bridge ${op} failed [${err.code}]: ${err.message}`;
  }

  if (err instanceof Error) {
    return `Bridge ${op} failed: ${err.message}`;
  }

  return `Bridge ${op} failed: ${String(err)}`;
}
