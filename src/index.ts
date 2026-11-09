// Layout
export { default as SudokuLayout } from './components/SudokuLayout';
export {
  SudokuLayoutContext,
  useSudokuLayout,
  type SudokuLayoutContextValue,
} from './components/SudokuLayoutContext';

// Celebration
export {
  default as CompletionCelebration,
  type CompletionCelebrationProps,
} from './components/CompletionCelebration';

// Timer
export { default as GameTimer, type GameTimerProps } from './components/GameTimer';

// Canvas
export { default as SudokuCanvas } from './components/SudokuCanvas';

// Hint
export { default as HintPanel, type HintPanelProps } from './components/HintPanel';

// Controls
export {
  default as SudokuControls,
  type SudokuControlsProps,
  type SudokuControlsLabels,
} from './components/SudokuControls';

// Entry
export {
  default as EntryControls,
  type EntryControlsProps,
  type EntryControlsLabels,
} from './components/EntryControls';

// Game orchestrator
export { default as SudokuGame, type SudokuGameProps } from './components/SudokuGame';

// Navigation contract (shared with @sudobility/sudojo_ui_rn)
// The Navigator context is owned here so shared UI navigates by route name;
// the app supplies the concrete react-router adapter and mounts the provider.
export { NavigatorProvider, useNavigator } from './navigation/navigator';
