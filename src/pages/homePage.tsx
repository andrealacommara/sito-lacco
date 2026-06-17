// ========================== MAIN IMPORTS ========================== //
// Import layout, UI components, and assets used to build the homepage.

import { Card } from "@heroui/card"; // UI component for container
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async"; // Helmet for SEO and meta tags

import DefaultLayout from "@/layouts/default"; // General site layout (navbar + footer)
import SpotifyPlayer from "@/components/spotifyPlayer"; // Custom component for Spotify player
import { subtitle } from "@/components/primitives"; // Dynamic typography styles for titles and subtitles
import heroLacco from "@/assets/images/lacco/heroLacco.avif"; // Main artist image
import SmartImage, { resolveImageSource } from "@/components/smartImage"; // Optimized image component with automatic loading
import {
  AppleMusicIcon,
  InstagramIcon,
  SpotifyIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";
import { siteConfig } from "@/config/site";
import { catalog } from "@/config/catalog";
import { getUpcomingLiveEvents } from "@/config/liveEvents";
import Countdown from "@/components/countdown";
import PresaveButton from "@/components/presaveButton";
import LiveEventCard from "@/components/liveEventCard";

// ========================== HOME PAGE COMPONENT ========================== //
// Displays an introduction to the artist and includes a Spotify player.

export default function HomePage() {
  // State that tracks whether the image has been loaded.
  // Used to show a “skeleton” effect until the image is ready.
  const upcomingLive = getUpcomingLiveEvents();
  const presaveReleases = catalog.filter(
    (release) =>
      release.presaveMode === true && !!release.streamingLinks?.hyperfollow,
  );

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
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
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
        </motion.div>

        <div className="flex flex-col gap-5 text-center md:text-left">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="text-danger uppercase tracking-[0.2em] text-xs font-bold"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Pop · R&B · Hip-Hop
          </motion.span>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight font-display"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Per chi sente più di quanto riesca a dire.
          </motion.p>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-base lg:text-lg text-default-500 leading-relaxed font-display"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Lacco è un cantautore che trasforma emozioni, esperienze e frammenti
            di vita in storie da ascoltare.
          </motion.p>
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
            {presaveReleases.map((release) => (
              <Card
                key={release.slug}
                className="flex flex-col md:flex-row items-center justify-center p-6 md:p-8 gap-6 mx-auto w-full max-w-4xl"
              >
                {/* Blurred artwork backdrop — fixed dark scrim keeps text readable regardless of cover colors */}
                <img
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
                  src={resolveImageSource(release.artwork)}
                />
                <div className="absolute inset-0 bg-black/55" />

                <div className="relative shrink-0 flex items-center justify-center">
                  <SmartImage
                    isBlurred
                    priority
                    alt={`Cover di ${release.title}`}
                    src={release.artwork}
                    style={{ aspectRatio: "1/1", objectFit: "cover" }}
                    width={350}
                  />
                </div>
                <div className="relative flex flex-col items-center gap-4 text-center rounded-2xl border border-white/10 bg-black/35 p-4 md:p-6 backdrop-blur-md w-full md:w-xl">
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                      {release.title}
                    </h1>
                    <p className="text-white/70 text-sm tracking-widest font-medium">
                      {release.artist ?? "Lacco"}
                    </p>
                  </div>
                  <Countdown releaseDate={release.releaseDate} variant="dark" />
                  <PresaveButton
                    hyperfollowUrl={release.streamingLinks!.hyperfollow!}
                    releaseDate={release.releaseDate}
                  />
                </div>
              </Card>
            ))}
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
