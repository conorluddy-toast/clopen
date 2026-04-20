# claunch

Interactive launcher for [Claude Code](https://claude.com/claude-code). Pick a saved preset or step through a curated set of flags, then `claunch` spawns `claude` with the right arguments and env vars.

No more remembering flag names. No more typing `--model opus --permission-mode acceptEdits --effort high` every session.

## Install

```bash
npm install -g claunch
```

Requires Node >= 18 and `claude` on your `PATH`.

## Usage

### Interactive (no args)

```bash
claunch
```

```
  claunch

? What would you like to do?
> Launch with a preset
  Customize a new session
  Manage presets
  Exit
```

### Launch a saved preset

```bash
claunch --preset power
```

### Inline flags (skip the menu)

```bash
claunch --model opus --effort high
claunch --model sonnet "fix the auth bug"
```

### Preset management

```bash
claunch --list-presets
claunch --export-presets ~/backup.json
claunch --import-presets ~/shared.json
```

## Starter presets

Seeded on first run at `~/.config/claunch/presets.json`:

| Name         | Description                | Flags                                                     |
|--------------|----------------------------|-----------------------------------------------------------|
| `quick`      | Fast answers               | `model: sonnet`                                           |
| `power`      | Deep work with auto-edit   | `model: opus`, `acceptEdits`, `effort: high`, `verbose`   |
| `autonomous` | Full auto with guardrails  | `model: opus`, `auto`, `maxTurns: 25`, `maxBudgetUsd: 5`  |
| `review`     | Plan-only code review      | `model: opus`, `plan`, `effort: high`                     |

Create your own via the **Customize** flow — after stepping through the flags, you'll be asked if you want to save it.

## Curated flag set

claunch exposes the flags that matter day-to-day, grouped into **Core → Session → Output → Advanced**. The wizard walks the categories in order and skips flags that only make sense when `--print` is enabled.

| Category  | Flags                                                                                |
|-----------|--------------------------------------------------------------------------------------|
| Core      | `model`, `permissionMode`, `effort`                                                  |
| Session   | `maxTurns`, `resume`, `continue`, `name`                                             |
| Output    | `print`, `outputFormat`, `inputFormat`, `maxBudgetUsd`                               |
| Advanced  | `systemPrompt`, `appendSystemPrompt`, `allowedTools`, `disallowedTools`, `verbose`, `bare`, `addDir`, `mcpConfig` |

Most flags map to `--arg` passthrough. `effort` routes through the `ANTHROPIC_EFFORT` environment variable when spawning `claude`.

## Config

Presets live at:

```
~/.config/claunch/presets.json
```

(Or `$XDG_CONFIG_HOME/claunch/presets.json` if set.)

The file is plain JSON — safe to hand-edit, export, and share.

## Develop

```bash
git clone https://github.com/conorluddy/claunch.git
cd claunch
npm install
npm run build
node dist/index.js
```

Watch mode: `npm run dev`.

## License

MIT
