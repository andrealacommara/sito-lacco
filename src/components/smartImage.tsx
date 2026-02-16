// ========================== MAIN IMPORTS ========================== //
import { useEffect, type CSSProperties } from "react";
import { Image } from "@heroui/image";

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
 * SmartImage component
 * - Wraps HeroUI Image with lazy/eager loading and async decoding
 * - Adds optional high-priority preloading for above-the-fold images
 * - Resolves image imports with format fallbacks (avif/webp/jpeg)
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
  const resolvedSrc = resolveImageSource(src);
  const fallback = resolvedSrc ? new URL(resolvedSrc, import.meta.url).href : "";

  // Preload logic with backward compatibility
  useEffect(() => {
    if (!priority || !fallback) return;

    const link = document.createElement("link");

    link.rel = "preload";
    link.as = "image";
    link.href = fallback;

    if ("fetchPriority" in link) {
      (link as any).fetchPriority = "high";
    } else {
      const img = new window.Image();

      img.src = fallback;
      img.decoding = "async";
    }

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [priority, fallback]);

  return (
    <Image
      alt={alt}
      className={`w-full h-auto ${className || ""}`}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      height={height}
      isBlurred={isBlurred}
      loading={priority ? "eager" : "lazy"}
      sizes={responsiveSizes}
      src={fallback}
      style={{
        display: "block",
        ...style,
      }}
      width={width}
      onError={onError}
      onLoad={onLoad}
    />
  );
}
