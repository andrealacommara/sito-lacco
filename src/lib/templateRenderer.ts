// ========================== TEMPLATE RENDERER ========================== //
// Pure Canvas 2D rendering for the admin "Template Studio". Draws a branded
// social graphic (background + static wave pattern + logo + optional text) at
// an exact export resolution. No DOM/React deps so it can be reused both for
// the live preview and for headless batch export.

import logoLacco from "@/assets/icons/logo-lacco.svg?raw";

export interface TemplateOptions {
  width: number;
  height: number;
  theme: "dark" | "light";
  /** Render the logo in the brand red instead of the theme color. */
  accentLogo: boolean;
  /** Render the title in the brand red instead of the theme color. */
  accentTitle: boolean;
  /** Render the wave pattern in the brand red instead of the theme color. */
  accentWaves: boolean;
  showLogo: boolean;
  showPattern: boolean;
  /** Logo width as a fraction of canvas width. */
  logoScale: number;
  title?: string;
  /** Body as HTML (from the rich-text editor); supports bold/italic/underline. */
  bodyHtml?: string;
}

// Brand red — matches --danger (light) in src/styles/globals.css.
const BRAND_RED = "hsl(339, 86.54%, 40.78%)";
// Brand red as rgb, for building rgba() strokes with custom alpha.
const BRAND_RED_RGB = "194, 14, 77";

const REF_WIDTH = 1080;

function bgColor(theme: TemplateOptions["theme"]): string {
  return theme === "dark" ? "#000000" : "#ffffff";
}

function themeColor(theme: TemplateOptions["theme"]): string {
  return theme === "dark" ? "#ffffff" : "#000000";
}

// Reuse the same path the navbar <Logo> uses, recolored to `color`.
const logoPath = (logoLacco.match(/<path[^>]*d="([^"]*)"/)?.[1] ?? "").trim();

function logoSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 1700"><path d="${logoPath}" fill="${color}" fill-rule="evenodd" clip-rule="evenodd" transform="translate(-365,-1038) scale(1.25)"/></svg>`;
}

