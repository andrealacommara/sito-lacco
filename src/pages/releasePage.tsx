import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";

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
  transition: { duration: 0.6, ease: "easeOut", delay },
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
        <meta
          content={`https://lacco.it/${release.slug}`}
          property="og:url"
        />
        <meta content="music.song" property="og:type" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={release.ogImage} name="twitter:image" />
      </Helmet>

      {/* Background blur: cover artwork a tutto schermo */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 overflow-hidden"
      >
        {bgUrl && (
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            src={bgUrl}
            style={{ filter: "blur(48px) brightness(0.18)", transform: "scale(1.15)" }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Contenuto principale */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header: logo centrato cliccabile → home */}
        <header className="flex items-center justify-center px-5 pt-6 pb-2">
          <Link aria-label="Torna a lacco.it" to="/">
            <Logo
              className="text-white/80 transition-colors hover:text-white"
              height={40}
              width={70}
            />
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

function PresaveSection({
  release,
}: {
  release: ReturnType<typeof getSongBySlug> & object;
}) {
  return (
    <>
      {/* Hero centrato */}
      <main className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6 text-center">
        {/* Cover */}
        <motion.div
          {...fadeUp(0)}
          className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
        >
          <SmartImage
            priority
            alt={`Cover di ${release!.title}`}
            sizes="256px"
            src={release!.artwork}
            style={{ aspectRatio: "1/1", objectFit: "cover" }}
            width={256}
          />
        </motion.div>

        {/* Titolo + artista */}
        <motion.div {...fadeUp(0.1)} className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {release!.title}
          </h1>
          <p className="text-white/60 text-sm uppercase tracking-widest font-medium">
            Lacco
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div {...fadeUp(0.2)}>
          <Countdown releaseDate={release!.releaseDate} />
        </motion.div>

        {/* CTA pre-save */}
        <motion.div {...fadeUp(0.3)}>
          <PresaveButton
            fallbackUrl={
              release!.streamingLinks?.hyperfollow ?? release!.distrokidHyperfollow
            }
            presaveUrl={release!.distrokidHyperfollow}
          />
        </motion.div>

        {/* Divider + form iscrizione */}
        <motion.div
          {...fadeUp(0.4)}
          className="flex flex-col items-center gap-4 w-full max-w-xs mt-2"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-xs tracking-wide whitespace-nowrap">
              o avvisami quando esce
            </span>
            <div className="flex-1 h-px bg-white/20" />
          </div>
          <div className="w-full">
            <SubscribeForm releaseSlug={release.slug} source="presave_form" />
          </div>
        </motion.div>
      </main>
    </>
  );
}

function LiveSection({
  release,
}: {
  release: ReturnType<typeof getSongBySlug> & object;
}) {
  return (
    <div className="flex flex-col">
      {/* Hero live */}
      <main className="flex flex-col items-center justify-center px-5 py-8 gap-6 text-center">
        <motion.div
          {...fadeUp(0)}
          className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
        >
          <SmartImage
            priority
            alt={`Cover di ${release!.title}`}
            sizes="256px"
            src={release!.artwork}
            style={{ aspectRatio: "1/1", objectFit: "cover" }}
            width={256}
          />
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="flex flex-col gap-1">
          <p className="text-danger font-semibold text-lg tracking-wide">
            E fuori!
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {release!.title}
          </h1>
          <p className="text-white/60 text-sm uppercase tracking-widest font-medium">
            Lacco
          </p>
        </motion.div>

        {/* Streaming CTA */}
        <motion.div
          {...fadeUp(0.2)}
          className="flex flex-col sm:flex-row gap-3"
        >
          {release!.streamingLinks?.spotify && (
            <Button
              aria-label={`Ascolta ${release!.title} su Spotify`}
              className="font-semibold px-8"
              color="success"
              size="lg"
              onPress={() =>
                window.open(
                  release!.streamingLinks?.spotify,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <SpotifyIcon />
              {`Ascolta "${release!.title}"`}
            </Button>
          )}
          {release!.streamingLinks?.appleMusic && (
            <Button
              aria-label={`Ascolta ${release!.title} su Apple Music`}
              className="font-semibold"
              color="danger"
              size="lg"
              variant="flat"
              onPress={() =>
                window.open(
                  release!.streamingLinks?.appleMusic,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <AppleMusicIcon />
              Apple Music
            </Button>
          )}
          {!release!.streamingLinks?.spotify &&
            release!.streamingLinks?.hyperfollow && (
              <Button
                aria-label="Ascolta ora"
                className="font-semibold px-8"
                color="success"
                size="lg"
                onPress={() =>
                  window.open(
                    release!.streamingLinks?.hyperfollow,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <SpotifyIcon />
                {`Ascolta "${release!.title}"`}
              </Button>
            )}
        </motion.div>
      </main>

      {/* Sezione catalogo */}
      <section className="bg-background/80 backdrop-blur-md border-t border-white/10 py-10 px-4">
        <h2 className="text-center text-white/80 font-semibold text-lg mb-2">
          Intanto, ascolta i miei brani
        </h2>
        <SongCarousel />
      </section>

      {/* Form newsletter */}
      <section className="bg-background/80 backdrop-blur-md border-t border-white/10 py-10 px-4">
        <div className="max-w-xs mx-auto text-center flex flex-col gap-4">
          <h2 className="text-white/80 font-semibold text-lg">
            Iscriviti per le prossime uscite
          </h2>
          <SubscribeForm source="newsletter_form" />
        </div>
      </section>
    </div>
  );
}
