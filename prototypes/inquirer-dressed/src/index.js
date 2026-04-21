import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';

const PRESETS = [
  {
    name: 'quick',
    description: 'Fast answers, default permissions',
    flags: { model: 'sonnet' },
    isDefault: true,
  },
  {
    name: 'power',
    description: 'Deep work with auto-edit',
    flags: { model: 'opus', permissionMode: 'acceptEdits', effort: 'high', verbose: true },
    isDefault: false,
  },
  {
    name: 'autonomous',
    description: 'Full auto with guardrails',
    flags: { model: 'opus', permissionMode: 'auto', maxTurns: 25, maxBudgetUsd: 5 },
    isDefault: false,
  },
  {
    name: 'review',
    description: 'Plan-only code review',
    flags: { model: 'opus', permissionMode: 'plan', effort: 'high' },
    isDefault: false,
  },
];

function buildFlagSummary(flags) {
  const parts = [];
  if (flags.model) parts.push(flags.model);
  if (flags.permissionMode) parts.push(flags.permissionMode);
  if (flags.effort) parts.push(`effort: ${flags.effort}`);
  if (flags.verbose) parts.push('verbose');
  if (flags.maxTurns) parts.push(`maxTurns: ${flags.maxTurns}`);
  if (flags.maxBudgetUsd) parts.push(`budget: $${flags.maxBudgetUsd}`);
  return parts.join(' · ');
}

function buildLaunchCommand(flags) {
  const envParts = [];
  const argParts = ['claude'];

  if (flags.effort) envParts.push(`ANTHROPIC_EFFORT=${flags.effort}`);
  if (flags.model) argParts.push(`--model ${flags.model}`);
  if (flags.permissionMode) argParts.push(`--permission-mode ${flags.permissionMode}`);
  if (flags.verbose) argParts.push('--verbose');
  if (flags.maxTurns) argParts.push(`--max-turns ${flags.maxTurns}`);
  if (flags.maxBudgetUsd) argParts.push(`--max-budget-usd ${flags.maxBudgetUsd}`);

  const prefix = envParts.length ? envParts.join(' ') + ' ' : '';
  return `$ ${prefix}${argParts.join(' ')}`;
}

function printHeader() {
  const wordmark = gradient(['#FF6B6B', '#FF8E53', '#FFC300', '#36D1DC', '#5B86E5'])(
    '  ██████╗██╗      █████╗ ██╗   ██╗███╗  ██╗ ██████╗██╗  ██╗\n' +
    ' ██╔════╝██║     ██╔══██╗██║   ██║████╗ ██║██╔════╝██║  ██║\n' +
    ' ██║     ██║     ███████║██║   ██║██╔██╗██║██║     ███████║\n' +
    ' ╚██████╗███████╗██║  ██║╚██████╔╝██║╚████║╚██████╗██║  ██║'
  );

  console.log(
    boxen(wordmark, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'magenta',
    })
  );
}

function printCommandBox(command) {
  console.log(
    boxen(chalk.dim(command), {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'green',
      title: chalk.green('launch command'),
      titleAlignment: 'left',
    })
  );
}

async function runInteractive() {
  printHeader();

  const choices = PRESETS.map((preset) => ({
    name:
      chalk.bold(preset.isDefault ? `★ ${preset.name}` : `  ${preset.name}`) +
      '  ' +
      chalk.dim(buildFlagSummary(preset.flags)),
    value: preset.name,
    short: preset.name,
  }));

  const selected = await select({
    message: 'Choose a launch preset',
    choices,
    default: 'quick',
  });

  const preset = PRESETS.find((p) => p.name === selected);
  const command = buildLaunchCommand(preset.flags);

  console.log();
  printCommandBox(command);
  console.log();
}

function runNonInteractive() {
  const defaultPreset = PRESETS.find((p) => p.isDefault);
  console.log(buildLaunchCommand(defaultPreset.flags));
}

const isNonInteractive = process.argv.includes('--non-interactive');

if (isNonInteractive) {
  runNonInteractive();
} else {
  runInteractive().catch((error) => {
    if (error.name === 'ExitPromptError') {
      process.exit(130);
    }
    console.error(error);
    process.exit(1);
  });
}
