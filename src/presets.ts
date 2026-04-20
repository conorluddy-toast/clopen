import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { configDir, presetsPath } from "./config.js";
import type { Preset, PresetsFile } from "./types.js";

const STARTER_PRESETS: Preset[] = [
  {
    name: "quick",
    description: "Fast answers, default permissions",
    flags: { model: "sonnet" },
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    name: "power",
    description: "Deep work with auto-edit",
    flags: { model: "opus", permissionMode: "acceptEdits", effort: "high", verbose: true },
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    name: "autonomous",
    description: "Full auto with guardrails",
    flags: { model: "opus", permissionMode: "auto", maxTurns: 25, maxBudgetUsd: 5 },
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    name: "review",
    description: "Plan-only code review",
    flags: { model: "opus", permissionMode: "plan", effort: "high" },
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];

export const ensurePresetsFile = async (): Promise<PresetsFile> => {
  const path = presetsPath();
  if (!existsSync(path)) {
    await mkdir(configDir(), { recursive: true });
    const seed: PresetsFile = { version: 1, presets: STARTER_PRESETS };
    await writeFile(path, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  return readPresets();
};

export const readPresets = async (): Promise<PresetsFile> => {
  const path = presetsPath();
  if (!existsSync(path)) return ensurePresetsFile();
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as PresetsFile;
  if (parsed.version !== 1) {
    throw new Error(`Unsupported presets file version: ${parsed.version}`);
  }
  return parsed;
};

export const writePresets = async (file: PresetsFile): Promise<void> => {
  const path = presetsPath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(file, null, 2), "utf8");
};

export const findPreset = async (name: string): Promise<Preset | undefined> => {
  const file = await readPresets();
  return file.presets.find((p) => p.name === name);
};

export const upsertPreset = async (preset: Preset): Promise<void> => {
  const file = await readPresets();
  const idx = file.presets.findIndex((p) => p.name === preset.name);
  if (idx === -1) file.presets.push(preset);
  else file.presets[idx] = preset;
  await writePresets(file);
};

export const deletePreset = async (name: string): Promise<boolean> => {
  const file = await readPresets();
  const before = file.presets.length;
  file.presets = file.presets.filter((p) => p.name !== name);
  if (file.presets.length === before) return false;
  await writePresets(file);
  return true;
};
