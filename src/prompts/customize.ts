import { confirm, editor, input, select } from "@inquirer/prompts";
import type { ClaudeFlags, Effort, InputFormat, OutputFormat, PermissionMode } from "../types.js";

const SKIP = Symbol("skip");
type Answer<T> = T | typeof SKIP;

const optionalSelect = async <T extends string>(
  message: string,
  choices: readonly T[],
): Promise<Answer<T>> => {
  const value = await select<T | "__skip__">({
    message,
    choices: [
      { name: "(skip)", value: "__skip__" as const },
      ...choices.map((c) => ({ name: c, value: c })),
    ],
  });
  return value === "__skip__" ? SKIP : (value as T);
};

const optionalNumber = async (message: string): Promise<Answer<number>> => {
  const raw = await input({ message: `${message} (blank to skip)` });
  if (raw.trim() === "") return SKIP;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number: ${raw}`);
  return parsed;
};

const optionalText = async (message: string): Promise<Answer<string>> => {
  const raw = await input({ message: `${message} (blank to skip)` });
  return raw.trim() === "" ? SKIP : raw.trim();
};

const optionalCsv = async (message: string): Promise<Answer<string[]>> => {
  const raw = await input({ message: `${message} (comma-separated, blank to skip)` });
  if (raw.trim() === "") return SKIP;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
};

const optionalPaths = async (message: string): Promise<Answer<string[]>> => {
  const raw = await input({ message: `${message} (space-separated, blank to skip)` });
  if (raw.trim() === "") return SKIP;
  return raw.split(/\s+/).filter(Boolean);
};

const set = <K extends keyof ClaudeFlags>(
  flags: ClaudeFlags,
  key: K,
  value: Answer<ClaudeFlags[K]>,
): void => {
  if (value !== SKIP) flags[key] = value;
};

export const customizeFlags = async (initial: ClaudeFlags = {}): Promise<ClaudeFlags> => {
  const flags: ClaudeFlags = { ...initial };

  // --- Core ---
  console.log("\n— Core —");
  set(flags, "model", await optionalSelect("Model", ["opus", "sonnet", "haiku"] as const));
  set(
    flags,
    "permissionMode",
    await optionalSelect<PermissionMode>("Permission mode", [
      "default",
      "plan",
      "acceptEdits",
      "auto",
      "bypassPermissions",
    ]),
  );
  set(flags, "effort", await optionalSelect<Effort>("Effort", ["low", "medium", "high", "max"]));

  // --- Session ---
  console.log("\n— Session —");
  set(flags, "maxTurns", await optionalNumber("Max turns"));
  if (await confirm({ message: "Continue last session?", default: false })) flags.continue = true;
  set(flags, "name", await optionalText("Session name"));

  // --- Output ---
  console.log("\n— Output —");
  if (await confirm({ message: "Non-interactive print mode?", default: false })) {
    flags.print = true;
    set(
      flags,
      "outputFormat",
      await optionalSelect<OutputFormat>("Output format", ["text", "json", "stream-json"]),
    );
    set(
      flags,
      "inputFormat",
      await optionalSelect<InputFormat>("Input format", ["text", "stream-json"]),
    );
    set(flags, "maxBudgetUsd", await optionalNumber("Max budget (USD)"));
  }

  // --- Advanced ---
  if (await confirm({ message: "Configure advanced flags?", default: false })) {
    console.log("\n— Advanced —");
    if (await confirm({ message: "Edit system prompt in $EDITOR?", default: false })) {
      flags.systemPrompt = await editor({ message: "System prompt" });
    }
    if (await confirm({ message: "Append to system prompt in $EDITOR?", default: false })) {
      flags.appendSystemPrompt = await editor({ message: "Append system prompt" });
    }
    set(flags, "allowedTools", await optionalCsv("Allowed tools"));
    set(flags, "disallowedTools", await optionalCsv("Disallowed tools"));
    if (await confirm({ message: "Verbose?", default: false })) flags.verbose = true;
    if (await confirm({ message: "Bare mode?", default: false })) flags.bare = true;
    set(flags, "addDir", await optionalPaths("Additional directories"));
    set(flags, "mcpConfig", await optionalPaths("MCP config files"));
  }

  return flags;
};
