import * as clack from '@clack/prompts';
import chalk from 'chalk';

const PRESETS = [
  {
    id: 'quick',
    label: 'quick',
    hint: 'Fast answers, default permissions',
    summary: 'sonnet',
    flags: { model: 'sonnet' },
    isDefault: true,
  },
  {
    id: 'power',
    label: 'power',
    hint: 'Deep work with auto-edit',
    summary: 'opus · acceptEdits · effort: high · verbose',
    flags: { model: 'opus', permissionMode: 'acceptEdits', effort: 'high', verbose: true },
  },
  {
    id: 'autonomous',
    label: 'autonomous',
    hint: 'Full auto with guardrails',
    summary: 'opus · auto · maxTurns: 25 · budget: $5',
    flags: { model: 'opus', permissionMode: 'auto', maxTurns: 25, maxBudgetUsd: 5 },
  },
  {
    id: 'review',
    label: 'review',
    hint: 'Plan-only code review',
    summary: 'opus · plan · effort: high',
    flags: { model: 'opus', permissionMode: 'plan', effort: 'high' },
  },
];

const ENV_FLAG_KEYS = new Set(['effort', 'maxBudgetUsd']);

function buildCommand(preset) {
  const envParts = [];
  const flagParts = [];

  for (const [key, value] of Object.entries(preset.flags)) {
    if (key === 'effort') {
      envParts.push(`ANTHROPIC_EFFORT=${value}`);
    } else if (key === 'maxBudgetUsd') {
      flagParts.push(`--max-budget-usd ${value}`);
    } else if (key === 'model') {
      flagParts.push(`--model ${value}`);
    } else if (key === 'permissionMode') {
      flagParts.push(`--permission-mode ${value}`);
    } else if (key === 'maxTurns') {
      flagParts.push(`--max-turns ${value}`);
    } else if (key === 'verbose' && value === true) {
      flagParts.push('--verbose');
    }
  }

  const parts = [...envParts, 'claude', ...flagParts];
  return `$ ${parts.join(' ')}`;
}

const defaultPreset = PRESETS.find((p) => p.isDefault);
const isNonInteractive = process.argv.includes('--non-interactive');

if (isNonInteractive) {
  console.log(buildCommand(defaultPreset));
  process.exit(0);
}

clack.intro(chalk.bold.cyan('  claunch  ') + chalk.dim('  pick a preset, get a command'));

const selected = await clack.select({
  message: 'Choose a preset',
  initialValue: defaultPreset.id,
  options: PRESETS.map((p) => ({
    value: p.id,
    label: `${p.isDefault ? chalk.yellow('★ ') : '  '}${chalk.bold(p.label.padEnd(14))}${chalk.dim(p.summary)}`,
    hint: p.hint,
  })),
});

if (clack.isCancel(selected)) {
  clack.cancel('Cancelled.');
  process.exit(0);
}

const preset = PRESETS.find((p) => p.id === selected);
const command = buildCommand(preset);

clack.outro(chalk.dim(command));
