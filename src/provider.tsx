import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { useHref, useNavigate } from "react-router-dom";

/**
 * Estensione del modulo @react-types/shared per configurare
 * le opzioni di navigazione personalizzate del router.
 * Serve a tipizzare correttamente i parametri usati da HeroUI
 * in combinazione con React Router.
 */
declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

/**
 * Provider globale dell'applicazione.
 *
 * - Inietta il contesto di HeroUI (libreria di componenti React basata su Tailwind).
 * - Collega il sistema di routing interno di HeroUI a React Router
 *   attraverso i metodi `navigate` e `useHref`.
 * - Aggiunge il ToastProvider per la gestione centralizzata delle notifiche.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {/* Provider globale per notifiche toast */}
      <ToastProvider placement="bottom-right" />
      {/* Contenuto dell'applicazione */}
      {children}
    </HeroUIProvider>
  );
}
