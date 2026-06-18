// ========================== MAIN IMPORTS ========================== //
import { lazyWithPreload } from "@/utils/lazyWithPreload";

// ========================== LAZY PAGES ========================== //
// Each page is wrapped with lazyWithPreload to expose a preload helper.
export const HomePage = lazyWithPreload(() => import("@/pages/homePage"));
export const MusicPage = lazyWithPreload(() => import("@/pages/musicPage"));
export const AboutPage = lazyWithPreload(() => import("@/pages/aboutPage"));
export const ContactPage = lazyWithPreload(() => import("@/pages/contactPage"));
export const PressKitPage = lazyWithPreload(
  () => import("@/pages/pressKitPage"),
);
export const NewsletterPage = lazyWithPreload(
  () => import("@/pages/newsletterPage"),
);
export const UnsubscribePage = lazyWithPreload(
  () => import("@/pages/unsubscribePage"),
);
export const AdminPage = lazyWithPreload(() => import("@/pages/adminPage"));
export const LivePage = lazyWithPreload(() => import("@/pages/livePage"));
export const ReleasePage = lazyWithPreload(() => import("@/pages/releasePage"));
export const NotFoundPage = lazyWithPreload(
  () => import("@/pages/notFoundPage"),
);
export const PrivacyPage = lazyWithPreload(() => import("@/pages/privacyPage"));

// ========================== PRELOAD MAP ========================== //
// Maps route paths to the respective preload function for quick lookups.
const preloaders: Record<string, () => Promise<unknown>> = {
  "/": HomePage.preload,
  "/musica": MusicPage.preload,
  "/chi-sono": AboutPage.preload,
  "/contatti": ContactPage.preload,
  "/presskit": PressKitPage.preload,
  "/newsletter": NewsletterPage.preload,
  "/privacy": PrivacyPage.preload,
  "/live": LivePage.preload,
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
