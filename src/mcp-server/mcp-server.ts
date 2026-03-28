// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// the entry point / loader script for the MCP server running inside Ableton Live via Node for Max
import Max from "max-api";
import { checkForUpdate } from "#src/shared/version-check.ts";
import { VERSION } from "#src/shared/version.ts";
import { createExpressApp } from "./create-express-app.ts";
import * as console from "./node-for-max-logger.ts";

interface ServerError extends Error {
  code?: string;
}

// Cast process to access Node.js argv (max-globals.d.ts has limited process type)
const args = (process as unknown as { argv: string[] }).argv;

let port = 3350;

for (const [index, arg] of args.entries()) {
  if (arg === "port") {
    const portValueArg = args[index + 1];

    if (portValueArg == null) {
      throw new Error("Missing port value");
    }

    port = Number.parseInt(portValueArg);

    if (Number.isNaN(port)) {
      throw new Error(`Invalid port: ${portValueArg}`);
    }
  }
}

console.log(`Ableton DJ MCP ${VERSION} starting MCP server on port ${port}...`);

const appServer = createExpressApp();

appServer
  .listen(port, () => {
    const url = `http://localhost:${port}/mcp`;

    console.log(
      `Ableton DJ MCP ${VERSION} running.\nConnect Claude Desktop or another MCP client to ${url}`,
    );
    void Max.outlet("version", VERSION);

    // We need to use our own started event because the Node for Max started
    // occurs too early, before our message handlers are registered.
    void Max.outlet("started");

    void checkForUpdate(VERSION).then((update) => {
      if (update) {
        console.log(`Ableton DJ MCP update available: ${update.version}`);
        void Max.outlet("update_available", update.version);
      }
    });
  })
  .on("error", (error: ServerError) => {
    throw new Error(
      error.code === "EADDRINUSE"
        ? `Ableton DJ MCP failed to start: Port ${port} is already in use.`
        : `Ableton DJ MCP failed to start: ${error}`,
    );
  });
