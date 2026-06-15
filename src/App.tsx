import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";

import {
  AboutPage,
  AdminPage,
  ConfirmPage,
  ContactPage,
  HomePage,
  MusicPage,
  NewsletterPage,
  NotFoundPage,
  PressKitPage,
  PrivacyPage,
  ReleasePage,
  UnsubscribePage,
  warmupRoutes,
} from "@/routes/pages";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathsToWarm = [
      "/la-mia-musica",
      "/su-di-me",
      "/contatti",
      "/presskit",
      "/newsletter",
    ];
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
        {/* Core pages */}
        <Route element={<HomePage />} path="/" />
        <Route element={<MusicPage />} path="/la-mia-musica" />
        <Route element={<AboutPage />} path="/su-di-me" />
        <Route element={<ContactPage />} path="/contatti" />
        <Route element={<PressKitPage />} path="/presskit" />

        {/* Newsletter e subscription flow */}
        <Route element={<NewsletterPage />} path="/newsletter" />
        <Route element={<ConfirmPage />} path="/confirm" />
        <Route element={<UnsubscribePage />} path="/unsubscribe" />

        {/* Admin (protetto da Supabase Auth) */}
        <Route element={<AdminPage />} path="/admin" />

        {/* Privacy policy */}
        <Route element={<PrivacyPage />} path="/privacy" />

        {/* Release pages: /:slug deve stare DOPO tutte le route specifiche */}
        <Route element={<ReleasePage />} path="/:slug" />

        {/* 404 vero */}
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  );
}

export default App;
