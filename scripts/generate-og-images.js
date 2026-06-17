// Generates 1200×630 OG images for each release: artwork centered on blurred background.
// Runs as part of postbuild — output goes directly to dist/.
import sharp from "sharp";
import path from "path";
import fs from "fs";

const ARTWORKS_DIR = "src/assets/images/artworks";
const OUTPUT_DIR = "dist";
const OG_W = 1200;
const OG_H = 630;

const releases = [
  { slug: "bella-al-buio", artwork: "bellaAlBuioArtwork.avif" },
  { slug: "tu-x-tu", artwork: "tuxtuArtwork.avif" },
  { slug: "per-gli-altri", artwork: "nokoruMonoArtwork.avif" },
  { slug: "davvero", artwork: "nokoruMonoArtwork.avif" },
  { slug: "ricordo", artwork: "nokoruMonoArtwork.avif" },
  { slug: "rumore-di-fondo", artwork: "rumoreDiFondoArtwork.avif" },
  { slug: "cercami", artwork: "cercamiArtwork.avif" },
  { slug: "tra-le-nuvole-sunset-version", artwork: "traLeNuvoleSunsetVersionArtwork.avif" },
  { slug: "tra-le-nuvole", artwork: "traLeNuvoleArtwork.avif" },
  { slug: "mondo-dentro", artwork: "mondoDentroArtwork.avif" },
  { slug: "tempo-perso", artwork: "tempoPersoArtwork.avif" },
];

for (const release of releases) {
  const artworkPath = path.join(ARTWORKS_DIR, release.artwork);
  const outputPath = path.join(OUTPUT_DIR, `og-${release.slug}.jpg`);

  if (!fs.existsSync(artworkPath)) {
    console.warn(`⚠  artwork not found, skipping: ${artworkPath}`);
    continue;
  }

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

console.log(`\nOG images → dist/ (${releases.length} releases)`);
