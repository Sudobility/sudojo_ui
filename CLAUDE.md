# CLAUDE.md

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it.

Context for AI assistants working on this codebase. See `README.md` for the overview and
`docs/COMPONENTS.md` for the per-component props reference.

## What it is

`@sudobility/sudojo_ui` is the shared **web (React DOM)** Sudoku game UI for Sudojo: a canvas board
renderer with hint overlays, number pads, hint panel, timer, confetti, and a responsive
portrait/landscape layout.

- **Presentational only** — no data fetching, no game state, no i18n. Consumers own state (via
  `@sudobility/sudojo_lib` hooks such as `useSudoku`/`useHint`) and pass **pre-localized strings** in
  through `labels` / `*Label` props.
- ESM-only, compiled with plain `tsc` (no bundler). Ships `dist/` only. License BUSL-1.1.
- No tests, lint config, or Storybook. `typecheck` is the only correctness gate.

## Stack & commands

TypeScript (pinned `~6.0.3`; tsconfig uses `ignoreDeprecations: "6.0"` and `_ts6_globals.d.ts` for
TS6/7). React 19 for dev, React `>=18` as peer. Deps install with **Bun** (`bun.lock`; there is **no**
`package-lock.json`). Either `bun run <x>` or `npm run <x>` works.

| Command | What it does |
|---------|--------------|
| `bun install` | Install deps (needs GitHub Packages auth for `@sudobility/*`, see `.npmrc`) |
| `bun run typecheck` | `tsc --noEmit` with `tsconfig.json` (strict + `noUnusedLocals/Parameters`) |
| `bun run build` | `tsc -p tsconfig.build.json` → `dist/`, then `node scripts/fix-esm-imports.mjs` |
| `bun run build:watch` / `bun run dev` | Build in watch mode (`dev` is an alias) |
| `bun run clean` | `rm -rf dist` |
| `prepublishOnly` | `clean && build` (runs automatically on publish) |

`typecheck` is **stricter** than `build` (the build config turns off the unused-symbol checks and
keeps comments for `.d.ts` JSDoc), so a clean build does not imply a clean typecheck.
`scripts/fix-esm-imports.mjs` rewrites `tsc`'s extensionless `bundler`-resolution imports to
fully-qualified `./x.js` / `./x/index.js` so Node's native ESM loader can resolve them.

## Release / Publish (document only — do not run)

- `.github/workflows/ci-cd.yml` delegates to `johnqh/workflows/.github/workflows/unified-cicd.yml@main`
  with `publish-target: github` on push/PR to `main` **and** `develop`: install (bun) → `typecheck` →
  lint/test (skipped, no scripts) → `build`. On a push it publishes to **GitHub Packages** (via
  `GITHUB_TOKEN`) when the `package.json` `version` is not already published.
- Family release: `../sudojo_app/scripts/push_all.sh` (sources `../workflows/scripts/push_projects.sh`)
  upgrades `@sudobility/*` deps, bumps the version, commits, pushes, and waits for the registry before
  the next project. Order: `sudojo_types → sudojo_ocr → sudojo_api → sudojo_client → sudojo_lib →
  **sudojo_ui** → sudojo_app → sudojo_app_rn → sudojo_extension → sudojo_bot`.

## Exports (`src/index.ts`) — the public barrel

Every export must be listed in `src/index.ts`; each component is one file with a default export.

| Export | Purpose |
|--------|---------|
| `SudokuCanvas` (memo) | `<canvas>` 9×9 board: digits, pencilmarks, selection, hint areas/cells/links/groups |
| `SudokuControls` + `…Props`, `…Labels` | Play number pad + pencil/erase/undo/auto-pencil/new-game/hint (portrait 5-col, landscape 3-col) |
| `EntryControls` + `…Props`, `…Labels` | Puzzle-entry pad: 1–9, clue count, erase/clear/validate (`minClues` default `MIN_CLUES`) |
| `HintPanel` + `…Props` | Hint title/heading/text/action summary + Prev/Next/Apply/✕ |
| `GameTimer` + `…Props` | Reads seconds from a ref, re-renders itself once per second |
| `CompletionCelebration` + `…Props` | Fixed full-screen confetti (3 s), then `onComplete` |
| `SudokuLayout` | Size container (`container-type: size`) + ResizeObserver → layout context |
| `SudokuLayoutContext`, `useSudokuLayout`, `SudokuLayoutContextValue` | `{ isLandscape, availableWidth, availableHeight }` |
| `SudokuGame` (memo) + `SudokuGameProps` | Orchestrator composing all of the above |

`useSudokuLayout` is the only hook. `SudokuCanvasProps` / `SudokuLayoutProps` are **not exported** —
use `React.ComponentProps<typeof SudokuCanvas>`.

`SudokuGame` composes everything: `layout: 'fixed'` (default, wraps itself in `SudokuLayout`) or
`'auto'` (normal flow); plus `readOnly`, `renderHintPanel`, `header`/`headerCenter`/`showProgress`,
`belowBoard`, `hideControlsWhenCompleted`, `boardSizing` (`'width'` default | `'fill'`).

## Dependencies

All runtime deps are **peers** (duplicated in devDependencies for local builds). Current pins:

