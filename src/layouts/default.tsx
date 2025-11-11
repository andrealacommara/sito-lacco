// ========================== MAIN IMPORTS ========================== //
// Import core components and configurations needed for the main site layout.

import { Link } from "@heroui/link"; // HeroUI Link component for navigation and anchors
import { Provider } from "../provider.tsx"; // Context provider for HeroUI and Toast notifications
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

      {/* MAIN CONTENT - Wrapped in Provider for HeroUI */}
      <main role="main" className="container mx-auto max-w-7xl px-6 grow">
        <Provider>{children}</Provider>
      </main>

      {/* FOOTER - Bottom section with social links */}
      <footer
        role="contentinfo"
        className="w-full flex items-center justify-center py-8 gap-2"
      >
        {/* Each Link opens in a new tab (isExternal) */}
        <Link
          isExternal
          href={siteConfig.links.spotify}
          title="Spotify"
          aria-label="Vai al profilo Spotify di Lacco"
        >
          <SpotifyIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          href={siteConfig.links.instagram}
          title="Instagram"
          aria-label="Vai al profilo Instagram di Lacco"
        >
          <InstagramIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          href={siteConfig.links.tiktok}
          title="TikTok"
          aria-label="Vai al profilo TikTok di Lacco"
        >
          <TikTokIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          href={siteConfig.links.appleMusic}
          title="Apple Music"
          aria-label="Vai al profilo Apple Music di Lacco"
        >
          <AppleMusicIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link
          isExternal
          href={siteConfig.links.youtube}
          title="YouTube"
          aria-label="Vai al canale YouTube di Lacco"
        >
          <YouTubeIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
      </footer>
    </div>
  );
}
