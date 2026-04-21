# TUI Bake-off

Competing TUI prototypes for claunch. Each implements the same minimal UX: show four starter presets, let you pick one, print the launch command.

Run each and compare.

| Prototype | Library | Run |
|---|---|---|
| [clack](./clack) | `@clack/prompts` | `cd clack && npm install && npm start` |
| [ink](./ink) | `ink` (React) | `cd ink && npm install && npm start` |
| [inquirer-dressed](./inquirer-dressed) | `@inquirer/prompts` + `boxen` + `gradient-string` | `cd inquirer-dressed && npm install && npm start` |

## Evaluation criteria

- First-launch wow factor
- Clarity of preset list (flag summary legibility)
- Default-preset affordance
- Keyboard ergonomics (arrows, enter, esc)
- Animation polish (or absence of jank)
- Code complexity to maintain

Whichever wins replaces the current top-level menu in `src/menu.ts`.
