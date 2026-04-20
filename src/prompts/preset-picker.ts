import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { readPresets } from "../presets.js";
import type { Preset } from "../types.js";

const summarise = (preset: Preset): string => {
  const parts: string[] = [];
  const f = preset.flags;
  if (f.model) parts.push(`model: ${f.model}`);
  if (f.permissionMode) parts.push(`perms: ${f.permissionMode}`);
  if (f.effort) parts.push(`effort: ${f.effort}`);
  if (f.maxTurns) parts.push(`turns: ${f.maxTurns}`);
  if (f.maxBudgetUsd) parts.push(`$${f.maxBudgetUsd}`);
  return parts.join(", ") || "(no flags)";
};

export const pickPreset = async (): Promise<Preset | null> => {
  const { presets } = await readPresets();
  if (presets.length === 0) {
    console.log(chalk.yellow("No presets saved yet."));
    return null;
  }

  const name = await select<string>({
    message: "Select a preset",
    choices: presets.map((p) => ({
      name: `${p.name} ${chalk.dim(`— ${summarise(p)}`)}`,
      value: p.name,
      description: p.description,
    })),
  });

  return presets.find((p) => p.name === name) ?? null;
};