function loadLogoImage(color: string): Promise<HTMLImageElement> {
  const blob = new Blob([logoSvg(color)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

// Static wave pattern. Each line is defined in a resolution-independent way:
// `baseY` is a fraction of canvas height (so lines spread across whatever
// aspect ratio is exported), `amp`/`amp2` are fractions of canvas WIDTH (so the
// wave steepness stays consistent regardless of height), and frequencies are
// expressed in cycles-across-the-width. These mirror the organic character of
// the site's animated <BackgroundPattern>, frozen at a pleasing moment.
interface WaveSpec {
  baseY: number;
  /** Primary amplitude as a fraction of canvas width. */
  amp: number;
  /** Primary frequency in cycles across the full width. */
  cycles: number;
  /** Secondary-harmonic frequency multiplier, for organic drift. */
  cycles2: number;
  /** Secondary amplitude as a fraction of the primary. */
  amp2: number;
  phase: number;
}

const WAVES: WaveSpec[] = [
  {
    baseY: 0.08,
    amp: 0.026,
    cycles: 1.3,
    cycles2: 2.1,
    amp2: 0.35,
    phase: 0.0,
  },
  { baseY: 0.2, amp: 0.02, cycles: 1.9, cycles2: 3.3, amp2: 0.3, phase: 1.2 },
  { baseY: 0.31, amp: 0.034, cycles: 1.0, cycles2: 2.4, amp2: 0.4, phase: 2.5 },
  { baseY: 0.42, amp: 0.028, cycles: 1.6, cycles2: 2.8, amp2: 0.3, phase: 0.8 },
  {
    baseY: 0.52,
    amp: 0.022,
    cycles: 2.2,
    cycles2: 3.7,
    amp2: 0.28,
    phase: 3.1,
  },
  {
    baseY: 0.63,
    amp: 0.032,
    cycles: 1.2,
    cycles2: 2.0,
    amp2: 0.38,
    phase: 1.8,
  },
  { baseY: 0.74, amp: 0.024, cycles: 1.8, cycles2: 3.1, amp2: 0.3, phase: 4.2 },
  { baseY: 0.85, amp: 0.03, cycles: 1.1, cycles2: 2.5, amp2: 0.35, phase: 2.0 },
  { baseY: 0.94, amp: 0.02, cycles: 1.5, cycles2: 2.9, amp2: 0.3, phase: 5.4 },
];

function drawWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: TemplateOptions["theme"],
  accent: boolean,
): void {
  const scale = w / REF_WIDTH;

  // Resolve the stroke color (full opacity) and the overall layer opacity
  // separately. The lines are drawn opaque onto an offscreen layer and the
  // whole layer is then composited at `alpha` — so where two waves cross, the
  // result stays a single flat tint instead of the dark "bead" you get when
  // translucent strokes overlap. That removes the old constraint that forced
  // lines to never cross, letting the waves flow organically like the site.
  let color: string;
  let alpha: number;

  if (accent) {
    color = `rgb(${BRAND_RED_RGB})`;
    alpha = theme === "dark" ? 0.4 : 0.3;
  } else {
    color = theme === "dark" ? "#ffffff" : "#000000";
    alpha = theme === "dark" ? 0.24 : 0.17;
  }

  const layer = document.createElement("canvas");

  layer.width = w;
  layer.height = h;
  const lctx = layer.getContext("2d");

  if (!lctx) return;

  lctx.strokeStyle = color;
  lctx.lineWidth = 3 * scale;
  lctx.lineCap = "round";
  lctx.lineJoin = "round";

  // Draw a little past both edges so the round end-caps fall off-canvas
  // (otherwise they read as small "dots" at the left/right margins).
  const margin = 40 * scale;
  const step = Math.max(1, scale);

  for (const wave of WAVES) {
    const baseY = wave.baseY * h;
    const amp = wave.amp * w;
    const freq = (wave.cycles * 2 * Math.PI) / w;
    const freq2 = (wave.cycles2 * 2 * Math.PI) / w;

    lctx.beginPath();
    for (let x = -margin; x <= w + margin; x += step) {
      const primary = Math.sin(x * freq + wave.phase) * amp;
      const secondary =
        Math.sin(x * freq2 + wave.phase + 2.1) * amp * wave.amp2;
      const y = baseY + primary + secondary;

      x === -margin ? lctx.moveTo(x, y) : lctx.lineTo(x, y);
    }
    lctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = words[0];

    for (let i = 1; i < words.length; i++) {
      const candidate = `${current} ${words[i]}`;

      if (ctx.measureText(candidate).width > maxWidth) {
        lines.push(current);
        current = words[i];
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }

  return lines;
}

// ── Rich-text body layout ──────────────────────────────────────────────────

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface Segment extends Run {
  width: number;
}

interface RichLine {
  segments: Segment[];
  width: number;
}

const BLOCK_TAGS = new Set(["P", "DIV", "LI", "UL", "OL", "BLOCKQUOTE"]);

// Parse editor HTML into paragraphs of styled runs.
function parseRichText(html: string): Run[][] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const paragraphs: Run[][] = [];
  let current: Run[] = [];

  const pushPara = () => {
    paragraphs.push(current);
    current = [];
  };

  const walk = (node: Node, style: Omit<Run, "text">) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";

        if (text) current.push({ text, ...style });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName;

        if (tag === "BR") {
          pushPara();
          continue;
        }
        const next: Omit<Run, "text"> = {
          bold: style.bold || tag === "STRONG" || tag === "B",
          italic: style.italic || tag === "EM" || tag === "I",
          underline: style.underline || tag === "U" || tag === "A",
        };

        if (BLOCK_TAGS.has(tag)) {
          if (current.length) pushPara();
          walk(el, next);
          pushPara();
        } else {
          walk(el, next);
        }
      }
    }
  };

  walk(doc.body, { bold: false, italic: false, underline: false });
  if (current.length) pushPara();

  // Drop empty paragraphs at the very start/end.
  return paragraphs.filter(
    (p, i) =>
      p.some((r) => r.text.trim()) || (i > 0 && i < paragraphs.length - 1),
  );
}

function runFont(run: Run, fontPx: number): string {
  const weight = run.bold ? 700 : 400;
  const styleStr = run.italic ? "italic " : "";

  return `${styleStr}${weight} ${fontPx}px "Lora", Georgia, serif`;
}

// Greedy word-wrap that preserves per-run styling, producing centered-ready lines.
function layoutRichText(
  ctx: CanvasRenderingContext2D,
  paragraphs: Run[][],
  fontPx: number,
  maxWidth: number,
): RichLine[] {
  const lines: RichLine[] = [];

  for (const para of paragraphs) {
    let segs: Segment[] = [];
    let width = 0;

    const flush = () => {
      // Trim trailing whitespace segment so centering stays accurate.
      while (segs.length && segs[segs.length - 1].text.trim() === "") {
        width -= segs[segs.length - 1].width;
        segs.pop();
      }
      lines.push({ segments: segs, width });
      segs = [];
      width = 0;
    };

    for (const run of para) {
      const tokens = run.text.split(/(\s+)/).filter((t) => t !== "");

      for (const token of tokens) {
        const isSpace = /^\s+$/.test(token);

        if (isSpace && segs.length === 0) continue;
        ctx.font = runFont(run, fontPx);
        const tWidth = ctx.measureText(token).width;

        if (!isSpace && width + tWidth > maxWidth && segs.length > 0) flush();
        ctx.font = runFont(run, fontPx);
        const segWidth = isSpace ? ctx.measureText(token).width : tWidth;

        segs.push({ ...run, text: token, width: segWidth });
        width += segWidth;
      }
    }
    flush();
  }

  return lines;
}

