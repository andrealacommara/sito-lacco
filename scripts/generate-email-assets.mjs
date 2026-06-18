// Generates header-email.png for use in email templates.
// SVG inline is stripped by Gmail — this PNG is hosted on lacco.it and
// referenced via a single <img> tag.
//
// Run once (or after changing logo/waves): npm run generate-email-assets
// Commit the output in public/ — it deploys with the normal build.
import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── Dimensions ──────────────────────────────────────────────────────────────
// Display size matches email header: 520×128 CSS px
// 2× retina canvas for crispness
const DISP_W = 520, DISP_H = 128;
const RETINA_W = DISP_W * 2, RETINA_H = DISP_H * 2; // 1040×256

// Logo at retina: 282×160 (displayed at 141×80)
const LOGO_W = 282, LOGO_H = 160;

// ── Logo ────────────────────────────────────────────────────────────────────
let logoSvg = readFileSync(join(ROOT, "src/assets/icons/logo-lacco.svg"), "utf-8");
logoSvg = logoSvg.replace(/^<\?xml[^>]+\?>\s*/m, "");
logoSvg = logoSvg.replace(/<!DOCTYPE[^>]+>\s*/m, "");
logoSvg = logoSvg.replace('width="100%" height="100%"', `width="${LOGO_W}" height="${LOGO_H}"`);

const logoBuf = await sharp(Buffer.from(logoSvg)).png().toBuffer();

// ── Waves ───────────────────────────────────────────────────────────────────
// Generated at display size (520×128), then resized to retina by sharp.
const W = DISP_W, H = DISP_H, T = 80;
const AMP_SCALE = (H / 900) * 2.8;
const waveParams = [
  { baseY: 0.10, amp: 22, freq: 0.007, phase: 0.0, speed: 0.014 },
  { baseY: 0.35, amp: 30, freq: 0.006, phase: 2.5, speed: 0.016 },
  { baseY: 0.63, amp: 20, freq: 0.013, phase: 3.1, speed: 0.018 },
  { baseY: 0.88, amp: 16, freq: 0.012, phase: 4.2, speed: 0.015 },
];

const wavePaths = waveParams.map((w) => {
  const sAmp = w.amp * AMP_SCALE;
  const pf = Math.sin(T * w.speed + w.phase);
  const sf = 0.3 * Math.cos(T * w.speed * 0.6 + w.phase + 2.1);
  let d = "";
  for (let x = 0; x <= W; x += 6) {
    const y =
      w.baseY * H +
      Math.sin(x * w.freq) * sAmp * pf +
      Math.sin(x * w.freq * 1.7 + 0.5) * sAmp * sf;
    d += x === 0 ? `M${x},${y.toFixed(1)}` : `L${x},${y.toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" stroke-linecap="round"/>`;
}).join("");

const wavesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${wavePaths}</svg>`;

const wavesBuf = await sharp(Buffer.from(wavesSvg))
  .resize(RETINA_W, RETINA_H)
  .png()
  .toBuffer();

// ── Composite: logo centered on waves ───────────────────────────────────────
const left = Math.round((RETINA_W - LOGO_W) / 2); // (1040-282)/2 = 379
const top = Math.round((RETINA_H - LOGO_H) / 2);  // (256-160)/2 = 48

await sharp(wavesBuf)
  .composite([{ input: logoBuf, left, top }])
  .toFile(join(ROOT, "public/header-email.png"));

console.log(`✓ public/header-email.png (${RETINA_W}×${RETINA_H}, displayed at ${DISP_W}×${DISP_H})`);
