import { tv } from "tailwind-variants";
// Importa la funzione `tv` di Tailwind Variants,
// che permette di creare stili dinamici e riutilizzabili basati su varianti.

// ========================== TITLE ========================== //
// Definisce lo stile del titolo principale del sito (h1, headings, ecc.)
// Usa un sistema di varianti per colore, dimensione e larghezza.
export const title = tv({
  // Stili di base applicati a tutti i titoli
  base: "tracking-tight inline font-semibold text-center",

  // Varianti configurabili per personalizzare il titolo
  variants: {
    // Colore del testo (gradienti)
    color: {
      violet: "from-[#FF1CF7] to-[#b249f8]",
      yellow: "from-[#FF705B] to-[#FFB457]",
      blue: "from-[#5EA2EF] to-[#0072F5]",
      cyan: "from-[#00b7fa] to-[#01cfea]",
      green: "from-[#6FEE8D] to-[#17c964]",
      pink: "from-[#FF72E1] to-[#F54C7A]",
      foreground: "dark:from-[#FFFFFF] dark:to-[#4B4B4B]", // Colore neutro per modalità scura
    },

    // Dimensione del titolo
    size: {
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl",
      lg: "text-4xl lg:text-6xl",
    },

    // Opzione per rendere il titolo a tutta larghezza
    fullWidth: {
      true: "w-full block",
    },
  },

  // Imposta i valori di default
  defaultVariants: {
    size: "md",
  },

  // Varianti composte — applicano classi aggiuntive in base a combinazioni
  compoundVariants: [
    {
      color: [
        "violet",
        "yellow",
        "blue",
        "cyan",
        "green",
        "pink",
        "foreground",
      ],
      // Applica un effetto gradiente al testo
      class: "bg-clip-text text-transparent bg-linear-to-b",
    },
  ],
});

// ========================== SUBTITLE ========================== //
// Stili per i sottotitoli o paragrafi introduttivi sotto i titoli principali.
export const subtitle = tv({
  // Stili di base per il sottotitolo
  base: "w-full md:w-1/2 my-2 text-lg lg:text-xl text-default-600 block max-w-full font-semibold text-center",

  // Varianti configurabili
  variants: {
    // 📏 Opzione per forzare larghezza piena
    fullWidth: {
      true: "w-full!",
    },

    // 🎨 Colori opzionali per il testo
    color: {
      danger: "text-danger", // Rosso
      success: "text-success", // Verde
    },
  },

  // Valori di default
  defaultVariants: {
    fullWidth: true,
  },
});
