// ========================== MAIN IMPORTS ========================== //
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
} from "react";

// ===================== SMART IMAGE COMPONENT ====================== //
export type ImageLikeImport =
  | string
  | string[]
  | {
      src?: string;
      img?: { src?: string };
      sources?: Record<string, string>;
      [key: string]: unknown;
    };

interface SmartImageProps {
  src: ImageLikeImport;
  alt: string;
  className?: string;
  isBlurred?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Canvas-based format support check.
 *
 * NOTE: this tests canvas ENCODING support, not image DECODING capability.
 * On most mobile browsers canvas.toDataURL("image/avif") returns "image/png"
 * even though the browser can perfectly decode AVIF files. The same applies
 * to WebP on older iOS Safari versions.
 *
 * A false-negative here is safe — resolveImageSource always falls back to
 * JPEG, which every browser supports.
 */
function supportsMime(mime: "image/avif" | "image/webp") {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const data = canvas.toDataURL(mime);

    return data.startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

function pickFromSrcset(srcset: string | undefined) {
  if (!srcset) return undefined;

  const parts = srcset.split(",").map((entry) => entry.trim());
  const last = parts[parts.length - 1];

  if (!last) return undefined;

  return last.split(/\s+/)[0];
}

function pickBestFromObject(obj: Record<string, unknown>) {
  const explicitSrc = typeof obj.src === "string" ? obj.src : undefined;
  const imgSrc =
    obj.img &&
    typeof obj.img === "object" &&
    typeof (obj.img as { src?: unknown }).src === "string"
      ? ((obj.img as { src?: string }).src ?? undefined)
      : undefined;

  if (imgSrc) return imgSrc;
  if (explicitSrc) return explicitSrc;

  const directAvif = typeof obj.avif === "string" ? obj.avif : undefined;
  const directWebp = typeof obj.webp === "string" ? obj.webp : undefined;
  const directJpeg =
    typeof obj.jpeg === "string"
      ? obj.jpeg
      : typeof obj.jpg === "string"
        ? obj.jpg
        : undefined;

  const sources =
    obj.sources && typeof obj.sources === "object"
      ? (obj.sources as Record<string, string>)
      : undefined;

  const avif = pickFromSrcset(sources?.avif ?? directAvif);
  const webp = pickFromSrcset(sources?.webp ?? directWebp);
  const jpeg = pickFromSrcset(sources?.jpeg ?? sources?.jpg ?? directJpeg);

  if (supportsMime("image/avif") && avif) return avif;
  if (supportsMime("image/webp") && webp) return webp;
  if (jpeg) return jpeg;
  if (webp) return webp;
  if (avif) return avif;

  return undefined;
}

export function resolveImageSource(src: ImageLikeImport): string {
  if (typeof src === "string") return src;

  if (Array.isArray(src)) {
    const avif = src.find((entry) => /\.avif($|\?)/i.test(entry));
    const webp = src.find((entry) => /\.webp($|\?)/i.test(entry));
    const jpeg = src.find((entry) => /\.(jpe?g)($|\?)/i.test(entry));

    if (supportsMime("image/avif") && avif) return avif;
    if (supportsMime("image/webp") && webp) return webp;

    return jpeg ?? webp ?? avif ?? src[0] ?? "";
  }

  return pickBestFromObject(src) ?? "";
}

/**
 * Per-format URL resolver per il `<picture>`.
 *
 * A differenza di resolveImageSource (che sceglie UN url via canvas, detection
 * inaffidabile su mobile e in prerender → spesso ripiega su webp/jpeg anche dove
 * l'AVIF è supportato), qui restituiamo TUTTI i formati disponibili e lasciamo
 * scegliere al browser tramite `<source type>` sul decode reale. `jpeg` è sempre
 * valorizzato: è l'`<img>` di fallback universale.
 */
export type ResolvedSources = {
  avif?: string;
  webp?: string;
  jpeg: string;
};

export function resolveImageSources(src: ImageLikeImport): ResolvedSources {
  if (typeof src === "string") return { jpeg: src };

  if (Array.isArray(src)) {
    const avif = src.find((entry) => /\.avif($|\?)/i.test(entry));
    const webp = src.find((entry) => /\.webp($|\?)/i.test(entry));
    const jpeg = src.find((entry) => /\.(jpe?g)($|\?)/i.test(entry));

    return { avif, webp, jpeg: jpeg ?? webp ?? avif ?? src[0] ?? "" };
  }

  const explicitSrc = typeof src.src === "string" ? src.src : undefined;
  const imgSrc =
    src.img &&
    typeof src.img === "object" &&
    typeof (src.img as { src?: unknown }).src === "string"
      ? (src.img as { src?: string }).src
      : undefined;

  const sources =
    src.sources && typeof src.sources === "object"
      ? (src.sources as Record<string, string>)
      : undefined;

  const directAvif = typeof src.avif === "string" ? src.avif : undefined;
  const directWebp = typeof src.webp === "string" ? src.webp : undefined;
  const directJpeg =
    typeof src.jpeg === "string"
      ? src.jpeg
      : typeof src.jpg === "string"
        ? src.jpg
        : undefined;

  const avif = pickFromSrcset(sources?.avif ?? directAvif);
  const webp = pickFromSrcset(sources?.webp ?? directWebp);
  const jpeg = pickFromSrcset(sources?.jpeg ?? sources?.jpg ?? directJpeg);

  return {
    avif,
    webp,
    jpeg: imgSrc ?? explicitSrc ?? jpeg ?? webp ?? avif ?? "",
  };
}

/**
 * SmartImage component
 *
 * Renders a native `<img>` with lazy/eager loading and async decoding.
 * Resolves image imports with format fallbacks (avif → webp → jpeg).
 *
 * Load/error are tracked via native listeners attached directly on the
 * DOM `<img>` via ref (handles the browser-cache "already complete" case too).
 *
 * When `isBlurred` is set, a subtle blurred copy is rendered behind the
 * artwork to recreate HeroUI v2's soft-glow effect.
 *
 * (HeroUI v3 dropped the Image component, so this no longer wraps it.)
 */
export default function SmartImage({
  src,
  alt,
  className,
  isBlurred = false,
  width,
  height,
  priority = false,
  sizes,
  style,
  onLoad,
  onError,
}: SmartImageProps) {
  const responsiveSizes = sizes ?? "(max-width: 768px) 100vw, 50vw";
  // Tutti i formati disponibili: il browser sceglie via `<source type>` (decode
  // reale), non più via canvas detection. `jpeg` è l'<img> di fallback.
  const pictureSources = resolveImageSources(src);
  const resolvedSrc = pictureSources.jpeg;
  const imgRef = useRef<HTMLImageElement>(null);

  // ── Native load / error listeners ──────────────────────────────────
  // Attach load/error listeners directly on the real DOM <img> via ref,
  // so onLoad/onError fire reliably (also handles the cached/complete case).
  useEffect(() => {
    const img = imgRef.current;

    if (!img || !resolvedSrc) return;

    let cancelled = false;
    const handleLoad = () => {
      if (!cancelled) onLoad?.();
    };
    const handleError = () => {
      if (!cancelled) onError?.();
    };

    const attachEvents = () => {
      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleError);
    };
    const detachEvents = () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };

    // For priority (eager) images, wait for `decode()` so onLoad fires only
    // once the image is fully decoded and ready to paint — this avoids the
    // partial-paint "vertical bands" seen while sliding the gallery before an
    // image has finished decoding. We gate on `priority` because decode()
    // would force lazy/off-screen images to download eagerly.
    if (priority && typeof img.decode === "function") {
      img
        .decode()
        .then(handleLoad)
        .catch(() => {
          // decode() rejects if the src changes mid-flight (cancelled) or on a
          // genuine error — fall back to native events to settle the state.
          if (cancelled) return;

          if (img.complete) {
            if (img.naturalWidth > 0) handleLoad();
            else handleError();
          } else {
            attachEvents();
          }
        });

      return () => {
        cancelled = true;
        detachEvents();
      };
    }

    // The image may already be complete (browser cache, very fast load).
    if (img.complete) {
      if (img.naturalWidth > 0) handleLoad();
      else handleError();

      return;
    }

    attachEvents();

    return () => {
      cancelled = true;
      detachEvents();
    };
  }, [resolvedSrc, onLoad, onError, priority]);

