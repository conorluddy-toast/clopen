import { Separator, confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { customizeFlags } from "./prompts/customize.js";
import { managePresets } from "./prompts/preset-manager.js";
import { readPresets, upsertPreset } from "./presets.js";
import { launchClaude } from "./spawn.js";
import type { Preset } from "./types.js";

const PRESET_PREFIX = "preset:";

const summarise = (preset: Preset): string => {
  const parts: string[] = [];
  const f = preset.flags;
  if (f.model) parts.push(f.model);
  if (f.permissionMode) parts.push(f.permissionMode);
  if (f.effort) parts.push(`effort: ${f.effort}`);
  if (f.maxTurns) parts.push(`${f.maxTurns} turns`);
  return parts.join(" · ");
};

export const runMenu = async (): Promise<void> => {
  console.log(chalk.bold("\n  claunch\n"));

  const { presets, defaultPreset } = await readPresets();

  type Choice = { name: string; value: string; description?: string };
  const choices: (Choice | InstanceType<typeof Separator>)[] = [];

  for (const preset of presets) {
    const summary = summarise(preset);
    const isDefault = preset.name === defaultPreset;
    const label =
      chalk.bold(preset.name) +
      (summary ? chalk.dim(`  ${summary}`) : "") +
      (isDefault ? chalk.green("  ★") : "");
    choices.push({
      name: label,
      value: `${PRESET_PREFIX}${preset.name}`,
      description: preset.description,
    });
  }

  if (presets.length > 0) choices.push(new Separator());

  choices.push(
    { name: "Customize a new session", value: "customize" },
    { name: "Manage presets",          value: "manage" },
    { name: "Exit",                    value: "exit" },
  );

  const defaultValue =
    defaultPreset && presets.some((p) => p.name === defaultPreset)
      ? `${PRESET_PREFIX}${defaultPreset}`
      : undefined;

  const choice = await select<string>({
    message: "Launch",
    choices,
    default: defaultValue,
    loop: false,
  });

  if (choice === "exit") return;

  if (choice.startsWith(PRESET_PREFIX)) {
    const name = choice.slice(PRESET_PREFIX.length);
    const preset = presets.find((p) => p.name === name);
    if (!preset) return;
    launchClaude(preset.flags);
    return;
  }

  if (choice === "manage") {
    await managePresets();
    return runMenu();
  }

  // customize
  const flags = await customizeFlags();
  if (await confirm({ message: "Save as preset?", default: false })) {
    const name = await input({ message: "Preset name" });
    const description = await input({ message: "Description (optional)" });
    const now = new Date().toISOString();
    const preset: Preset = {
      name: name.trim(),
      description: description.trim() || undefined,
      flags,
      createdAt: now,
      updatedAt: now,
    };
    await upsertPreset(preset);
    console.log(chalk.green(`Saved preset '${preset.name}'.`));
  }

  launchClaude(flags);
};
