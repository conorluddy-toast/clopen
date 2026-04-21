import { confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { deletePreset, readPresets, setDefaultPreset, upsertPreset } from "../presets.js";
import { customizeFlags } from "./customize.js";
import type { Preset } from "../types.js";

export const managePresets = async (): Promise<void> => {
  while (true) {
    const action = await select<"list" | "setDefault" | "edit" | "duplicate" | "delete" | "exit">({
      message: "Manage presets",
      choices: [
        { name: "List", value: "list" },
        { name: "Set default", value: "setDefault" },
        { name: "Edit", value: "edit" },
        { name: "Duplicate", value: "duplicate" },
        { name: "Delete", value: "delete" },
        { name: "Back", value: "exit" },
      ],
    });

    if (action === "exit") return;

    const { presets } = await readPresets();

    if (action === "list") {
      const { defaultPreset } = await readPresets();
      if (presets.length === 0) console.log(chalk.yellow("No presets."));
      for (const p of presets) {
        const star = p.name === defaultPreset ? chalk.green(" ★") : "";
        console.log(chalk.bold(p.name) + star + (p.description ? chalk.dim(` — ${p.description}`) : ""));
        console.log(chalk.dim(`  ${JSON.stringify(p.flags)}`));
      }
      continue;
    }

    if (presets.length === 0) {
      console.log(chalk.yellow("No presets to operate on."));
      continue;
    }

    const name = await select<string>({
      message: `Select preset to ${action}`,
      choices: presets.map((p) => ({ name: p.name, value: p.name })),
    });
    const target = presets.find((p) => p.name === name)!;

    if (action === "setDefault") {
      await setDefaultPreset(name);
      console.log(chalk.green(`Default is now '${name}'.`));
    } else if (action === "edit") {
      const flags = await customizeFlags(target.flags);
      const next: Preset = { ...target, flags, updatedAt: new Date().toISOString() };
      await upsertPreset(next);
      console.log(chalk.green(`Updated preset '${name}'.`));
    } else if (action === "duplicate") {
      const newName = await input({ message: "New name", default: `${name}-copy` });
      const next: Preset = {
        ...target,
        name: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await upsertPreset(next);
      console.log(chalk.green(`Duplicated to '${newName}'.`));
    } else if (action === "delete") {
      const ok = await confirm({ message: `Delete '${name}'?`, default: false });
      if (ok) {
        await deletePreset(name);
        console.log(chalk.green(`Deleted '${name}'.`));
      }
    }
  }
};
