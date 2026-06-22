// Genera le OG 1200×630 per i live: poster nitido centrato su sfondo sfocato.
// Stesso stile e output di generate-og-images.js (release), ma per i live.
// Output → dist/og-<slug>.jpg. Eventi senza poster: skip (fallback a og-image.jpg).
//
// La lista degli eventi è derivata da src/config/liveEvents.data.ts (fonte di
// verità): aggiungere un live con un poster nella sua cartella genera la sua OG.
import path from "path";
import fs from "fs";

import sharp from "sharp";

import { loadLiveEvents } from "./events-loader.mjs";

const LIVE_DIR = "src/assets/images/liveEvents";
const OUTPUT_DIR = "dist";
const OG_W = 1200;
const OG_H = 630;
const POSTER_EXT = ["avif", "jpg", "jpeg", "png"];

const { liveEventsData } = await loadLiveEvents();

// Trova il file poster.<ext> nella cartella dell'evento, se presente.
function findPoster(slug) {
  for (const ext of POSTER_EXT) {
    const candidate = path.join(LIVE_DIR, slug, `poster.${ext}`);

    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

let generated = 0;

for (const event of liveEventsData) {
  const posterPath = findPoster(event.slug);

  if (!posterPath) {
    console.warn(`⚠  nessun poster per "${event.slug}", skip OG`);
    continue;
  }

  const outputPath = path.join(OUTPUT_DIR, `og-${event.slug}.jpg`);

  // Background: poster stretched to 1200×630, blurred and darkened
  const bgBuffer = await sharp(posterPath)
    .resize(OG_W, OG_H, { fit: "cover", position: "center" })
    .blur(32)
    .modulate({ brightness: 0.4 })
    .png()
    .toBuffer();

  // Foreground: poster square (630×630), crisp
  const fgBuffer = await sharp(posterPath)
    .resize(OG_H, OG_H, { fit: "cover", position: "center" })
    .png()
    .toBuffer();

  const left = Math.floor((OG_W - OG_H) / 2); // 285px — horizontally centered

  await sharp(bgBuffer)
    .composite([{ input: fgBuffer, left, top: 0 }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath);

  generated += 1;
  console.log(`  ✓ og-${event.slug}.jpg`);
}

console.log(`\nOG eventi → dist/ (${generated}/${liveEventsData.length} con poster)`);
