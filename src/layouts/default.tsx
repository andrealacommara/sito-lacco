// ========================== MAIN IMPORTS ========================== //
// Import core components and configurations needed for the main site layout.

import { Link } from "@heroui/link"; // HeroUI Link component for navigation and anchors

import { Navbar } from "@/components/navbar"; // Top navigation bar
import {
  AppleMusicIcon,
  InstagramIcon,
  SpotifyIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons.tsx"; // Custom icons for social and music platforms
import { siteConfig } from "@/config/site.ts"; // Global site configuration (links, menu, etc.)

// ========================== LAYOUT COMPONENT ========================== //
// Defines the overall page structure:
// - Navbar at the top
// - Main content (injected via `children`)
// - Footer with social links

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode; // Dynamic content of the page
}) {
  return (
    <div className="relative flex flex-col justify-between min-h-screen">
      {/* NAVBAR - Top section */}
      <header role="banner">
        <Navbar />
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto max-w-7xl px-6 grow" role="main">
        {children}
      </main>

      {/* FOOTER - Bottom section with social links */}
      <footer
        className="w-full flex items-center justify-center py-8 gap-2"
        role="contentinfo"
      >
        {/* Each Link opens in a new tab (isExternal) */}
        <Link
          isExternal
          aria-label="Vai al profilo Spotify di Lacco"
          href={siteConfig.links.spotify}
          title="Spotify"
        >
          <SpotifyIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          aria-label="Vai al profilo Instagram di Lacco"
          href={siteConfig.links.instagram}
          title="Instagram"
        >
          <InstagramIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          aria-label="Vai al profilo TikTok di Lacco"
          href={siteConfig.links.tiktok}
          title="TikTok"
        >
          <TikTokIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          aria-label="Vai al profilo Apple Music di Lacco"
          href={siteConfig.links.appleMusic}
          title="Apple Music"
        >
          <AppleMusicIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          aria-label="Vai al canale YouTube di Lacco"
          href={siteConfig.links.youtube}
          title="YouTube"
        >
          <YouTubeIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
      </footer>
    </div>
  );
}