  // ── <picture>: offre avif/webp + <img> jpeg di fallback ────────────
  // Il preload above-the-fold non è più iniettato via JS (sceglieva il formato
  // sbagliato per via della canvas detection): l'hero finisce nell'HTML
  // pre-renderizzato e il preload-scanner lo trova subito via `<img
  // fetchpriority=high loading=eager>`, scegliendo l'AVIF in autonomia.
  const withPicture = (el: ReactElement) => {
    if (!pictureSources.avif && !pictureSources.webp) return el;

    return (
      <picture>
        {pictureSources.avif && (
          <source
            sizes={responsiveSizes}
            srcSet={pictureSources.avif}
            type="image/avif"
          />
        )}
        {pictureSources.webp && (
          <source
            sizes={responsiveSizes}
            srcSet={pictureSources.webp}
            type="image/webp"
          />
        )}
        {el}
      </picture>
    );
  };

  const img = withPicture(
    <img
      ref={imgRef}
      alt={alt}
      className={`h-auto ${(className || "").includes("rounded") ? "" : "rounded-[14px] "}${isBlurred ? "relative z-10 " : ""}${className || ""}`}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      height={height}
      loading={priority ? "eager" : "lazy"}
      sizes={responsiveSizes}
      src={resolvedSrc}
      style={{
        display: "block",
        // Come HeroUI v2: l'immagine assume la `width` indicata, capata al contenitore.
        width: width ? `${width}px` : "100%",
        maxWidth: "100%",
        ...style,
      }}
      width={width}
    />,
  );

  if (!isBlurred) return img;

  // Soft glow behind the artwork — replica l'effetto isBlurred di HeroUI v2
  // (blurredImg: scale-105 blur-lg saturate-150 opacity-30). Stesse `<source>`
  // del layer principale → il browser riusa lo stesso file scaricato (niente
  // doppio download).
  return (
    <span className="relative inline-block max-w-full align-top">
      {withPicture(
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full scale-105 rounded-[14px] object-cover opacity-30 blur-lg saturate-150"
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          src={resolvedSrc}
        />,
      )}
      {img}
    </span>
  );
}
