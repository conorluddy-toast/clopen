export type PermissionMode =
  | "default"
  | "plan"
  | "acceptEdits"
  | "auto"
  | "bypassPermissions";

export type Effort = "low" | "medium" | "high" | "max";

export type OutputFormat = "text" | "json" | "stream-json";
export type InputFormat = "text" | "stream-json";

export interface ClaudeFlags {
  model?: string;
  permissionMode?: PermissionMode;
  effort?: Effort;
  maxTurns?: number;
  systemPrompt?: string;
  appendSystemPrompt?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  outputFormat?: OutputFormat;
  inputFormat?: InputFormat;
  verbose?: boolean;
  print?: boolean;
  resume?: string | true;
  continue?: boolean;
  maxBudgetUsd?: number;
  name?: string;
  addDir?: string[];
  mcpConfig?: string[];
  bare?: boolean;
}

export type FlagCategory = "Core" | "Session" | "Output" | "Advanced";

export type FlagTransport =
  | { kind: "arg"; name: string }
  | { kind: "env"; name: string };

export interface Preset {
  name: string;
  description?: string;
  flags: ClaudeFlags;
  createdAt: string;
  updatedAt: string;
}

export interface PresetsFile {
  version: 1;
  presets: Preset[];
}

export interface LaunchSpec {
  argv: string[];
  env: Record<string, string>;
}