function drawRichLines(
  ctx: CanvasRenderingContext2D,
  lines: RichLine[],
  fontPx: number,
  lineHeight: number,
  centerX: number,
  startY: number,
  color: string,
): void {
  ctx.textAlign = "left";
  ctx.fillStyle = color;
  let y = startY;

  for (const line of lines) {
    let x = centerX - line.width / 2;

    for (const seg of line.segments) {
      ctx.font = runFont(seg, fontPx);
      ctx.fillText(seg.text, x, y);
      if (seg.underline && seg.text.trim()) {
        const uy = y + fontPx * 0.12;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, fontPx * 0.05);
        ctx.beginPath();
        ctx.moveTo(x, uy);
        ctx.lineTo(x + seg.width, uy);
        ctx.stroke();
        ctx.restore();
      }
      x += seg.width;
    }
    y += lineHeight;
  }
}

export async function renderTemplate(
  canvas: HTMLCanvasElement,
  o: TemplateOptions,
): Promise<void> {
  canvas.width = o.width;
  canvas.height = o.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const { width: w, height: h } = o;
  const theme = o.theme;

  // Background
  ctx.fillStyle = bgColor(theme);
  ctx.fillRect(0, 0, w, h);

  // Static wave pattern
  if (o.showPattern) drawWaves(ctx, w, h, theme, o.accentWaves);

  // Logo — centered horizontally near the top
  if (o.showLogo) {
    const logoColor = o.accentLogo ? BRAND_RED : themeColor(theme);
    const img = await loadLogoImage(logoColor);
    const logoW = w * o.logoScale;
    const logoH = (logoW * 1700) / 3000;
    const logoX = (w - logoW) / 2;
    const logoY = h * 0.06;

    ctx.drawImage(img, logoX, logoY, logoW, logoH);
  }

  // Text — title (Playfair) + rich body (Lora), as one vertically-centered group.
  const title = o.title?.trim();
  const bodyParas =
    o.bodyHtml && o.bodyHtml.replace(/<[^>]*>/g, "").trim()
      ? parseRichText(o.bodyHtml)
      : [];

  if (title || bodyParas.length) {
    const scale = w / REF_WIDTH;
    const maxTextWidth = w * 0.82;
    const titleSize = 96 * scale;
    const bodySize = 46 * scale;

    // Ensure the variable fonts are ready before measuring/drawing.
    await Promise.all([
      document.fonts.load(`700 ${titleSize}px "Playfair Display"`),
      document.fonts.load(`400 ${bodySize}px "Lora"`),
      document.fonts.load(`700 ${bodySize}px "Lora"`),
      document.fonts.load(`italic 400 ${bodySize}px "Lora"`),
    ]).catch(() => undefined);

    ctx.textBaseline = "alphabetic";

    const titleLineH = titleSize * 1.15;
    const bodyLineH = bodySize * 1.4;

    const titleLines: string[] = [];

    if (title) {
      ctx.textAlign = "center";
      ctx.font = `700 ${titleSize}px "Playfair Display", Georgia, serif`;
      titleLines.push(...wrapText(ctx, title, maxTextWidth));
    }

    const bodyLines = bodyParas.length
      ? layoutRichText(ctx, bodyParas, bodySize, maxTextWidth)
      : [];

    const gap = title && bodyLines.length ? bodySize * 0.5 : 0;
    const blockH =
      titleLines.length * titleLineH + gap + bodyLines.length * bodyLineH;

    // Vertically center the whole title + body group in the template.
    const firstAscent = (title ? titleLineH : bodyLineH) * 0.8;
    let y = (h - blockH) / 2 + firstAscent;

    if (title) {
      ctx.textAlign = "center";
      ctx.fillStyle = o.accentTitle ? BRAND_RED : themeColor(theme);
      ctx.font = `700 ${titleSize}px "Playfair Display", Georgia, serif`;
      for (const line of titleLines) {
        ctx.fillText(line, w / 2, y);
        y += titleLineH;
      }
    }
    if (bodyLines.length) {
      y += gap;
      // Body stays in the theme color (not the accent) for readability.
      drawRichLines(
        ctx,
        bodyLines,
        bodySize,
        bodyLineH,
        w / 2,
        y,
        themeColor(theme),
      );
    }
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Render the template to a JPEG blob (offscreen) for download or sharing.
export async function renderTemplateToBlob(o: TemplateOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");

  await renderTemplate(canvas, o);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.95),
  );

  if (!blob) throw new Error("toBlob failed");

  return blob;
}
