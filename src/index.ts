#!/usr/bin/env node
import chalk from "chalk";
import { buildProgram } from "./cli.js";

const main = async (): Promise<void> => {
  const program = buildProgram();
  await program.parseAsync(process.argv);
};

main().catch((err: unknown) => {
  if (err instanceof Error && err.name === "ExitPromptError") {
    // Inquirer Ctrl+C — exit cleanly
    process.exit(130);
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(chalk.red(`Error: ${message}`));
  process.exit(1);
});
