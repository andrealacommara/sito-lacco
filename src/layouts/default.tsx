// ========================== IMPORT DIPENDENZE PRINCIPALI ========================== //
// Importa i componenti e le configurazioni necessari per il layout principale del sito.

import { Link } from "@heroui/link"; // Componente Link fornito da HeroUI per gestire link e ancore

import { Provider } from "../provider.tsx"; // Provider che gestisce il contesto HeroUI e Toast

import { Navbar } from "@/components/navbar"; // Barra di navigazione superiore
import {
  AppleMusicIcon,
  InstagramIcon,
  SpotifyIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons.tsx"; // Icone personalizzate dei vari social e piattaforme musicali
import { siteConfig } from "@/config/site.ts"; // Configurazione globale del sito (link, menu, ecc.)

// ========================== COMPONENTE DI LAYOUT ========================== //
// Questo componente definisce la struttura generale di ogni pagina del sito:
// - Navbar in alto
// - Contenuto centrale (iniettato come `children`)
// - Footer con i link social

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode; // Contenuto dinamico della pagina
}) {
  return (
    <div className="relative flex flex-col justify-between min-h-screen">
      {/* NAVBAR - Sezione superiore del layout */}
      <header role="banner">
        <Navbar />

      </header>
      {/* CONTENUTO PRINCIPALE - Avvolto dal Provider per gestire HeroUI */}
      <main role="main" className="container mx-auto max-w-7xl px-6 grow">
        <Provider>{children}</Provider>
      </main>

      {/* FOOTER - Sezione inferiore con i link ai social */}
      <footer role="contentinfo" className="w-full flex items-center justify-center py-8 gap-2">
        {/* Ogni Link è esterno (isExternal) e apre in una nuova scheda */}
        <Link isExternal href={siteConfig.links.spotify} title="Spotify" aria-label="Vai al profilo Spotify di Lacco">
          <SpotifyIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link isExternal href={siteConfig.links.instagram} title="Instagram" aria-label="Vai al profilo Instagram di Lacco">
          <InstagramIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link isExternal href={siteConfig.links.tiktok} title="TikTok" aria-label="Vai al profilo TikTok di Lacco">
          <TikTokIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link isExternal href={siteConfig.links.appleMusic} title="Apple Music" aria-label="Vai al profilo Apple Music di Lacco">
          <AppleMusicIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
        <Link isExternal href={siteConfig.links.youtube} title="YouTube" aria-label="Vai al canale YouTube di Lacco">
          <YouTubeIcon className="text-default-500 transition-colors duration-300 hover:text-danger dark:hover:text-danger" />
        </Link>
      </footer>
    </div>
  );
}
