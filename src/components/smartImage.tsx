// ========================== MAIN IMPORTS ========================== //
import { useEffect, type CSSProperties } from "react";
import { Image } from "@heroui/image";

// ===================== SMART IMAGE COMPONENT ====================== //
interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  isBlurred?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
  onLoad?: () => void;
}

/**
 * SmartImage component
 * - Generates responsive AVIF + WebP variants via vite-imagetools
 * - Builds a <picture> for automatic format fallback
 * - Adds lazy/eager loading, async decoding, and automatic preload
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
}: SmartImageProps) {
  const responsiveSizes = sizes ?? "(max-width: 768px) 100vw, 50vw";
  // Responsive variants generated automatically
  const avifSet = new URL(
    `${src}?w=480;768;1200&format=avif&as=srcset`,
    import.meta.url,
  ).href;
  const webpSet = new URL(
    `${src}?w=480;768;1200&format=webp&as=srcset`,
    import.meta.url,
  ).href;
  const fallback = new URL(src, import.meta.url).href;

  // Preload logic with backward compatibility
  useEffect(() => {
    if (!priority) return;

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
    <picture>
      {/* Modern browsers: AVIF first */}
      <source sizes={responsiveSizes} srcSet={avifSet} type="image/avif" />
      {/* Fallback for browsers without AVIF */}
      <source sizes={responsiveSizes} srcSet={webpSet} type="image/webp" />

      {/* Final fallback: HeroUI Image component */}
      <Image
        alt={alt}
        className={className}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        height={height}
        isBlurred={isBlurred}
        loading={priority ? "eager" : "lazy"}
        sizes={responsiveSizes}
        src={fallback}
        style={style}
        width={width}
        onLoad={onLoad}
      />
    </picture>
  );
}
