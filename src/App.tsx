import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/laMiaMusica";
import PricingPage from "@/pages/suDiMe";
import BlogPage from "@/pages/merch";
import AboutPage from "@/pages/contatti";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/la-mia-musica" />
      <Route element={<PricingPage />} path="/su-di-me" />
      <Route element={<BlogPage />} path="/merch" />
      <Route element={<AboutPage />} path="/contatti" />
    </Routes>
  );
}

export default App;
