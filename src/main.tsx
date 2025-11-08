import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

/**
 * Punto di ingresso principale dell'applicazione React.
 * Qui viene creata la root ReactDOM e montata l'app all'interno dell'elemento #root.
 * L'app è racchiusa in diversi wrapper globali:
 * - React.StrictMode: abilita controlli aggiuntivi in sviluppo.
 * - BrowserRouter: gestisce la navigazione client-side.
 * - Provider: fornisce contesto e stato condiviso a tutto il progetto.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Router per la gestione delle rotte dell'app */}
    <BrowserRouter>
      {/* Provider globale per stato, tema o configurazioni condivise */}
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
