// ========================== MAIN IMPORTS ========================== //
// Type definitions and core dependencies for global app providers.

import type { NavigateOptions } from "react-router-dom"; // Navigation options type for router integration

import { RouterProvider } from "react-aria-components"; // React Aria router bridge (HeroUI v3 is built on RAC)
import { ToastProvider } from "@heroui/react"; // Toast system provider for global notifications
import { useHref, useNavigate } from "react-router-dom"; // React Router hooks for navigation and URL resolution

// ========================== MODULE EXTENSION ========================== //
/**
 * Extends React Aria's RouterConfig to use React Router's navigation
 * options, so HeroUI/React-Aria components with `href` perform
 * client-side navigation instead of full page reloads.
 */
declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

// ========================== PROVIDER COMPONENT ========================== //
/**
 * Global application provider.
 *
 * Responsibilities:
 * - Bridges React Aria's router with React Router (HeroUI v3 has no
 *   HeroUIProvider; routing is wired via RAC's RouterProvider).
 * - Mounts a centralized ToastProvider for app-wide notifications.
 *
 * Theming (light/dark) is applied via the `data-theme` attribute on
 * <html> by ThemeSwitch — no provider needed in v3.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      {/* Global toast provider for app-wide notifications */}
      <ToastProvider placement="bottom end" width={380} />
      {/* Render the wrapped application content */}
      {children}
    </RouterProvider>
  );
}
