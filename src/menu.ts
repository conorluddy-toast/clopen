import React from "react";
import { render } from "ink";
import { confirm, input } from "@inquirer/prompts";
import chalk from "chalk";
import { customizeFlags } from "./prompts/customize.js";
import { managePresets } from "./prompts/preset-manager.js";
import { readPresets, upsertPreset } from "./presets.js";
import { launchClaude } from "./spawn.js";
import { App, type MenuChoice } from "./ui/app.js";
import type { Preset } from "./types.js";

const pickFromMenu = async (): Promise<MenuChoice> => {
  const { presets, defaultPreset } = await readPresets();

  return new Promise<MenuChoice>((resolve) => {
    let chosen: MenuChoice = { kind: "exit" };
    const app = render(
      React.createElement(App, {
        presets,
        defaultPreset,
        onChoose: (choice) => {
          chosen = choice;
        },
      }),
    );
    app.waitUntilExit().then(() => resolve(chosen));
  });
};

const saveAsPresetPrompt = async (flags: Preset["flags"]): Promise<void> => {
  if (!(await confirm({ message: "Save as preset?", default: false }))) return;
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
};

export const runMenu = async (): Promise<void> => {
  const choice = await pickFromMenu();

  if (choice.kind === "exit") return;

  if (choice.kind === "preset") {
    launchClaude(choice.preset.flags);
    return;
  }

  if (choice.kind === "manage") {
    await managePresets();
    return runMenu();
  }

  // customize
  const flags = await customizeFlags();
  await saveAsPresetPrompt(flags);
  launchClaude(flags);
};
