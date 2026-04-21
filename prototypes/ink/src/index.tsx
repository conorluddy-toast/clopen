import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

// === TYPES ===

interface Preset {
  name: string;
  description: string;
  isDefault: boolean;
  flags: Record<string, string | number | boolean>;
}

// === DATA ===

const PRESETS: Preset[] = [
  {
    name: 'quick',
    description: 'Fast answers, default permissions',
    isDefault: true,
    flags: { model: 'sonnet' },
  },
  {
    name: 'power',
    description: 'Deep work with auto-edit',
    isDefault: false,
    flags: { model: 'opus', permissionMode: 'acceptEdits', effort: 'high', verbose: true },
  },
  {
    name: 'autonomous',
    description: 'Full auto with guardrails',
    isDefault: false,
    flags: { model: 'opus', permissionMode: 'auto', maxTurns: 25, maxBudgetUsd: 5 },
  },
  {
    name: 'review',
    description: 'Plan-only code review',
    isDefault: false,
    flags: { model: 'opus', permissionMode: 'plan', effort: 'high' },
  },
];

// === COMMAND BUILDER ===

const ENV_FLAGS = new Set(['effort']);

function buildLaunchCommand(preset: Preset): string {
  const envParts: string[] = [];
  const argParts: string[] = ['claude'];

  for (const [key, value] of Object.entries(preset.flags)) {
    if (ENV_FLAGS.has(key)) {
      envParts.push(`ANTHROPIC_EFFORT=${value}`);
    } else if (key === 'verbose' && value === true) {
      argParts.push('--verbose');
    } else if (key === 'model') {
      argParts.push(`--model ${value}`);
    } else if (key === 'permissionMode') {
      argParts.push(`--permission-mode ${value}`);
    } else if (key === 'maxTurns') {
      argParts.push(`--max-turns ${value}`);
    } else if (key === 'maxBudgetUsd') {
      argParts.push(`--max-budget-usd ${value}`);
    }
  }

  const command = argParts.join(' ');
  return envParts.length > 0 ? `${envParts.join(' ')} ${command}` : command;
}

// === COMPONENTS ===

function Header() {
  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1} marginBottom={1}>
      <Text color="cyan" bold>⚡ claunch</Text>
      <Text dimColor>  — claude preset launcher</Text>
    </Box>
  );
}

interface PresetListProps {
  selectedIndex: number;
}

function PresetList({ selectedIndex }: PresetListProps) {
  return (
    <Box flexDirection="column" width={36} marginRight={2}>
      <Box marginBottom={1}>
        <Text bold underline>Presets</Text>
      </Box>
      {PRESETS.map((preset, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box key={preset.name} marginBottom={0}>
            <Text color={isSelected ? 'cyan' : undefined}>
              {isSelected ? '› ' : '  '}
              {preset.isDefault ? '★ ' : '  '}
              <Text bold={isSelected}>{preset.name}</Text>
              {'  '}
              <Text dimColor>{preset.description}</Text>
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

interface PresetPreviewProps {
  preset: Preset;
}

function PresetPreview({ preset }: PresetPreviewProps) {
  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor="gray" paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">{preset.name}</Text>
        <Text dimColor>  {preset.description}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>flags:</Text>
      </Box>
      {Object.entries(preset.flags).map(([key, value]) => (
        <Box key={key}>
          <Text color="yellow">{key}</Text>
          <Text dimColor>: </Text>
          <Text color="green">{String(value)}</Text>
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>$ {buildLaunchCommand(preset)}</Text>
      </Box>
    </Box>
  );
}

function Footer() {
  return (
    <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
      <Text dimColor>↑↓ select · enter launch · q quit</Text>
    </Box>
  );
}

// === APP ===

function App() {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex(i => Math.min(PRESETS.length - 1, i + 1));
    } else if (key.return) {
      const command = buildLaunchCommand(PRESETS[selectedIndex]);
      exit();
      process.stdout.write(`\x1b[2m$ ${command}\x1b[0m\n`);
    } else if (input === 'q') {
      exit();
    }
  });

  const selectedPreset = PRESETS[selectedIndex];

  return (
    <Box flexDirection="column" padding={0}>
      <Header />
      <Box flexDirection="row">
        <PresetList selectedIndex={selectedIndex} />
        <PresetPreview preset={selectedPreset} />
      </Box>
      <Footer />
    </Box>
  );
}

// === ENTRYPOINT ===

const isNonInteractive = process.argv.includes('--non-interactive');

if (isNonInteractive) {
  const defaultPreset = PRESETS.find(p => p.isDefault) ?? PRESETS[0];
  process.stdout.write(`$ ${buildLaunchCommand(defaultPreset)}\n`);
  process.exit(0);
} else {
  render(<App />);
}
