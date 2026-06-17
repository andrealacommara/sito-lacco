// Generates 1200×630 OG images for each release: artwork centered on blurred background.
// Runs as part of postbuild — output goes directly to dist/.
//
// La lista delle release è derivata automaticamente da src/config/catalog.ts:
// aggiungere una release nel catalog genera il suo OG, senza toccare questo script.
import sharp from "sharp";
import path from "path";
import fs from "fs";

import { loadCatalog } from "./catalog-loader.mjs";

const ARTWORKS_DIR = "src/assets/images/artworks";
const OUTPUT_DIR = "dist";
const OG_W = 1200;
const OG_H = 630;

// ----- 1. Legge il catalog (TS) tramite il loader condiviso ----- //
const { catalog } = await loadCatalog();

// ----- 2. Indicizza gli artwork su disco per basename (ricorsivo) ----- //
function walk(dir) {
  const out = {};

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) Object.assign(out, walk(full));
    else out[entry.name] = full;
  }

  return out;
}

const artworkByName = walk(ARTWORKS_DIR);

// ----- 3. Genera un OG per ogni release ----- //
for (const release of catalog) {
  const artworkPath = artworkByName[release.artwork];

  if (!artworkPath) {
    console.warn(
      `⚠  artwork non trovato per "${release.slug}" (${release.artwork}), skip`,
    );
    continue;
  }

  const outputPath = path.join(OUTPUT_DIR, `og-${release.slug}.jpg`);

  // Background: artwork stretched to 1200×630, blurred and darkened
  const bgBuffer = await sharp(artworkPath)
    .resize(OG_W, OG_H, { fit: "cover", position: "center" })
    .blur(32)
    .modulate({ brightness: 0.4 })
    .png()
    .toBuffer();

  // Foreground: artwork square (630×630), crisp
  const fgBuffer = await sharp(artworkPath)
    .resize(OG_H, OG_H, { fit: "cover", position: "center" })
    .png()
    .toBuffer();

  const left = Math.floor((OG_W - OG_H) / 2); // 285px — horizontally centered

  await sharp(bgBuffer)
    .composite([{ input: fgBuffer, left, top: 0 }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath);

  console.log(`  ✓ og-${release.slug}.jpg`);
}

console.log(`\nOG images → dist/ (${catalog.length} releases)`);
