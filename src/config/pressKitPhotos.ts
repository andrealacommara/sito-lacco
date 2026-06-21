import type { ImageLikeImport } from "@/components/smartImage";

// Stessa strategia della gallery live: si tengono solo gli ORIGINALI in HQ;
// la versione leggera mostrata a video è generata da imagetools, mentre il
// download serve il file originale.
//   Originali: src/assets/images/presskit/HQ/*.jpg  (drop & go)
export type PressKitPhoto = {
  src: ImageLikeImport; // versione leggera (griglia + modale)
  downloadUrl: string; // JPG HQ originale (download)
  alt: string;
};

const displayModules = import.meta.glob<ImageLikeImport>(
  "../assets/images/presskit/HQ/*.{jpg,jpeg,png}",
  { eager: true, import: "default", query: "?w=1200" },
);
const originalModules = import.meta.glob<string>(
  "../assets/images/presskit/HQ/*.{jpg,jpeg,png}",
  { eager: true, import: "default", query: "?url" },
);

export const pressKitPhotos: PressKitPhoto[] = Object.keys(displayModules)
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
  .map((p, i) => ({
    src: displayModules[p],
    downloadUrl: originalModules[p],
    alt: `Lacco — Foto stampa ${i + 1}`,
  }));
