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
  onError?: () => void;
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
  onError,
}: SmartImageProps) {
  const responsiveSizes = sizes ?? "(max-width: 768px) 100vw, 50vw";
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
