// ========================== MAIN IMPORTS ========================== //
// Import core components and configurations needed for the main site layout.

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
      <header
        className="sticky top-0 z-50 border-b border-default-100"
        role="banner"
      >
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
        {/* Each Link opens in a new tab */}
        <button
          aria-label="Vai al profilo Spotify di Lacco"
          title="Spotify"
          onClick={() => window.open(siteConfig.links.spotify, "_blank")}
        >
          <SpotifyIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </button>
        <button
          aria-label="Vai al profilo Instagram di Lacco"
          title="Instagram"
          onClick={() => window.open(siteConfig.links.instagram, "_blank")}
        >
          <InstagramIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </button>
        <button
          aria-label="Vai al profilo TikTok di Lacco"
          title="TikTok"
          onClick={() => window.open(siteConfig.links.tiktok, "_blank")}
        >
          <TikTokIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </button>
        <button
          aria-label="Vai al profilo Apple Music di Lacco"
          title="Apple Music"
          onClick={() => window.open(siteConfig.links.appleMusic, "_blank")}
        >
          <AppleMusicIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </button>
        <button
          aria-label="Vai al canale YouTube di Lacco"
          title="YouTube"
          onClick={() => window.open(siteConfig.links.youtube, "_blank")}
        >
          <YouTubeIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </button>
      </footer>
    </div>
  );
}