- `@sudobility/sudojo_lib ^0.0.220` — `presentBoard`, `getColorPalette`, `themeColorToCSS`,
  `convertSolverHintStep`, `isConflictHintStep`, `computeSelectedDigitCells`, `displayDigit`,
  `formatTime`, `MIN_CLUES`; types `SudokuCell`, `DigitDisplay`, `HintArea`.
- `@sudobility/sudojo_types ^1.2.80` — `SolverHintStep` (type-only).
- `@sudobility/components ^5.3.64` — `Button`, `Text` (HintPanel, EntryControls).
- `@sudobility/design ^1.1.69` — **not imported**; its Tailwind preset supplies semantic color tokens.
- `@heroicons/react >=2`, `react`/`react-dom >=18` — icons, React.

`^0.0.x` pins the sibling to that **exact** patch, so every `sudojo_lib` release needs a matching peer
bump here (the release script does this). Consumers `sudojo_app` and `sudojo_extension` both depend on
`^0.0.93`; `sudojo_app_rn` does **not** use this package.

## Platform & styling

- **Web only.** `<canvas>`, `ResizeObserver`, `window.devicePixelRatio`, CSS container queries
  (`cqw`/`cqh`), Tailwind `className`s. Not React Native compatible.
- **No CSS is shipped.** Components use Tailwind classes the consumer must generate. Both consumers'
  `tailwind.config.js` scan `'../sudojo_ui/src/**/*.{ts,tsx}'` (the sibling **checkout**, not
  `node_modules`) — new classes only appear in a consumer build if this repo is checked out next to it.
- DOM chrome uses `@sudobility/design` semantic tokens (`bg-primary/10`, `text-warning`, `bg-muted`,
  `border-l-primary`, …), which flip light/dark via the consumer's CSS variables.
- The **canvas does not see CSS/Tailwind theme**: it uses `sudojo_lib`'s hard-coded Apple-style palette
  (`getColorPalette(isDarkMode)`); dark mode must be passed as the `isDarkMode` prop.
- Confetti colors in `CompletionCelebration` are intentional literal hex values.
- Digits render as `numeric | kanji | emojis` via `digitDisplay` (`SudokuCanvas`, `SudokuControls`;
  `EntryControls` is always numeric).

## Hint rendering contract

Input is one `SolverHintStep` from `sudojo_types` (spec: `../sudojo_solver/docs/HINT.md`).
`SudokuCanvas` converts it once with `sudojo_lib`'s `convertSolverHintStep()` (shared with the RN
canvas): `row*9+column` indices, `select`/`unselect` `"0"` → `null`, digit strings → `number[]`, links
and groups converted, colors validated by `solverColorToSudokuColor` — only blue/green/yellow/orange/red
map; anything else (gray/white/black/clear) is `null` and falls back to presenter defaults. **No
conversion logic lives in this repo.**

Draw order: background → cell fills (20% alpha while a hint is shown) → cell borders (30% alpha) →
house outlines (conflict hints only) → group fill (20% via `globalAlpha`) + 3px outline →
digits/pencilmarks → group labels → links (purple; weak = dashed 5/5) → 1px grid.

A step is a **conflict hint** if any link has `type: 'conflict'` (`isConflictHintStep`): its `areas`
are outlined (2px) and conflict links are **not drawn** (orange source digits carry the meaning) —
`draw()` filters them out, so `drawLinks` has no conflict style.

## Gotchas

- Every component needs a parent with a **definite size**. `SudokuLayout` is `flex-1 min-h-0` with
  `container-type: size`; `SudokuGame` widths use `cqw/cqh`, so a height-less parent collapses it. Use
  `SudokuGame layout="auto"` in a scrolling, height-less parent. Landscape = `width >= 1.5 × height`.
- `useSudokuLayout()` outside `SudokuLayout` silently returns `{ isLandscape: false, 0, 0 }`.
- `SudokuCanvas` sizes itself to `min(containerWidth, containerHeight)`; passing `className`
  **replaces** the default `w-full aspect-square max-w-[500px] mx-auto`. Input is click-only.
- `SudokuCanvas` `onCanvasRef` is an effect dependency — pass a stable callback or it fires
  `null`→canvas on every render.
- `SudokuGame` renders `HintPanel` only when `hint`, `hintTitle`, `hintLabels` **and** all four
  `onHint{Next,Previous,Apply,Dismiss}` are set; `SudokuControls` only when `showControls` and
  `controlsLabels` are set. Missing props render nothing, with no error.
- `SudokuControls` renders an empty grid cell when `onAutoPencil` / `onNewGame` / `onHint` is omitted.
- `EntryControls` decides Validate from `canValidate` when passed, else `clueCount >= minClues`
  (default `MIN_CLUES`). It is always disabled while `isValidating`.
- `sudojo_lib` palette colors are mostly 8-digit hex (`#AF52DEFF`). Never build a translucent canvas
  color by appending an alpha suffix — canvas silently ignores an invalid color and keeps the previous
  `fillStyle`. Use `ctx.globalAlpha` inside `save()`/`restore()`.
- `CompletionCelebration` keeps `onComplete` in a ref (inline callback is fine). Its effect is keyed on
  `show` only: one 3 s run per `false → true`; `onComplete` fires once at the end; `show` turning false
  early (or unmount) cancels the run without calling it.
