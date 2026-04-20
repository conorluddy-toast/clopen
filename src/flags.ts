import type { ClaudeFlags, FlagCategory, FlagTransport, LaunchSpec } from "./types.js";

export interface FlagDef {
  key: keyof ClaudeFlags;
  label: string;
  category: FlagCategory;
  transport: FlagTransport;
  showWhen?: (flags: ClaudeFlags) => boolean;
}

// Transport note: most settings are CLI args. `effort` is tentatively routed as
// an env var until the help output confirms otherwise — see plan step 6.
export const FLAG_DEFS: FlagDef[] = [
  { key: "model", label: "Model", category: "Core", transport: { kind: "arg", name: "--model" } },
  { key: "permissionMode", label: "Permission mode", category: "Core", transport: { kind: "arg", name: "--permission-mode" } },
  { key: "effort", label: "Effort", category: "Core", transport: { kind: "env", name: "ANTHROPIC_EFFORT" } },

  { key: "maxTurns", label: "Max turns", category: "Session", transport: { kind: "arg", name: "--max-turns" } },
  { key: "resume", label: "Resume session", category: "Session", transport: { kind: "arg", name: "--resume" } },
  { key: "continue", label: "Continue last session", category: "Session", transport: { kind: "arg", name: "--continue" } },
  { key: "name", label: "Session name", category: "Session", transport: { kind: "arg", name: "--name" } },

  { key: "print", label: "Print (non-interactive)", category: "Output", transport: { kind: "arg", name: "--print" } },
  { key: "outputFormat", label: "Output format", category: "Output", transport: { kind: "arg", name: "--output-format" }, showWhen: (f) => f.print === true },
  { key: "inputFormat", label: "Input format", category: "Output", transport: { kind: "arg", name: "--input-format" }, showWhen: (f) => f.print === true },
  { key: "maxBudgetUsd", label: "Max budget (USD)", category: "Output", transport: { kind: "arg", name: "--max-budget-usd" }, showWhen: (f) => f.print === true },

  { key: "systemPrompt", label: "System prompt", category: "Advanced", transport: { kind: "arg", name: "--system-prompt" } },
  { key: "appendSystemPrompt", label: "Append to system prompt", category: "Advanced", transport: { kind: "arg", name: "--append-system-prompt" } },
  { key: "allowedTools", label: "Allowed tools", category: "Advanced", transport: { kind: "arg", name: "--allowedTools" } },
  { key: "disallowedTools", label: "Disallowed tools", category: "Advanced", transport: { kind: "arg", name: "--disallowedTools" } },
  { key: "verbose", label: "Verbose", category: "Advanced", transport: { kind: "arg", name: "--verbose" } },
  { key: "bare", label: "Bare", category: "Advanced", transport: { kind: "arg", name: "--bare" } },
  { key: "addDir", label: "Additional directories", category: "Advanced", transport: { kind: "arg", name: "--add-dir" } },
  { key: "mcpConfig", label: "MCP config files", category: "Advanced", transport: { kind: "arg", name: "--mcp-config" } },
];

export const CATEGORY_ORDER: FlagCategory[] = ["Core", "Session", "Output", "Advanced"];

export const buildLaunchSpec = (flags: ClaudeFlags): LaunchSpec => {
  const argv: string[] = [];
  const env: Record<string, string> = {};

  for (const def of FLAG_DEFS) {
    if (def.showWhen && !def.showWhen(flags)) continue;
    const value = flags[def.key];
    if (value === undefined || value === null) continue;
    if (value === false) continue;
    if (Array.isArray(value) && value.length === 0) continue;

    if (def.transport.kind === "env") {
      env[def.transport.name] = String(value);
      continue;
    }

    const argName = def.transport.name;
    if (value === true) {
      argv.push(argName);
    } else if (Array.isArray(value)) {
      // comma-separated for tools, space-separated via multiple args for paths
      if (def.key === "allowedTools" || def.key === "disallowedTools") {
        argv.push(argName, value.join(","));
      } else {
        for (const item of value) argv.push(argName, item);
      }
    } else {
      argv.push(argName, String(value));
    }
  }

  return { argv, env };
};
