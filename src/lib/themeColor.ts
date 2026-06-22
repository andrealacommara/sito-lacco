// ========================== THEME COLOR MANAGER ========================== //
// Single owner of the <meta name="theme-color"> tag.
//
// Il browser (Safari/Chrome mobile) colora la barra degli indirizzi col valore
// di questo meta. Il colore statico legato a `prefers-color-scheme` riflette la
// preferenza del SISTEMA OPERATIVO, non il tema realmente renderizzato (guidato
// da `data-theme` su <html> da ThemeSwitch). Quando divergono compare la "banda
// bianca". Qui teniamo il meta sincronizzato col tema reale, con possibilità di
// override per-pagina (es. le slug immersive sempre scure).

import { useEffect } from "react";

// Colori coerenti con globals.css: dark → #000000 (var(--background)), light → #ffffff.
const DARK_COLOR = "#000000";
const LIGHT_COLOR = "#ffffff";

// Override attivo (impostato da una pagina); null = segue il tema.
let overrideColor: string | null = null;

// Colore "auto" derivato dall'attributo data-theme corrente.
const colorForCurrentTheme = (): string =>
  document.documentElement.getAttribute("data-theme") === "dark"
    ? DARK_COLOR
    : LIGHT_COLOR;

// Restituisce l'unico <meta name="theme-color"> senza media query, creandolo se
// manca e rimuovendo eventuali varianti con `media` (es. quelle storiche legate
// a prefers-color-scheme) per evitare che il browser le usi al posto nostro.
const getMetaThemeColor = (): HTMLMetaElement => {
  const metas = Array.from(
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  );

  let primary: HTMLMetaElement | null = null;

  for (const meta of metas) {
    if (meta.hasAttribute("media")) {
      meta.remove();
    } else if (!primary) {
      primary = meta;
    } else {
      // Duplicato senza media: ne teniamo uno solo.
      meta.remove();
    }
  }

  if (!primary) {
    primary = document.createElement("meta");
    primary.setAttribute("name", "theme-color");
    document.head.appendChild(primary);
  }

  return primary;
};

// Applica il colore corrente (override se presente, altrimenti il tema reale).
export const applyThemeColor = (): void => {
  if (typeof document === "undefined") return;
  getMetaThemeColor().setAttribute(
    "content",
    overrideColor ?? colorForCurrentTheme(),
  );
};

// Imposta/azzera l'override per-pagina e riapplica subito.
export const setThemeColorOverride = (color: string | null): void => {
  overrideColor = color;
  applyThemeColor();
};

// Inizializza la sincronizzazione: applica subito e osserva i cambi di
// data-theme su <html> così la barra resta corretta su ogni pagina (anche dove
// ThemeSwitch non è montato) e dopo un toggle manuale del tema.
export const initThemeColorSync = (): void => {
  if (
    typeof document === "undefined" ||
    typeof MutationObserver === "undefined"
  )
    return;

  applyThemeColor();

  const observer = new MutationObserver(() => applyThemeColor());

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
};

// Hook React: forza un theme-color fisso finché la pagina è montata (es. le slug
// immersive, sempre scure), poi ripristina la modalità "auto" allo smontaggio.
// Passare `null` lascia il theme-color in modalità "auto" (utile per chiamarlo in
// modo incondizionato prima di un early return, rispettando le regole degli hook).
export const useThemeColor = (color: string | null): void => {
  useEffect(() => {
    setThemeColorOverride(color);

    return () => setThemeColorOverride(null);
  }, [color]);
};
