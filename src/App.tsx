// ========================== MAIN IMPORTS ========================== //
// Main libraries and page components for route management.

import { Route, Routes } from "react-router-dom"; // Client-side routing for page navigation without reloads

// Import delle pagine principali del sito
import HomePage from "@/pages/homePage"; // "Home" page
import MusicPage from "@/pages/musicPage"; // “La mia musica” page
import AboutPage from "@/pages/aboutPage"; // “Su di me” page
import ContactPage from "@/pages/contactPage"; // "Contatti" page

// ========================== MAIN COMPONENT: App ========================== //
/**
 * Main application component.
 * Defines all routes and maps URLs to the corresponding pages.
 *
 * Each route uses React Router to render content dynamically
 * without reloading, ensuring a smooth SPA experience.
 */
function App() {
  return (
    <Routes>
      {/* "Home" page */}
      <Route element={<HomePage />} path="/" />

      {/* “La mia musica” page */}
      <Route element={<MusicPage />} path="/la-mia-musica" />

      {/* “Su di me” page */}
      <Route element={<AboutPage />} path="/su-di-me" />

      {/* "Contatti" page */}
      <Route element={<ContactPage />} path="/contatti" />

      {/* Fallback route: redirects undefined paths to Home */}
      {/* Useful to handle unknown URLs and avoid blank pages */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
