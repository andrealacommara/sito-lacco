// ========================== MAIN IMPORTS ========================== //
// Type definitions and core dependencies for global app providers.

import type { NavigateOptions } from "react-router-dom"; // Navigation options type for router integration

import { HeroUIProvider } from "@heroui/system"; // HeroUI global provider (component styling, theme context)
import { ToastProvider } from "@heroui/toast"; // Toast system provider for global notifications
import { useHref, useNavigate } from "react-router-dom"; // React Router hooks for navigation and URL resolution

// ========================== MODULE EXTENSION ========================== //
/**
 * Extends the @react-types/shared module to define
 * the custom router configuration used by HeroUI.
 *
 * This ensures proper type-checking for navigation options
 * when integrating HeroUI with React Router.
 */
declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

// ========================== PROVIDER COMPONENT ========================== //
/**
 * Global application provider.
 *
 * Responsibilities:
 * - Injects the HeroUI context (React component library built on Tailwind).
 * - Connects HeroUI’s internal navigation system with React Router
 *   through the `navigate` and `useHref` hooks.
 * - Wraps the app in a centralized ToastProvider for global notifications.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {/* Global toast provider for app-wide notifications */}
      <ToastProvider placement="bottom-right" />
      {/* Render the wrapped application content */}
      {children}
    </HeroUIProvider>
  );
}
