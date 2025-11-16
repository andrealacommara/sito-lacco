// ========================== MAIN IMPORTS ========================== //
// Main libraries and page components for route management.

import { Route, Routes } from "react-router-dom";
import { Suspense, useEffect } from "react";

import {
  AboutPage,
  ContactPage,
  HomePage,
  MusicPage,
  PressKitPage,
  warmupRoutes,
} from "@/routes/pages";

// ========================== MAIN COMPONENT: App ========================== //
/**
 * Main application component.
 * Defines all routes and maps URLs to the corresponding pages.
 *
 * Each route uses React Router to render content dynamically
 * without reloading, ensuring a smooth SPA experience.
 * Lazy loading splits each page into a separate JS chunk,
 * reducing the size of the initial bundle.
 */
function App() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathsToWarm = ["/la-mia-musica", "/su-di-me", "/contatti", "/presskit"];
    const warm = () => warmupRoutes(pathsToWarm);

    const idleCallback = (
      window as typeof window & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    ).requestIdleCallback;
    const cancelIdle = (
      window as typeof window & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    ).cancelIdleCallback;

    if (
      typeof idleCallback === "function" &&
      typeof cancelIdle === "function"
    ) {
      const idleId = idleCallback(() => warm());

      return () => cancelIdle(idleId);
    }

    const timeoutId = window.setTimeout(warm, 1500);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-sm text-gray-400">
          Loading...
        </div>
      }
    >
      <Routes>
        {/* "Home" page */}
        <Route element={<HomePage />} path="/" />

        {/* “La mia musica” page */}
        <Route element={<MusicPage />} path="/la-mia-musica" />

        {/* “Su di me” page */}
        <Route element={<AboutPage />} path="/su-di-me" />

        {/* "Contatti" page */}
        <Route element={<ContactPage />} path="/contatti" />

        {/* "PressKit" page */}
        <Route element={<PressKitPage />} path="/presskit" />

        {/* Fallback route */}
        <Route element={<HomePage />} path="*" />
      </Routes>
    </Suspense>
  );
}

export default App;
