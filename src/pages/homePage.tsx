// ========================== MAIN IMPORTS ========================== //
// Import layout, UI components, and assets used to build the homepage.

import { Card } from "@heroui/card"; // UI component for container
import { Helmet } from "react-helmet-async"; // Helmet for SEO and meta tags

import DefaultLayout from "@/layouts/default"; // General site layout (navbar + footer)
import SpotifyPlayer from "@/components/spotifyPlayer"; // Custom component for Spotify player
import { subtitle } from "@/components/primitives"; // Dynamic typography styles for titles and subtitles
import heroLacco from "@/assets/images/lacco/heroLacco.avif"; // Main artist image
import SmartImage from "@/components/smartImage"; // Optimized image component with automatic loading
import {
  AppleMusicIcon,
  InstagramIcon,
  SpotifyIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";
import { siteConfig } from "@/config/site";
import { albums, isAlbum, singles } from "@/config/catalog";
import { getUpcomingLiveEvents } from "@/config/liveEvents";
import LiveEventCard from "@/components/liveEventCard";
import AlbumCard from "@/components/albumCard";
import SongCard from "@/components/songCard";

// ========================== HOME PAGE COMPONENT ========================== //
// Displays an introduction to the artist and includes a Spotify player.

export default function HomePage() {
  // State that tracks whether the image has been loaded.
  // Used to show a “skeleton” effect until the image is ready.
  const upcomingLive = getUpcomingLiveEvents();
  // Tutte le release in pre-save (album + singoli), in ordine cronologico di uscita.
  const presaveReleases = [...albums, ...singles]
    .filter(
      (release) =>
        release.presaveMode === true && !!release.streamingLinks?.hyperfollow,
    )
    .sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());

  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      <Helmet>
        <title>Lacco</title>
        <meta
          content="Lacco è un cantautore Pop, R&B e Hip-Hop. Per chi sente più di quanto riesca a dire. Ascolta la sua musica, scopri i live e rimani aggiornato."
          name="description"
        />
        <meta content="index, follow" name="robots" />
        <link href="https://lacco.it" rel="canonical" />

        {/* Open Graph */}
        <meta content="profile" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content="Lacco" property="og:title" />
        <meta
          content="Lacco è un cantautore Pop, R&B e Hip-Hop. Per chi sente più di quanto riesca a dire. Ascolta la sua musica, scopri i live e rimani aggiornato."
          property="og:description"
        />
        <meta content="https://lacco.it" property="og:url" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content="Lacco — Cantautore" property="og:image:alt" />
        <meta content="it_IT" property="og:locale" />

        {/* Twitter / X */}
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Lacco" name="twitter:title" />
        <meta
          content="Lacco è un cantautore Pop, R&B e Hip-Hop. Per chi sente più di quanto riesca a dire."
          name="twitter:description"
        />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />

        {/* Structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            name: "Lacco",
            genre: ["Pop", "R&B", "Hip-Hop"],
            url: "https://lacco.it",
            image: "https://lacco.it/og-image.jpg",
            sameAs: [
              siteConfig.links.spotify,
              siteConfig.links.tiktok,
              siteConfig.links.instagram,
              siteConfig.links.appleMusic,
              siteConfig.links.youtube,
            ],
          })}
        </script>
      </Helmet>

      {/* ========================== HERO SECTION ========================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto py-8 md:py-12 px-4">
        <div
          className="flex justify-center"
          style={{ animation: "fadeInScale 0.7s ease-out both" }}
        >
          <SmartImage
            isBlurred
            priority
            alt="Lacco"
            className="w-full h-full max-w-sm md:max-w-full"
            src={heroLacco}
            style={{ aspectRatio: "1 / 1" }}
            width={400}
          />
        </div>

        <div className="flex flex-col gap-5 text-center md:text-left">
          <span
            className="text-danger uppercase tracking-[0.2em] text-xs font-bold"
            style={{ animation: "fadeInUp 0.5s ease 0.2s both" }}
          >
            Pop · R&B · Hip-Hop
          </span>

          <p
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight font-display"
            style={{ animation: "fadeInUp 0.6s ease 0.35s both" }}
          >
            Per chi sente più di quanto riesca a dire.
          </p>

          <p
            className="text-base lg:text-lg text-default-500 leading-relaxed font-display"
            style={{ animation: "fadeInUp 0.5s ease 0.5s both" }}
          >
            Lacco è un cantautore che trasforma emozioni, esperienze e frammenti
            di vita in storie da ascoltare.
          </p>
        </div>
      </section>

      {/* ========================== LIVE SECTION ========================== */}

      {upcomingLive.length > 0 && (
        <>
          <div className="flex flex-row items-center justify-center py-4 md:py-4">
            <h2 className={subtitle()}>Lacco dal vivo</h2>
          </div>
          <div className="flex flex-col gap-8">
            {upcomingLive.map((event) => (
              <LiveEventCard key={event.slug} event={event} />
            ))}
          </div>
        </>
      )}

      {/* ========================== SPOTIFY PRE-SAVE SECTION ========================== */}

      {presaveReleases.length > 0 && (
        <>
          <div className="flex flex-row items-center justify-center py-4 md:py-4">
            <h2 className={subtitle()}>Pre-salva la prossima uscita</h2>
          </div>
          <div className="flex flex-col gap-8">
            {presaveReleases.map((release) =>
              isAlbum(release) ? (
                <AlbumCard key={release.slug} album={release} />
              ) : (
                <SongCard key={release.slug} single={release} />
              ),
            )}
          </div>
        </>
      )}
      {/* ========================== LINKS SECTION ========================== */}
      <div className="flex flex-row items-center justify-center py-4 md:py-4">
        <h2 className={subtitle()}>Link</h2>
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center mx-auto w-full max-w-5xl gap-4">
        <button
          className="w-full md:flex-1"
          onClick={() =>
            window.open(
              siteConfig.links.spotify,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <Card className="flex w-full flex-row items-center justify-center p-4 gap-2 hover:bg-danger hover:text-white">
            <SpotifyIcon />
            Spotify
          </Card>
        </button>
        <button
          className="w-full md:flex-1"
          onClick={() =>
            window.open(
              siteConfig.links.instagram,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <Card className="flex w-full flex-row items-center justify-center p-4 gap-2 hover:bg-danger hover:text-white">
            <InstagramIcon />
            Instagram
          </Card>
        </button>
        <button
          className="w-full md:flex-1"
          onClick={() =>
            window.open(
              siteConfig.links.tiktok,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <Card className="flex w-full flex-row items-center justify-center p-4 gap-2 hover:bg-danger hover:text-white">
            <TikTokIcon />
            TikTok
          </Card>
        </button>
        <button
          className="w-full md:flex-1"
          onClick={() =>
            window.open(
              siteConfig.links.appleMusic,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <Card className="flex w-full flex-row items-center justify-center p-4 gap-2 hover:bg-danger hover:text-white">
            <AppleMusicIcon />
            Music
          </Card>
        </button>
        <button
          className="w-full md:flex-1"
          onClick={() =>
            window.open(
              siteConfig.links.youtube,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <Card className="flex w-full flex-row items-center justify-center p-4 gap-2 hover:bg-danger hover:text-white">
            <YouTubeIcon />
            YouTube
          </Card>
        </button>
      </div>

      {/* ========================== SPOTIFY PLAYER SECTION ========================== */}
      <div className="flex flex-row items-center justify-center py-4 md:py-4">
        <h2 className={subtitle()}>Ascolta subito i suoi brani</h2>
      </div>

      {/* Embedded Spotify player via custom component */}
      <SpotifyPlayer
        size="large"
        srcPlayer="https://open.spotify.com/embed/playlist/2OmODLkWLB3F6sPHYQe07g?utm_source=generator"
      />
    </DefaultLayout>
  );
}
