// ========================== IMPORT ========================== //
// Tipizzazione condivisa per le icone SVG: include dimensioni, colore e props extra.
import { IconSvgProps } from "@/types";

// ========================== FUNZIONE: createIcon ========================== //
/**
 * Funzione di utilità per creare componenti React di icone SVG
 * a partire da una stringa `path` (comando SVG).
 *
 * @param path - La stringa `d` del tracciato SVG che definisce la forma dell’icona.
 * @param viewBox - L'area di visualizzazione dell'SVG (default: "0 0 512 512").
 *
 * @returns Un componente React che rappresenta l’icona generata.
 *
 * Questa funzione consente di creare dinamicamente icone personalizzate
 * con dimensioni e stili configurabili tramite le props.
 */
export const createIcon = (path: string, viewBox = "0 0 512 512") => {
  // Restituisce un componente funzionale React che rappresenta l’icona.
  const IconComponent = ({
    size = 29,
    width,
    height,
    ...props
  }: IconSvgProps) => (
    <svg
      // Dimensione dell’icona: usa `size` come valore principale, o `height` se specificato
      height={size || height}
      // Imposta il box di riferimento per il tracciato
      viewBox={viewBox}
      // Dimensione dell’icona: usa `size` come valore principale, o `width` se specificato
      width={size || width}
      // Permette di passare ulteriori proprietà (className, style, ecc.)
      {...props}
    >
      {/* Tracciato SVG: il cuore grafico dell’icona */}
      <path d={path} fill="currentColor" />
    </svg>
  );

  IconComponent.displayName = "IconComponent";

  return IconComponent;
};
