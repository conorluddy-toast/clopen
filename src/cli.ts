import { Command, Option } from "commander";
import { readFile, writeFile } from "node:fs/promises";
import chalk from "chalk";
import { ensurePresetsFile, findPreset, readPresets, writePresets } from "./presets.js";
import { runMenu } from "./menu.js";
import { launchClaude } from "./spawn.js";
import type { ClaudeFlags, PresetsFile } from "./types.js";

interface CliOptions {
  preset?: string;
  model?: string;
  permissionMode?: string;
  effort?: string;
  maxTurns?: string;
  verbose?: boolean;
  print?: boolean;
  listPresets?: boolean;
  exportPresets?: string;
  importPresets?: string;
}

const toFlags = (opts: CliOptions): ClaudeFlags => {
  const flags: ClaudeFlags = {};
  if (opts.model) flags.model = opts.model;
  if (opts.permissionMode) flags.permissionMode = opts.permissionMode as ClaudeFlags["permissionMode"];
  if (opts.effort) flags.effort = opts.effort as ClaudeFlags["effort"];
  if (opts.maxTurns) flags.maxTurns = Number(opts.maxTurns);
  if (opts.verbose) flags.verbose = true;
  if (opts.print) flags.print = true;
  return flags;
};

const hasInlineFlags = (opts: CliOptions): boolean =>
  Boolean(
    opts.model ||
      opts.permissionMode ||
      opts.effort ||
      opts.maxTurns ||
      opts.verbose ||
      opts.print,
  );

export const buildProgram = (): Command => {
  const program = new Command();

  program
    .name("claunch")
    .description("Interactive launcher for Claude Code")
    .version("0.1.0")
    .option("-p, --preset <name>", "launch using a saved preset")
    .option("--model <name>", "model (opus, sonnet, haiku)")
    .addOption(
      new Option("--permission-mode <mode>", "permission mode").choices([
        "default",
        "plan",
        "acceptEdits",
        "auto",
        "bypassPermissions",
      ]),
    )
    .addOption(new Option("--effort <level>", "effort level").choices(["low", "medium", "high", "max"]))
    .option("--max-turns <n>", "max agentic turns")
    .option("--verbose", "verbose output")
    .option("--print", "non-interactive print mode")
    .option("--list-presets", "print preset names and exit")
    .option("--export-presets <path>", "write presets to a JSON file")
    .option("--import-presets <path>", "load presets from a JSON file (merges by name)")
    .argument("[prompt...]", "passthrough prompt/args for claude")
    .action(async (passthrough: string[], opts: CliOptions) => {
      await ensurePresetsFile();

      if (opts.listPresets) {
        const { presets } = await readPresets();
        for (const p of presets) {
          const desc = p.description ? chalk.dim(` — ${p.description}`) : "";
          console.log(`${p.name}${desc}`);
        }
        return;
      }

      if (opts.exportPresets) {
        const file = await readPresets();
        await writeFile(opts.exportPresets, JSON.stringify(file, null, 2), "utf8");
        console.log(chalk.green(`Exported ${file.presets.length} presets to ${opts.exportPresets}`));
        return;
      }

      if (opts.importPresets) {
        const raw = await readFile(opts.importPresets, "utf8");
        const incoming = JSON.parse(raw) as PresetsFile;
        if (incoming.version !== 1) throw new Error(`Unsupported version: ${incoming.version}`);
        const current = await readPresets();
        const byName = new Map(current.presets.map((p) => [p.name, p]));
        for (const p of incoming.presets) byName.set(p.name, p);
        current.presets = [...byName.values()];
        await writePresets(current);
        console.log(chalk.green(`Imported ${incoming.presets.length} presets.`));
        return;
      }

      if (opts.preset) {
        const preset = await findPreset(opts.preset);
        if (!preset) {
          console.error(chalk.red(`No preset named '${opts.preset}'.`));
          process.exit(1);
        }
        launchClaude(preset.flags, passthrough);
        return;
      }

      if (hasInlineFlags(opts) || passthrough.length > 0) {
        launchClaude(toFlags(opts), passthrough);
        return;
      }

      await runMenu();
    });

  return program;
};
