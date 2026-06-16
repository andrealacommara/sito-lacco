import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

import { getSongBySlug } from "@/config/catalog";
import { resolveImageSource } from "@/components/smartImage";
import SmartImage from "@/components/smartImage";
import Countdown from "@/components/countdown";
import PresaveButton from "@/components/presaveButton";
import SongCarousel from "@/components/songCarousel";
import SubscribeForm from "@/components/subscribeForm";
import { AppleMusicIcon, Logo, SpotifyIcon } from "@/components/icons";
import NotFoundPage from "@/pages/notFoundPage";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

export default function ReleasePage() {
  const { slug } = useParams<{ slug: string }>();
  const release = slug ? getSongBySlug(slug) : undefined;

  if (!release) return <NotFoundPage />;

  const bgUrl = resolveImageSource(release.artwork);

  return (
    <>
      <Helmet>
        <title>{release.title} | Lacco</title>
        <meta content={release.description} name="description" />
        <meta content="index, follow" name="robots" />
        <meta content={`${release.title} — Lacco`} property="og:title" />
        <meta content={release.description} property="og:description" />
        <meta content={release.ogImage} property="og:image" />
        <meta content={`https://lacco.it/${release.slug}`} property="og:url" />
        <meta content="music.song" property="og:type" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={release.ogImage} name="twitter:image" />
      </Helmet>

      {/* Background blur: cover artwork a tutto schermo */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
        {bgUrl && (
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            src={bgUrl}
            style={{
              filter: "blur(40px) brightness(0.35)",
              transform: "scale(1.15)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Contenuto principale */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header: logo centrato cliccabile → home */}
        <header className="flex items-center justify-center px-5 pt-6 pb-2">
          <Link
            aria-label="Torna a lacco.it"
            className="flex items-center text-white transition-colors duration-300 hover:text-danger"
            to="/"
          >
            <Logo />
          </Link>
        </header>

        {release.presaveMode ? (
          <PresaveSection release={release} />
        ) : (
          <LiveSection release={release} />
        )}
      </div>
    </>
  );
}

type SectionProps = {
  release: NonNullable<ReturnType<typeof getSongBySlug>>;
};

function PresaveSection({ release }: SectionProps) {
  return (
    <main className="flex flex-col items-center flex-1 px-6 py-8">
      <Card className="bg-white shadow-2xl shadow-black/40 w-full max-w-md overflow-hidden">
        <CardBody className="flex flex-col items-center gap-6 text-center p-8">
          {/* Cover */}
          <motion.div
            {...fadeUp(0)}
            className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
          >
            <SmartImage
              priority
              alt={`Cover di ${release.title}`}
              sizes="320px"
              src={release.artwork}
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
              width={320}
            />
          </motion.div>

          {/* Titolo + artista */}
          <motion.div {...fadeUp(0.1)} className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              {release.title}
            </h1>
            <p className="text-gray-500 text-sm tracking-widest font-medium">
              {release.artist ?? "Lacco"}
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div {...fadeUp(0.2)}>
            <Countdown releaseDate={release.releaseDate} variant="light" />
          </motion.div>

          {/* CTA pre-save */}
          {release.streamingLinks?.hyperfollow && (
            <motion.div {...fadeUp(0.3)}>
              <PresaveButton
                hyperfollowUrl={release.streamingLinks.hyperfollow}
                releaseDate={release.releaseDate}
              />
            </motion.div>
          )}

          {/* Divider + form iscrizione */}
          <motion.div
            {...fadeUp(0.4)}
            className="flex flex-col items-center gap-4 w-full mt-2"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs tracking-wide whitespace-nowrap">
                o avvisami quando esce
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="w-full">
              <SubscribeForm releaseSlug={release.slug} source="presave_form" />
            </div>
          </motion.div>
        </CardBody>
      </Card>
    </main>
  );
}

function LiveSection({ release }: SectionProps) {
  return (
    <div className="flex flex-col gap-4 px-6 py-8">
      {/* Hero card */}
      <Card className="bg-white shadow-2xl shadow-black/40 mx-auto w-full max-w-md overflow-hidden">
        <CardBody className="flex flex-col items-center gap-6 text-center p-8">
          <motion.div
            {...fadeUp(0)}
            className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
          >
            <SmartImage
              priority
              alt={`Cover di ${release.title}`}
              sizes="320px"
              src={release.artwork}
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
              width={320}
            />
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="flex flex-col gap-1">
            <p className="text-danger font-semibold text-lg tracking-wide">
              Ascoltalo ora
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              {release.title}
            </h1>
            <p className="text-gray-500 text-sm tracking-widest font-medium">
              {release.artist ?? "Lacco"}
            </p>
          </motion.div>

          {/* Streaming CTA — verticale, larghezza piena, nome store */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3 w-full">
            {release.streamingLinks?.spotify && (
              <Button
                fullWidth
                aria-label={`Ascolta su Spotify`}
                className="font-semibold"
                color="success"
                size="lg"
                onPress={() =>
                  window.open(
                    release.streamingLinks?.spotify,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <SpotifyIcon />
                Spotify
              </Button>
            )}
            {release.streamingLinks?.appleMusic && (
              <Button
                fullWidth
                aria-label={`Ascolta su Apple Music`}
                className="font-semibold"
                color="danger"
                size="lg"
                variant="flat"
                onPress={() =>
                  window.open(
                    release.streamingLinks?.appleMusic,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <AppleMusicIcon />
                Apple Music
              </Button>
            )}
            {!release.streamingLinks?.spotify &&
              release.streamingLinks?.hyperfollow && (
                <Button
                  fullWidth
                  aria-label="Ascolta ora"
                  className="font-semibold"
                  color="success"
                  size="lg"
                  onPress={() =>
                    window.open(
                      release.streamingLinks?.hyperfollow,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <SpotifyIcon />
                  Spotify
                </Button>
              )}
          </motion.div>
        </CardBody>
      </Card>

      {/* Carousel */}
      <div className="py-6">
        <h2 className="text-center text-white font-semibold text-lg mb-4">
          Scopri gli altri miei brani
        </h2>
        <SongCarousel />
      </div>
    </div>
  );
}
