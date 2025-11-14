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
import SmartImage from "@/components/smartImage"; // Optimized image component with automatic loading

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
      <Card className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center p-2 md:p-4 gap-2 md:gap-4 mx-auto  w-full max-w-5xl">
        {/* Visual placeholder while the image is loading */}
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}

        {/* ========================== ARTIST IMAGE ========================== */}
        <div className="p-4 md:p-4 w-fit md:w-full items-center">
          <SmartImage
            isBlurred // Applies a slight blur effect
            priority
            alt="Lacco" // Alt text for accessibility
            className="item-center"
            sizes="400px"
            src={heroLacco} // Imported image
            style={{ aspectRatio: "1 / 1" }}
            width={400}
            onLoad={() => setIsLoaded(true)} // Removes skeleton when the image is fully loaded
          />
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
