import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { renderLogo } from "./logo.js";
import type { Preset } from "../types.js";

export type MenuChoice =
  | { kind: "preset"; preset: Preset }
  | { kind: "customize" }
  | { kind: "manage" }
  | { kind: "exit" };

type Row =
  | { kind: "preset"; preset: Preset; isDefault: boolean }
  | { kind: "separator" }
  | { kind: "action"; label: string; choice: MenuChoice };

interface Props {
  presets: Preset[];
  defaultPreset?: string;
  onChoose: (choice: MenuChoice) => void;
}

const flagSummary = (preset: Preset): string => {
  const f = preset.flags;
  const parts: string[] = [];
  if (f.model) parts.push(f.model);
  if (f.permissionMode) parts.push(f.permissionMode);
  if (f.effort) parts.push(`effort: ${f.effort}`);
  if (f.maxTurns) parts.push(`${f.maxTurns} turns`);
  return parts.join(" · ");
};

const buildRows = (presets: Preset[], defaultPreset?: string): Row[] => {
  const rows: Row[] = [];
  for (const preset of presets) {
    rows.push({ kind: "preset", preset, isDefault: preset.name === defaultPreset });
  }
  if (presets.length > 0) rows.push({ kind: "separator" });
  rows.push({ kind: "action", label: "Customize a new session", choice: { kind: "customize" } });
  rows.push({ kind: "action", label: "Manage presets",          choice: { kind: "manage" } });
  rows.push({ kind: "action", label: "Exit",                    choice: { kind: "exit" } });
  return rows;
};

const defaultSelectableIndex = (rows: Row[], defaultPreset?: string): number => {
  if (defaultPreset) {
    const idx = rows.findIndex((r) => r.kind === "preset" && r.preset.name === defaultPreset);
    if (idx !== -1) return idx;
  }
  return rows.findIndex((r) => r.kind !== "separator");
};

const isSelectable = (row: Row): boolean => row.kind !== "separator";

export const App: React.FC<Props> = ({ presets, defaultPreset, onChoose }) => {
  const { exit } = useApp();
  const rows = buildRows(presets, defaultPreset);
  const [index, setIndex] = useState(defaultSelectableIndex(rows, defaultPreset));

  const move = (delta: number) => {
    let next = index;
    for (let step = 0; step < rows.length; step++) {
      next = (next + delta + rows.length) % rows.length;
      if (isSelectable(rows[next])) {
        setIndex(next);
        return;
      }
    }
  };

  useInput((input, key) => {
    if (key.upArrow) move(-1);
    else if (key.downArrow) move(1);
    else if (key.return) {
      const row = rows[index];
      if (row.kind === "preset") onChoose({ kind: "preset", preset: row.preset });
      else if (row.kind === "action") onChoose(row.choice);
      exit();
    } else if (input === "q" || key.escape) {
      onChoose({ kind: "exit" });
      exit();
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text>{renderLogo()}</Text>
      </Box>
      <Box flexDirection="column">
        {rows.map((row, i) => {
          if (row.kind === "separator") {
            return (
              <Box key={`sep-${i}`} marginY={0}>
                <Text dimColor>──────────────────────────────</Text>
              </Box>
            );
          }
          const selected = i === index;
          const cursor = selected ? "› " : "  ";

          if (row.kind === "preset") {
            const { preset, isDefault } = row;
            return (
              <Box key={preset.name}>
                <Text color={selected ? "cyan" : undefined}>{cursor}</Text>
                <Text color={isDefault ? "yellow" : undefined}>{isDefault ? "★ " : "  "}</Text>
                <Text bold={selected} color={selected ? "cyan" : undefined}>
                  {preset.name.padEnd(14)}
                </Text>
                <Text dimColor>{flagSummary(preset)}</Text>
              </Box>
            );
          }

          return (
            <Box key={row.label}>
              <Text color={selected ? "cyan" : undefined}>{cursor}</Text>
              <Text dimColor={!selected} color={selected ? "cyan" : undefined}>
                {row.label}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>↑↓ select · enter launch · q quit</Text>
      </Box>
    </Box>
  );
};
