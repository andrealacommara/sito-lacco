// ========================== MAIN IMPORTS ========================== //
// Main libraries and page components for route management.

import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react"; // Import React.lazy + Suspense

// ========================== LAZY IMPORTS ========================== //
// Lazy loading for each main page: improves initial load time
const HomePage = lazy(() => import("@/pages/homePage"));
const MusicPage = lazy(() => import("@/pages/musicPage"));
const AboutPage = lazy(() => import("@/pages/aboutPage"));
const ContactPage = lazy(() => import("@/pages/contactPage"));

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
        <Route path="/" element={<HomePage />} />

        {/* “La mia musica” page */}
        <Route path="/la-mia-musica" element={<MusicPage />} />

        {/* “Su di me” page */}
        <Route path="/su-di-me" element={<AboutPage />} />

        {/* "Contatti" page */}
        <Route path="/contatti" element={<ContactPage />} />

        {/* Fallback route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
