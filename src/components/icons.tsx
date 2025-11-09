// Importa i file SVG come stringhe raw (contenuto SVG puro)
// In questo modo possiamo manipolare direttamente i path SVG
// e creare componenti React altamente personalizzabili.
import logoLacco from "../assets/icons/logo-lacco.svg?raw";
import logoSpotify from "../assets/icons/logo-spotify.svg?raw";
import logoInstagram from "../assets/icons/logo-instagram.svg?raw";
import logoTikTok from "../assets/icons/logo-tiktok.svg?raw";
import logoAppleMusic from "../assets/icons/logo-apple-music.svg?raw";
import logoYouTube from "../assets/icons/logo-youtube.svg?raw";

import { createIcon } from "@/utils/createIcon";
import { IconSvgProps } from "@/types";

/**
 * Estrae il tracciato principale (`<path>`) da un file SVG.
 *
 * Questa funzione consente di utilizzare solo la parte utile del file SVG,
 * evitando markup superfluo e garantendo un rendering pulito.
 *
 * @param svg - Contenuto SVG importato come stringa
 * @returns Il valore dell’attributo `d` del primo path trovato
 */
const extractPath = (svg: string): string => {
  const match = svg.match(/<path[^>]*d="([^"]*)"/);

  return match ? match[1] : "";
};

// ================== ESTRAZIONE DEI PATH ================== //
const logoPath = extractPath(logoLacco);
const spotifyPath = extractPath(logoSpotify);
const instagramPath = extractPath(logoInstagram);
const tikTokPath = extractPath(logoTikTok);
const appleMusicPath = extractPath(logoAppleMusic);
const youtubePath = extractPath(logoYouTube);

// ================== DEFINIZIONE ICONE ================== //

/**
 * Logo principale del progetto.
 *
 * SVG scalabile che utilizza il path estratto dal file sorgente.
 * Colore e dimensioni sono controllati via props, per adattarsi al tema corrente.
 */
export const Logo = ({ size = 100, height, ...props }: IconSvgProps) => (
  <svg
    fill="none"
    height={size || height}
    viewBox="0 0 3000 3000"
    width={size || height}
    {...props}
  >
    <path
      clipRule="evenodd"
      d={logoPath}
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

// Icone dei principali social e piattaforme musicali
// Generate dinamicamente tramite utility `createIcon()` per mantenere consistenza
export const InstagramIcon = createIcon(instagramPath);
export const TikTokIcon = createIcon(tikTokPath);
export const SpotifyIcon = createIcon(spotifyPath);
export const AppleMusicIcon = createIcon(appleMusicPath);
export const YouTubeIcon = createIcon(youtubePath);

/**
 * Icona “Luna” — utilizzata per la modalità scura (dark mode).
 *
 * Implementata come SVG inline per pieno controllo stilistico
 * e compatibilità con Tailwind (uso di `currentColor`).
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
 * Icona “Sole” — utilizzata per la modalità chiara (light mode).
 *
 * Anche qui `currentColor` consente di ereditare automaticamente
 * il colore del tema o del testo circostante.
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
 * Icone Chevron — utilizzate per il movimento orizzontale.
 *
 * Anche qui `currentColor` consente di ereditare automaticamente
 * il colore del tema o del testo circostante.
 */

export const ChevronLeftIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size || width}
    height={size || height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
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
    viewBox="0 0 24 24"
    width={size || width}
    height={size || height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);
