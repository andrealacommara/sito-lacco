// ========================== MAIN IMPORTS ========================== //
// Import layout, UI components, and assets used to build the homepage.

import { Card } from "@heroui/card"; // UI component for container
import { Skeleton } from "@heroui/skeleton"; // Loading placeholder
import { useState } from "react"; // React hook for local state management
import { Helmet } from "react-helmet-async"; // Helmet for SEO and meta tags

import DefaultLayout from "@/layouts/default"; // General site layout (navbar + footer)
import SpotifyPlayer from "@/components/spotifyPlayer"; // Custom component for Spotify player
import { subtitle, title } from "@/components/primitives"; // Dynamic typography styles for titles and subtitles
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
import Countdown from "@/components/countdown";
import PresaveButton from "@/components/presaveButton";

// ========================== HOME PAGE COMPONENT ========================== //
// Displays an introduction to the artist and includes a Spotify player.

export default function HomePage() {
  // State that tracks whether the image has been loaded.
  // Used to show a “skeleton” effect until the image is ready.
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      {/* Dynamic title and description for Google SEO */}
      <Helmet>
        <title>Lacco | Home</title>
        <meta
          content="Scopri Lacco: R&B e hip-hop in un viaggio introspettivo alla scoperta di sé."
          name="description"
        />
        <meta content="index, follow" name="robots" />
      </Helmet>

      {/* ========================== INTRO SECTION ========================== */}
      <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Scopri di più su Lacco</h1>
      </section>

      {/* ========================== MAIN CARD ========================== */}
      {/* Contains the artist image and description */}
      <Card className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center p-2 md:p-4 mx-auto  w-full max-w-5xl">
        {/* Visual placeholder while the image is loading */}
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}

        {/* ========================== ARTIST IMAGE ========================== */}
        <div className="p-4 md:p-4 shrink-0 flex items-center justify-center">
          <div className="w-fit md:w-full items-center">
            <SmartImage
              isBlurred // Applies a slight blur effect
              priority
              alt="Lacco" // Alt text for accessibility
              className="w-full h-full"
              sizes="400px"
              src={heroLacco} // Imported image
              style={{ aspectRatio: "1 / 1" }}
              onError={() => setIsLoaded(true)} // Avoid stuck skeleton if image fails to decode
              onLoad={() => setIsLoaded(true)} // Removes skeleton when the image is fully loaded
            />
          </div>
        </div>

        {/* ========================== ARTIST DESCRIPTION ========================== */}
        <div className="p-2 md:p-4">
          <h1 className={subtitle()}>
            Lacco unisce R&B e sonorità hip-hop in un viaggio introspettivo alla
            scoperta di sé.
            <br />
            Racconta in musica ciò che è solito rimanere nascosto, in assordante
            silenzio, dentro ognuno di noi.
          </h1>
        </div>
      </Card>

      {/* ========================== SPOTIFY PRE-SAVE SECTION ========================== */}

      {catalog.map((release) =>
        release.presaveMode === true && release.streamingLinks?.hyperfollow ? (
          <div key={release.slug}>
            <div className="flex flex-row items-center justify-center py-4 md:py-4">
              <h2 className={subtitle()}>Pre-salva la prossima uscita</h2>
            </div>
            <Card className="flex flex-col md:flex-row items-center justify-center p-6 md:p-8 gap-6 mx-auto w-full max-w-5xl md:max-w-fit">
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
                  sizes="320px"
                  src={release.artwork}
                  style={{ aspectRatio: "1/1", objectFit: "cover" }}
                  width={320}
                />
              </div>
              <div className="relative flex flex-col items-center gap-4 text-center rounded-2xl border border-white/10 bg-black/35 p-4 md:p-6 backdrop-blur-md">
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
                  hyperfollowUrl={release.streamingLinks.hyperfollow}
                  releaseDate={release.releaseDate}
                />
              </div>
            </Card>
          </div>
        ) : null,
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
