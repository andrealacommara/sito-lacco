import { Route, Routes } from "react-router-dom";

import HomePage from "@/pages/home";
import LaMiaMusicaPage from "@/pages/laMiaMusica";
import SuDiMePage from "@/pages/suDiMe";
import ContattiPage from "@/pages/contatti";

function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<LaMiaMusicaPage />} path="/la-mia-musica" />
      <Route element={<SuDiMePage />} path="/su-di-me" />
      <Route element={<ContattiPage />} path="/contatti" />
    </Routes>
  );
}

export default App;
