// ========================== MAIN IMPORTS ========================== //
// Import core components and configurations needed for the main site layout.

import { Link } from "react-router-dom";

import { Navbar } from "@/components/navbar";
import { BackgroundPattern } from "@/components/backgroundPattern";
import {
  AppleMusicIcon,
  InstagramIcon,
  SpotifyIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons.tsx";
import { siteConfig } from "@/config/site.ts";

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
      <BackgroundPattern />
      {/* NAVBAR - Top section */}
      <header
        className="relative md:sticky md:top-0 z-50 border-b border-default-100"
        role="banner"
      >
        <Navbar />
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto max-w-7xl px-6 grow" role="main">
        {children}
      </main>

      {/* FOOTER - Bottom section with newsletter link and social icons */}
      <footer
        className="w-full flex flex-col items-center justify-center py-8 gap-4"
        role="contentinfo"
      >
        <Link
          className="text-xs text-default-500 hover:text-default-700 transition-colors underline underline-offset-2"
          to="/newsletter"
        >
          Iscriviti alla newsletter
        </Link>
        <div className="flex items-center gap-2">
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
        </div>
      </footer>
    </div>
  );
}
