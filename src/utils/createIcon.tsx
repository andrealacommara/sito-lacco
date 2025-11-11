// ========================== MAIN IMPORTS ========================== //
// Shared typing for SVG icons: includes size, color, and additional props.
import { IconSvgProps } from "@/types";

// ========================== FUNCTION: createIcon ========================== //
/**
 * Utility function to create reusable SVG icon components
 * from a given SVG path string.
 *
 * @param path - The `d` attribute defining the shape of the icon.
 * @param viewBox - The SVG viewBox area (default: "0 0 512 512").
 *
 * @returns A React functional component representing the generated icon.
 *
 * This function allows you to dynamically create custom icons
 * with configurable size and style through props.
 */

export const createIcon = (path: string, viewBox = "0 0 512 512") => {
  // Returns a React functional component representing the icon
  const IconComponent = ({
    size = 29,
    width,
    height,
    ...props
  }: IconSvgProps) => (
    <svg
      // Icon height — uses `size` by default, or `height` if provided
      height={size || height}
      // Defines the coordinate system for the icon path
      viewBox={viewBox}
      // Icon width — uses `size` by default, or `width` if provided
      width={size || width}
      // Allows passing additional props (className, style, etc.)
      {...props}
    >
      {/* SVG path — the visual core of the icon */}
      <path d={path} fill="currentColor" />
    </svg>
  );

  IconComponent.displayName = "IconComponent";

  return IconComponent;
};
