import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";
import { Provider } from "../provider.tsx";
import {
  AppleMusicIcon,
  InstagramIcon,
  SpotifyIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons.tsx";
import { siteConfig } from "@/config/site.ts";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow">
        <Provider>{children}</Provider>
      </main>
      <footer className="w-full flex items-center justify-center py-8 gap-2">
        <Link isExternal href={siteConfig.links.spotify} title="Spotify">
          <SpotifyIcon className="text-default-500" />
        </Link>
        <Link isExternal href={siteConfig.links.instagram} title="Instagram">
          <InstagramIcon className="text-default-500" />
        </Link>
        <Link isExternal href={siteConfig.links.tiktok} title="TikTok">
          <TikTokIcon className="text-default-500" />
        </Link>
        <Link isExternal href={siteConfig.links.appleMusic} title="Apple Music">
          <AppleMusicIcon className="text-default-500" />
        </Link>
        <Link isExternal href={siteConfig.links.youtube} title="YouTube">
          <YouTubeIcon className="text-default-500" />
        </Link>
      </footer>
    </div>
  );
}
