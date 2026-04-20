import { spawn } from "node:child_process";
import chalk from "chalk";
import { buildLaunchSpec } from "./flags.js";
import type { ClaudeFlags } from "./types.js";

export const launchClaude = (flags: ClaudeFlags, passthrough: string[] = []): void => {
  const { argv, env } = buildLaunchSpec(flags);
  const fullArgv = [...argv, ...passthrough];

  const envPreview = Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  const prefix = envPreview ? `${envPreview} ` : "";
  console.log(chalk.dim(`$ ${prefix}claude ${fullArgv.join(" ")}`.trim()));

  const child = spawn("claude", fullArgv, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });

  const forward = (signal: NodeJS.Signals) => () => {
    if (!child.killed) child.kill(signal);
  };
  process.on("SIGINT", forward("SIGINT"));
  process.on("SIGTERM", forward("SIGTERM"));

  child.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "ENOENT") {
      console.error(chalk.red("claude not found on PATH — install Claude Code first."));
      process.exit(127);
    }
    console.error(chalk.red(`Failed to launch claude: ${err.message}`));
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
};
