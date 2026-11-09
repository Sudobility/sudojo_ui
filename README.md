# @sudobility/sudojo_ui

Shared **web (React DOM)** Sudoku game UI components for Sudojo: a `<canvas>` board renderer with
hint overlays, number pads, a hint panel, a game timer, a completion celebration, and a responsive
portrait/landscape layout — plus a `SudokuGame` orchestrator that composes them.

- **Presentational only.** No data fetching, no game state, no i18n. Consumers own all state (e.g.
  via `@sudobility/sudojo_lib` hooks like `useSudoku`/`useHint`) and pass **pre-localized** strings
  in through `labels` / `*Label` props.
- **Web only.** Uses `<canvas>`, `ResizeObserver`, `window.devicePixelRatio`, CSS container queries,
  and Tailwind classes. Not React Native compatible (RN apps use a separate package).
- **ESM-only**, compiled with plain `tsc` (no bundler). Publishes `dist/` only.
- License: **BUSL-1.1**.

Consumers: `@sudobility/sudojo_app` and `@sudobility/sudojo_extension`. Full per-component props
reference: [docs/COMPONENTS.md](docs/COMPONENTS.md).

## Install (into a consumer)

```bash
bun add @sudobility/sudojo_ui   # or: npm install @sudobility/sudojo_ui
```

The `@sudobility/*` packages are published to **GitHub Packages**, not npmjs.org. A consumer needs an
`.npmrc` routing the scope there (as this repo's own `.npmrc` does) plus a GitHub token with
`read:packages`:

```
@sudobility:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${YOUR_GH_PACKAGES_READ_TOKEN}
```

### Peer dependencies

All runtime deps are **peers** (the consumer installs them). React `>=18`, `react-dom` `>=18`,
`@heroicons/react` `>=2`, and the `@sudobility/*` siblings: `sudojo_lib`, `sudojo_types`,
`components`, `design`. The `@sudobility/*` peers use `^0.0.x` / exact-patch-style pins, so each
sibling release requires a matching bump here (automated by the family release script).

## Develop in this repo

```bash
bun install            # install dev deps (needs GitHub Packages auth, see above)
bun run typecheck      # tsc --noEmit with tsconfig.json (strict + noUnusedLocals/Parameters)
bun run build          # tsc -p tsconfig.build.json -> dist/, then scripts/fix-esm-imports.mjs
bun run build:watch    # build in watch mode (alias: bun run dev)
bun run clean          # rm -rf dist
```

Either `bun run <x>` or `npm run <x>` works. There is **no** `test`, `lint`, or `format` script —
`typecheck` is the only correctness gate, and it is stricter than `build` (the build config turns off
the unused-symbol checks), so a clean build does not imply a clean typecheck.

The `build` step runs `scripts/fix-esm-imports.mjs` to rewrite `tsc`'s extensionless relative imports
(emitted under `moduleResolution: "bundler"`) into fully-qualified `./x.js` / `./x/index.js`
specifiers that Node's native ESM loader accepts.

## Usage sketch

```tsx
import { SudokuGame } from '@sudobility/sudojo_ui';

<SudokuGame
  board={board}
  selectedIndex={selected}
  onCellSelect={setSelected}
  showControls
  controlsLabels={labels}      // pre-localized
  isDarkMode={isDark}          // canvas palette is not CSS-driven
/>;
```

`SudokuGame` needs a **sized** parent (see Styling). Lower-level pieces (`SudokuCanvas`,
`SudokuControls`, `EntryControls`, `HintPanel`, `GameTimer`, `CompletionCelebration`,
`SudokuLayout`) are exported for direct use.

## Styling

- **No CSS is shipped.** DOM chrome uses Tailwind classes that the **consumer** must generate. Both
  consumers' `tailwind.config.js` scan `'../sudojo_ui/src/**/*.{ts,tsx}'` — the sibling source
  **checkout**, not `node_modules` — so new classes only appear in a consumer build when this repo is
  checked out next to it.
- DOM chrome uses `@sudobility/design` semantic color tokens (e.g. `text-warning`, `bg-muted`), which
  flip light/dark via the consumer's CSS variables.
- The **canvas ignores CSS/Tailwind theme** — it uses `sudojo_lib`'s hard-coded palette, so dark mode
  must be passed as the `isDarkMode` prop.

## Project layout

```
src/
  index.ts              # Public barrel — every export must be listed here
  components/           # One component per file, default export
  _ts6_globals.d.ts     # Explicit ambient type refs for TS6/7
tsconfig.json           # Strict; used by typecheck
tsconfig.build.json     # Extends it; relaxes unused checks, keeps comments for .d.ts JSDoc
scripts/fix-esm-imports.mjs   # Post-build ESM specifier rewrite
docs/COMPONENTS.md      # Per-component props reference
.github/workflows/ci-cd.yml   # Delegates to johnqh/workflows unified CI/CD
```

See [CLAUDE.md](CLAUDE.md) for architecture notes, the hint-rendering contract, and gotchas.
