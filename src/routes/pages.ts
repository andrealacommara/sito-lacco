// ========================== MAIN IMPORTS ========================== //
import { lazyWithPreload } from "@/utils/lazyWithPreload";

// ========================== LAZY PAGES ========================== //
// Each page is wrapped with lazyWithPreload to expose a preload helper.
export const HomePage = lazyWithPreload(() => import("@/pages/homePage"));
export const MusicPage = lazyWithPreload(() => import("@/pages/musicPage"));
export const AboutPage = lazyWithPreload(() => import("@/pages/aboutPage"));
export const ContactPage = lazyWithPreload(() => import("@/pages/contactPage"));
export const PressKitPage = lazyWithPreload(() => import("@/pages/pressKitPage"));

// ========================== PRELOAD MAP ========================== //
// Maps route paths to the respective preload function for quick lookups.
const preloaders: Record<string, () => Promise<unknown>> = {
  "/": HomePage.preload,
  "/la-mia-musica": MusicPage.preload,
  "/su-di-me": AboutPage.preload,
  "/contatti": ContactPage.preload,
  "/presskit": PressKitPage.preload,
};

// ========================== HELPERS ========================== //
// Triggers preload of a single route (used for hover/focus events).
export const preloadRoute = (path: string) => {
  const preload = preloaders[path];

  if (preload) {
    void preload();
  }
};

// Preloads multiple routes at once (used for idle warm-up).
export const warmupRoutes = (paths: string[]) => {
  paths.forEach((path) => {
    const preload = preloaders[path];

    if (preload) {
      void preload();
    }
  });
};
