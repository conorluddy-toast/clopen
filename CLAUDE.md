# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

clopen is an interactive CLI launcher for Claude Code. It wraps the `claude` command with saved presets, an interactive menu, and a flag customization wizard — so users don't have to remember complex flag combinations.

## Commands

```bash
npm run build        # TypeScript → dist/ (tsc)
npm run dev          # Watch mode (tsc --watch)
npm start            # Run the compiled CLI (node dist/index.js)
```

No test framework or linter is configured.

## Architecture

**Entry flow** (`src/index.ts` → `src/cli.ts`):
Commander parses argv into one of three routes:
1. **Preset management** — `--list-presets`, `--export-presets`, `--import-presets`
2. **Direct launch** — inline flags (`--model`, `--effort`, etc.) or `--preset <name>` → `launchClaude()`
3. **Interactive menu** — no args → `runMenu()`

**Flag system** (`src/flags.ts`, `src/types.ts`):
`FLAG_DEFS` is the single source of truth for all supported Claude flags. Each entry declares its key, display label, category, and transport method (`arg` for CLI flags, `env` for environment variables). `buildLaunchSpec()` walks this array to produce a `LaunchSpec` (argv + env dict). Adding a new flag means adding one entry to `FLAG_DEFS` and the corresponding field to `ClaudeFlags`.

**UI layers**:
- `src/ui/app.tsx` — Main menu built with Ink (React for terminal). Shows presets with keyboard navigation and a side preview panel.
- `src/prompts/customize.ts` — Flag customization wizard using `@inquirer/prompts`.
- `src/prompts/preset-manager.ts` — CRUD for presets (list, edit, duplicate, delete, set default).

**Preset persistence** (`src/presets.ts`, `src/config.ts`):
Presets live in `~/.config/clopen/presets.json` (respects `$XDG_CONFIG_HOME`). On first run, four starter presets are seeded (quick, power, autonomous, review). The `PresetsFile` schema is versioned (`version: 1`).

**Spawning** (`src/spawn.ts`):
`launchClaude()` builds the spec, prints the command, then uses `child_process.spawn` with `stdio: "inherit"`. Signals (SIGINT/SIGTERM) are forwarded to the child. Exit code is propagated.

## Key Conventions

- **ESM throughout** — `"type": "module"` in package.json; all imports use `.js` extensions.
- **JSX mode is `react`** — required by Ink. TSX files live in `src/ui/`.
- **Flag transport**: most flags are CLI args; `effort` is transported as the `ANTHROPIC_EFFORT` env var.
- **Array flags**: tools (`allowedTools`/`disallowedTools`) are comma-joined; paths (`addDir`/`mcpConfig`) are repeated args.
- **`prototypes/`** contains evaluation code from the TUI library bake-off. Not part of the build.
