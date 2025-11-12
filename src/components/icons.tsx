// ========================== MAIN IMPORTS ========================== //
// Core imports and utilities used to manage SVG icons, create React components,
// and define types. This includes raw SVG imports.
import logoLacco from "../assets/icons/logo-lacco.svg?raw";
import logoSpotify from "../assets/icons/logo-spotify.svg?raw";
import logoInstagram from "../assets/icons/logo-instagram.svg?raw";
import logoTikTok from "../assets/icons/logo-tiktok.svg?raw";
import logoAppleMusic from "../assets/icons/logo-apple-music.svg?raw";
import logoYouTube from "../assets/icons/logo-youtube.svg?raw";

import { createIcon } from "@/utils/createIcon"; // Icon creation helper
import { IconSvgProps } from "@/types"; // TypeScript props definitions

/**
 * Extracts the main `<path>` from an SVG file.
 *
 * This function allows using only the useful part of the SVG,
 * avoiding unnecessary markup and ensuring clean rendering.
 *
 * @param svg - Imported SVG content as a string
 * @returns The `d` attribute value of the first path found
 */
const extractPath = (svg: string): string => {
  const match = svg.match(/<path[^>]*d="([^"]*)"/);

  return match ? match[1] : "";
};

// ================== PATH EXTRACTION ================== //
const logoPath = extractPath(logoLacco);
const spotifyPath = extractPath(logoSpotify);
const instagramPath = extractPath(logoInstagram);
const tikTokPath = extractPath(logoTikTok);
const appleMusicPath = extractPath(logoAppleMusic);
const youtubePath = extractPath(logoYouTube);

// ================== ICON DEFINITIONS ================== //

/**
 * Main project logo.
 *
 * Scalable SVG using the extracted path from the source file.
 * Color and size are controlled via props to match the current theme.
 */
export const Logo = ({
  size,
  width = 100,
  height = 57,
  ...props
}: IconSvgProps) => (
  <svg
    className="pr-4"
    fill="none"
    height={size || height}
    viewBox="0 0 3000 1700"
    width={size || width}
    {...props}
  >
    <path
      clipRule="evenodd"
      d={logoPath}
      fill="currentColor"
      fillRule="evenodd"
      transform="translate(-365,-1038) scale(1.25)"
    />
  </svg>
);

// Main social and music platform icons
// Dynamically generated using the `createIcon()` utility for consistency
export const InstagramIcon = createIcon(instagramPath);
export const TikTokIcon = createIcon(tikTokPath);
export const SpotifyIcon = createIcon(spotifyPath);
export const AppleMusicIcon = createIcon(appleMusicPath);
export const YouTubeIcon = createIcon(youtubePath);

/**
 * “Moon” icon — used for dark mode.
 *
 * Implemented as inline SVG for full stylistic control
 * and Tailwind compatibility (uses `currentColor`).
 */
export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
      fill="currentColor"
    />
  </svg>
);

/**
 * “Sun” icon — used for light mode.
 *
 * `currentColor` inherits automatically from the theme or surrounding text color.
 */
export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g fill="currentColor">
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
      <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
    </g>
  </svg>
);

/**
 * Chevron icons — used for horizontal movement.
 *
 * `currentColor` inherits automatically from the theme or surrounding text color.
 */
export const ChevronLeftIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    fill="none"
    height={size || height}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.2"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ChevronRightIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    fill="none"
    height={size || height}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.2"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);
