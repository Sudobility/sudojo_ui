/**
 * The shared navigation contract, owned by the UI library (web).
 *
 * The `Navigator` context lives here so the shared UI navigates by route name —
 * `useNavigator().go('settings')` — without importing react-router. The app
 * (`sudojo_app`) supplies the concrete `Navigator` (its react-router adapter
 * over the current `/:lang`) and mounts `NavigatorProvider`. Typed over
 * sudojo_lib's shared `SudojoRoutes`; app-only routes (the web's content pages)
 * are navigated by the app's own router, not through this contract.
 *
 * Mirrors `@sudobility/sudojo_ui_rn`'s `navigation/navigator.ts` (same context,
 * same route map) so a component moved between web and native navigates the
 * same way.
 */
import { createNavigatorContext } from '@sudobility/routing/react';
import type { SudojoRoutes } from '@sudobility/sudojo_lib';

const ctx = createNavigatorContext<SudojoRoutes>();

export const NavigatorProvider = ctx.NavigatorProvider;
export const useNavigator = ctx.useNavigator;
