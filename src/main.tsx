// ========================== MAIN IMPORTS ========================== //
// Core React libraries, app entry point, and global providers.

import React from "react"; // React core library
import ReactDOM from "react-dom/client"; // ReactDOM for rendering the app into the DOM
import { BrowserRouter } from "react-router-dom"; // Client-side routing
import { HelmetProvider } from "react-helmet-async"; // SEO and dynamic meta tags manager

import App from "./App.tsx"; // Main App component
import { Provider } from "./provider.tsx"; // Global context provider (theme, state, etc.)

import "@/styles/globals.css"; // Global stylesheet
import { ensureMediaKeySystemRobustness } from "@/utils/ensureMediaKeySystemRobustness";

// ========================== ENTRY POINT ========================== //
/**
 * Main entry point of the React application.
 * Creates the ReactDOM root and mounts the app into the #root element.
 *
 * The app is wrapped in multiple global providers:
 * - React.StrictMode: enables additional checks during development.
 * - BrowserRouter: handles client-side navigation.
 * - HelmetProvider: manages SEO and meta tag updates.
 * - Provider: provides shared context and configuration across the app.
 */
ensureMediaKeySystemRobustness();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* HelmetProvider wraps the app to enable dynamic SEO meta tags */}
    <HelmetProvider>
      {/* BrowserRouter handles the routing logic for the app */}
      <BrowserRouter>
        {/* Global Provider for shared state, theme, or configurations */}
        <Provider>
          <App />
        </Provider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
