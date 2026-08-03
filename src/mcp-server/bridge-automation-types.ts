// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Arg/result shapes for the bridge automation_* ops (adj-automate). Beat
// values are Ableton beats relative to clip time 0; values are normalized
// 0..1 (denormalized onto param.min..param.max Python-side).

/** Session clips carry sceneIndex; arrangement clips carry the start beats. */
export interface AutomationClipRef {
  trackIndex: number;
  sceneIndex?: number;
  arrangementStartBeats?: number;
}

export type AutomationTarget =
  | {
      kind: "device";
      chain: Array<{ type: "d" | "c" | "rc"; index: number }>;
      paramName: string;
    }
  | {
      kind: "mixer";
      param: "volume" | "panning" | "send";
      sendIndex?: number;
    };

export interface AutomationWriteArgs {
  clip: AutomationClipRef;
  target: AutomationTarget;
  points: Array<[timeBeats: number, value01: number]>;
  clearFirst?: boolean;
}

export interface AutomationWriteResult {
  pointCount: number;
  paramName: string;
  paramMin: number;
  paramMax: number;
  envelopeCreated: boolean;
  clipLengthBeats: number;
}

export interface AutomationReadArgs {
  clip: AutomationClipRef;
  target: AutomationTarget;
  stepBeats?: number;
  maxPoints?: number;
}

export interface AutomationReadResult {
  hasEnvelope: boolean;
  sampled: boolean;
  stepBeats?: number;
  points: Array<[timeBeats: number, value01: number]>;
  paramMin: number;
  paramMax: number;
  clipLengthBeats: number;
}

export interface AutomationClearArgs {
  clip: AutomationClipRef;
  target?: AutomationTarget;
}

export interface AutomationClearResult {
  cleared: "param" | "all";
}
