# inquirer-dressed

claunch TUI prototype using `@inquirer/prompts` + `boxen` + `gradient-string`.

Shows a gradient ASCII wordmark in a rounded box, a preset selector with bold names and dim flag summaries, and a boxed launch command after selection.

## Usage

```
npm install && npm start
```

## Non-interactive fallback

```
npm start -- --non-interactive
```

Prints `$ claude --model sonnet` and exits.
