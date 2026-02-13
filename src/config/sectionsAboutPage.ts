// ========================== MAIN IMPORTS ========================== //
import aboutPic1 from "@/assets/images/lacco/aboutPic1.avif"; // Image for section1 card 1
import aboutPic2 from "@/assets/images/lacco/aboutPic2.avif"; // Image for section1 card 2
import aboutPic3 from "@/assets/images/lacco/aboutPic3.avif"; // Image for section1 card 3
import aboutPic4 from "@/assets/images/lacco/aboutPic4.avif"; // Image for section2 card 1
import aboutPic5 from "@/assets/images/lacco/aboutPic5.avif"; // Image for section2 card 2
import aboutPic6 from "@/assets/images/lacco/aboutPic6.avif"; // Image for section2 card 3

// ========================== TYPES ========================== //
// Export TypeScript types based on the structure of section arrays
// Allows reuse and autocomplete consistency across the app
export type section1 = typeof section1;
export type section2 = typeof section2;

// ========================== PAGE CARDS ========================== //
// Arrays defining the content blocks for the "Su di Me" page.
// Each section contains descriptive text in Italian and an associated image.

export const section1 = [
  {
    text: "La mia musica nasce dal bisogno di raccontare ciò che spesso non si dice: le fragilità, i pensieri nascosti, le emozioni che ci attraversano mentre nessuno guarda. È il mio modo per dare forma a ciò che resta nascosto dentro di noi.",
    image: aboutPic1,
  },
  {
    text: "Non parlo solo di sentimenti, ma di vita vera, di volti e di storie. Perché, per quanto ognuno di noi sia unico, esiste un filo conduttore che ci unisce. Seguire quel filo è la strada per conoscersi e riconoscersi negli altri.",
    image: aboutPic2,
  },
  {
    text: "Mi rivolgo a chi sa ascoltare, a chi sa ascoltarsi. A chi può essere tutto, ma non è niente, nient'altro che se stesso. La mia musica parla a chi vuole vedere, oltre le parole, l'invisibile che ci rende persone.",
    image: aboutPic3,
  },
];

export const section2 = [
  {
    text: "Sono Andrea, ma tutti mi chiamano Lacco. Torino è la mia casa: qui ho iniziato a fare musica sotto il nome di “Checkmate“, un progetto che mi ha permesso di esplorare la produzione musicale, la scrittura e il canto.",
    image: aboutPic4,
  },
  {
    text: "È con questo progetto che ho avviato le collaborazioni che oggi nutrono Lacco, grazie alle esperienze condivise con produttori, musicisti e tecnici come Emilio Orlandini e Giacomo Ruffa. Insieme abbiamo costruito legami artistici solidi, tra Torino e Milano.",
    image: aboutPic5,
  },
  {
    text: "Con il tempo, brano dopo brano, mi sono avvicinato a comprendere la mia identità. O meglio, a ritrovarla. In quel momento ho capito che non potevo, ma dovevo essere semplicemente me: Lacco.",
    image: aboutPic6,
  },
];
