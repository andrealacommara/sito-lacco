import { Route, Routes } from "react-router-dom";

import HomePage from "@/pages/home";
import LaMiaMusicaPage from "@/pages/laMiaMusica";
import SuDiMePage from "@/pages/suDiMe";
import ContattiPage from "@/pages/contatti";

/**
 * Componente principale dell'applicazione.
 * Gestisce la definizione delle rotte e il mapping tra URL e pagine.
 *
 * Ogni rotta utilizza React Router per rendere il contenuto
 * senza ricaricare la pagina, garantendo un'esperienza fluida in stile SPA.
 */
function App() {
  return (
    <Routes>
      {/* Pagina principale (Home) */}
      <Route element={<HomePage />} path="/" />

      {/* Sezione dedicata alla musica dell'artista */}
      <Route element={<LaMiaMusicaPage />} path="/la-mia-musica" />

      {/* Pagina biografica */}
      <Route element={<SuDiMePage />} path="/su-di-me" />

      {/* Pagina contatti con form di collegamento */}
      <Route element={<ContattiPage />} path="/contatti" />

      {/* Fallback: qualsiasi percorso non definito qui reindirizza alla Home */}
      {/* Utile per gestire URL non previsti e evitare pagine bianche */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
