// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

/** All Live Object Model types returned by LiveAPI.type */
export type LiveObjectType =
  // Top-level objects
  | "Application"
  | "Application.View"
  | "Song"
  | "Song.View"

  // Track, scene, and clip objects
  | "Track"
  | "Track.View"
  | "Scene"
  | "Clip"
  | "Clip.View"
  | "ClipSlot"
  | "CuePoint"
  | "TakeLane"

  // Device objects
  | "Chain"
  | "ChainMixerDevice"
  | "CompressorDevice"
  | "ControlSurface"
  | "Device"
  | "Device.View"
  | "DeviceIO"
  | "DeviceParameter"
  | "DriftDevice"
  | "DrumCellDevice"
  | "DrumChain"
  | "DrumPad"
  | "Eq8Device"
  | "Eq8Device.View"
  | "HybridReverbDevice"
  | "LooperDevice"
  | "MaxDevice"
  | "MeldDevice"
  | "MixerDevice"
  | "PluginDevice"
  | "RackDevice"
  | "RackDevice.View"
  | "RoarDevice"
  | "ShifterDevice"
  | "SimplerDevice"
  | "SimplerDevice.View"
  | "SpectralResonatorDevice"
  | "WavetableDevice"

  // Other objects
  | "Groove"
  | "GroovePool"
  | "Sample"
  | "TuningSystem"
  | "this_device";
