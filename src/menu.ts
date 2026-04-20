import { confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { customizeFlags } from "./prompts/customize.js";
import { pickPreset } from "./prompts/preset-picker.js";
import { managePresets } from "./prompts/preset-manager.js";
import { upsertPreset } from "./presets.js";
import { launchClaude } from "./spawn.js";
import type { Preset } from "./types.js";

export const runMenu = async (): Promise<void> => {
  console.log(chalk.bold("\n  claunch\n"));

  const choice = await select<"preset" | "customize" | "manage" | "exit">({
    message: "What would you like to do?",
    choices: [
      { name: "Launch with a preset", value: "preset" },
      { name: "Customize a new session", value: "customize" },
      { name: "Manage presets", value: "manage" },
      { name: "Exit", value: "exit" },
    ],
  });

  if (choice === "exit") return;

  if (choice === "preset") {
    const preset = await pickPreset();
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
