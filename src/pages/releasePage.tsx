import type { Single, Album } from "@/config/catalog";

import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button, Card, CardContent } from "@heroui/react";

import {
  getAlbumForSong,
  getAlbumTracks,
  getReleaseBySlug,
  isAlbum,
} from "@/config/catalog";
import { ARTIST_ID, artistSameAs, buildBreadcrumbJsonLd } from "@/config/site";
import { resolveImageSource } from "@/components/smartImage";
import SmartImage from "@/components/smartImage";
import Countdown from "@/components/countdown";
import PresaveButton from "@/components/presaveButton";
import ReleaseDateBadge from "@/components/releaseDateBadge";
import SongCarousel from "@/components/songCarousel";
import SubscribeForm from "@/components/subscribeForm";
import {
  AmazonMusicIcon,
  AppleMusicIcon,
  Logo,
  SpotifyIcon,
  YouTubeMusicIcon,
} from "@/components/icons";
import { useThemeColor } from "@/lib/themeColor";
import NotFoundPage from "@/pages/notFoundPage";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

// Artista come entità coerente con il MusicGroup dichiarato in index.html / home.
// Lo stesso @id + sameAs su ogni pagina permette a Google di consolidare tutte le
// dichiarazioni in un'unica entità verificata (evita la confusione con omonimi).
const ARTIST_ENTITY = {
  "@type": "MusicGroup",
  "@id": ARTIST_ID,
  name: "Lacco",
  url: "https://www.lacco.it",
  sameAs: artistSameAs,
};

// Structured data Schema.org: MusicAlbum (EP/Album, con tracklist) o
// MusicRecording (singolo). Migliora i rich results e l'indicizzazione del brano.
function buildReleaseJsonLd(
  release: Album | Single,
  imageUrl: string,
  description: string,
) {
  const url = `https://www.lacco.it/${release.slug}`;
  const datePublished = release.releaseDate.toISOString().slice(0, 10);

  // sameAs verso la traccia/album esatti sulle piattaforme: lega la pagina alla
  // release ufficiale e riduce la misattribuzione dei brani da parte di Google.
  const platformSameAs = [
    release.streamingLinks?.spotify,
    release.streamingLinks?.appleMusic,
    release.streamingLinks?.amazonMusic,
    release.streamingLinks?.youtubeMusic,
  ].filter(Boolean);

  if (isAlbum(release)) {
    const tracks = getAlbumTracks(release);

    return {
      "@context": "https://schema.org",
      "@type": "MusicAlbum",
      name: release.title,
      url,
      image: imageUrl,
      description,
      inLanguage: "it",
      datePublished,
      albumReleaseType: release.kind === "EP" ? "EPRelease" : "AlbumRelease",
      byArtist: ARTIST_ENTITY,
      ...(platformSameAs.length ? { sameAs: platformSameAs } : {}),
      numTracks: tracks.length,
      track: tracks.map((song, i) => ({
        "@type": "MusicRecording",
        position: i + 1,
        name: song.title,
        url: `https://www.lacco.it/${song.slug}`,
      })),
    };
  }

  const album = getAlbumForSong(release.slug);

  return {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: release.title,
    url,
    image: imageUrl,
    description,
    inLanguage: "it",
    datePublished,
    byArtist: ARTIST_ENTITY,
    ...(platformSameAs.length ? { sameAs: platformSameAs } : {}),
    ...(album
      ? {
          inAlbum: {
            "@type": "MusicAlbum",
            name: album.title,
            url: `https://www.lacco.it/${album.slug}`,
          },
        }
      : {}),
  };
}

export default function ReleasePage() {
  const { slug } = useParams<{ slug: string }>();
  const release = slug ? getReleaseBySlug(slug) : undefined;

  // Pagina immersiva sempre scura: barra del browser nera a prescindere dal tema.
  useThemeColor(release ? "#000000" : null);

  if (!release) return <NotFoundPage />;

  const bgUrl = resolveImageSource(release.artwork);
  const metaDescription = release.description.replace(/\n/g, " ").trim();
  const ogImageUrl = `https://www.lacco.it${release.ogImage}`;
  const ogType = isAlbum(release) ? "music.album" : "music.song";
  const canonicalUrl = `https://www.lacco.it/${release.slug}`;
  const jsonLd = buildReleaseJsonLd(release, ogImageUrl, metaDescription);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Musica", path: "/musica" },
    { name: release.title },
  ]);

  return (
    <>
      <Helmet>
        <title>{`${release.title} | Lacco`}</title>
        <meta content={metaDescription} name="description" />
        <meta content="index, follow" name="robots" />
        <link href={canonicalUrl} rel="canonical" />
        <link href={canonicalUrl} hrefLang="it" rel="alternate" />
        <link href={canonicalUrl} hrefLang="x-default" rel="alternate" />
        <meta content={ogType} property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content={`${release.title} | Lacco`} property="og:title" />
        <meta content={metaDescription} property="og:description" />
        <meta content={ogImageUrl} property="og:image" />
        <meta content={`${release.title} — Lacco`} property="og:image:alt" />
        <meta content="1200" property="og:image:width" />
        <meta content="630" property="og:image:height" />
        <meta content="image/jpeg" property="og:image:type" />
        <meta content={canonicalUrl} property="og:url" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={`${release.title} | Lacco`} name="twitter:title" />
        <meta content={metaDescription} name="twitter:description" />
        <meta content={ogImageUrl} name="twitter:image" />
        <meta content={`${release.title} — Lacco`} name="twitter:image:alt" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
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

        {isAlbum(release) ? (
          release.presaveMode ? (
            <AlbumPresaveSection album={release} />
          ) : (
            <AlbumSection album={release} />
          )
        ) : release.presaveMode ? (
          <PresaveSection release={release} />
        ) : (
          <LiveSection release={release} />
        )}
      </div>
    </>
  );
}

type SectionProps = {
  release: Single;
};

// Badge "da «album»" mostrato sui singoli che appartengono a un EP/album.
function AlbumBadge({ songSlug }: { songSlug: string }) {
  const album = getAlbumForSong(songSlug);

  if (!album) return null;

  return (
    <Link
      className="text-danger text-sm font-medium tracking-wide hover:underline"
      to={`/${album.slug}`}
    >
      da «{album.title}»
    </Link>
  );
}

function PresaveSection({ release }: SectionProps) {
  return (
    <main className="flex flex-col items-center flex-1 px-6 py-8">
      <Card
        className="bg-white shadow-2xl shadow-black/40 w-full max-w-md overflow-hidden"
        data-theme="light"
      >
        <CardContent className="flex flex-col items-center gap-6 text-center p-8">
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
            <AlbumBadge songSlug={release.slug} />
          </motion.div>

          {/* Data di uscita */}
          <motion.div {...fadeUp(0.2)}>
            <ReleaseDateBadge date={release.releaseDate} variant="light" />
          </motion.div>

          {/* Countdown */}
          <motion.div {...fadeUp(0.25)}>
            <Countdown releaseDate={release.releaseDate} variant="light" />
          </motion.div>

          {/* CTA pre-save */}
          {release.streamingLinks?.hyperfollow && (
            <motion.div {...fadeUp(0.3)} className="w-full flex justify-center">
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
              <span className="text-gray-500 text-xs tracking-wide whitespace-nowrap">
                o avvisami quando esce
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="w-full">
              <SubscribeForm releaseSlug={release.slug} source="presave_form" />
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </main>
  );
}

function LiveSection({ release }: SectionProps) {
  return (
    <div className="flex flex-col gap-4 px-6 py-8">
      {/* Hero card */}
      <Card
        className="bg-white shadow-2xl shadow-black/40 mx-auto w-full max-w-md overflow-hidden"
        data-theme="light"
      >
        <CardContent className="flex flex-col items-center gap-6 text-center p-8">
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
            <AlbumBadge songSlug={release.slug} />
          </motion.div>

          {/* Streaming CTA — verticale, larghezza piena, nome store */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3 w-full">
            {release.streamingLinks?.spotify && (
              <Button
                fullWidth
                aria-label={`Ascolta su Spotify`}
                className="rounded-xl font-semibold bg-success text-white hover:bg-success/90"
                size="lg"
                variant="primary"
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
                className="rounded-xl font-semibold"
                size="lg"
                variant="danger"
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
            {release.streamingLinks?.amazonMusic && (
              <Button
                fullWidth
                aria-label={`Ascolta su Amazon Music`}
                className="rounded-xl font-semibold bg-[#00A8E1] text-white hover:bg-[#00A8E1]/90"
                size="lg"
                variant="primary"
                onPress={() =>
                  window.open(
                    release.streamingLinks?.amazonMusic,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <AmazonMusicIcon />
                Amazon Music
              </Button>
            )}
            {release.streamingLinks?.youtubeMusic && (
              <Button
                fullWidth
                aria-label={`Ascolta su YouTube Music`}
                className="rounded-xl font-semibold bg-[#FF0000] text-white hover:bg-[#FF0000]/90"
                size="lg"
                variant="primary"
                onPress={() =>
                  window.open(
                    release.streamingLinks?.youtubeMusic,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <YouTubeMusicIcon />
                YouTube Music
              </Button>
            )}
            {!release.streamingLinks?.spotify &&
              release.streamingLinks?.hyperfollow && (
                <Button
                  fullWidth
                  aria-label="Ascolta ora"
                  className="rounded-xl font-semibold bg-success text-white hover:bg-success/90"
                  size="lg"
                  variant="primary"
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
        </CardContent>
      </Card>

      {/* Carousel */}
      <div className="py-6">
        <h2 className="text-center text-white font-semibold text-lg mb-4">
          Scopri gli altri miei brani
        </h2>
        <SongCarousel excludeSlug={release.slug} />
      </div>
    </div>
  );
}

function AlbumSection({ album }: { album: Album }) {
  const tracks = getAlbumTracks(album);

  return (
    <div className="flex flex-col gap-4 px-6 py-8">
      {/* Hero card */}
      <Card
        className="bg-white shadow-2xl shadow-black/40 mx-auto w-full max-w-md overflow-hidden"
        data-theme="light"
      >
        <CardContent className="flex flex-col items-center gap-6 text-center p-8">
          <motion.div
            {...fadeUp(0)}
            className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
          >
            <SmartImage
              priority
              alt={album.alt}
              sizes="320px"
              src={album.artwork}
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
              width={320}
            />
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="flex flex-col gap-1">
            <p className="text-danger font-semibold text-sm tracking-widest uppercase">
              {album.kind} · {album.year}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              {album.title}
            </h1>
            <p className="text-gray-500 text-sm tracking-widest font-medium">
              Lacco
            </p>
          </motion.div>

          {/* Streaming CTA */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3 w-full">
            {album.streamingLinks?.spotify && (
              <Button
                fullWidth
                aria-label="Ascolta su Spotify"
                className="rounded-xl font-semibold bg-success text-white hover:bg-success/90"
                size="lg"
                variant="primary"
                onPress={() =>
                  window.open(
                    album.streamingLinks?.spotify,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <SpotifyIcon />
                Spotify
              </Button>
            )}
            {album.streamingLinks?.appleMusic && (
              <Button
                fullWidth
                aria-label="Ascolta su Apple Music"
                className="rounded-xl font-semibold"
                size="lg"
                variant="danger"
                onPress={() =>
                  window.open(
                    album.streamingLinks?.appleMusic,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <AppleMusicIcon />
                Apple Music
              </Button>
            )}
            {album.streamingLinks?.amazonMusic && (
              <Button
                fullWidth
                aria-label="Ascolta su Amazon Music"
                className="rounded-xl font-semibold bg-[#00A8E1] text-white hover:bg-[#00A8E1]/90"
                size="lg"
                variant="primary"
                onPress={() =>
                  window.open(
                    album.streamingLinks?.amazonMusic,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <AmazonMusicIcon />
                Amazon Music
              </Button>
            )}
            {album.streamingLinks?.youtubeMusic && (
              <Button
                fullWidth
                aria-label="Ascolta su YouTube Music"
                className="rounded-xl font-semibold bg-[#FF0000] text-white hover:bg-[#FF0000]/90"
                size="lg"
                variant="primary"
                onPress={() =>
                  window.open(
                    album.streamingLinks?.youtubeMusic,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <YouTubeMusicIcon />
                YouTube Music
              </Button>
            )}
          </motion.div>

          {/* Tracklist — ordine dell'album, ogni brano linka alla sua pagina */}
          {tracks.length > 0 && (
            <motion.div
              {...fadeUp(0.25)}
              className="flex flex-col w-full mt-2 text-left"
            >
              <p className="text-gray-500 text-xs tracking-widest uppercase mb-2">
                Tracklist
              </p>
              <ol className="flex flex-col divide-y divide-gray-100">
                {tracks.map((track, index) => (
                  <li key={track.slug}>
                    <Link
                      className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-danger transition-colors"
                      to={`/${track.slug}`}
                    >
                      <span className="text-gray-500 text-sm tabular-nums w-5 shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium">{track.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </CardContent>
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

function AlbumPresaveSection({ album }: { album: Album }) {
  return (
    <main className="flex flex-col items-center flex-1 px-6 py-8">
      <Card
        className="bg-white shadow-2xl shadow-black/40 w-full max-w-md overflow-hidden"
        data-theme="light"
      >
        <CardContent className="flex flex-col items-center gap-6 text-center p-8">
          {/* Cover */}
          <motion.div
            {...fadeUp(0)}
            className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
          >
            <SmartImage
              priority
              alt={album.alt}
              sizes="320px"
              src={album.artwork}
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
              width={320}
            />
          </motion.div>

          {/* Tipo · anno + titolo + artista */}
          <motion.div {...fadeUp(0.1)} className="flex flex-col gap-1">
            <p className="text-danger font-semibold text-sm tracking-widest uppercase">
              {album.kind} · {album.year}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              {album.title}
            </h1>
            <p className="text-gray-500 text-sm tracking-widest font-medium">
              Lacco
            </p>
          </motion.div>

          {/* Data di uscita */}
          <motion.div {...fadeUp(0.2)}>
            <ReleaseDateBadge date={album.releaseDate} variant="light" />
          </motion.div>

          {/* Countdown */}
          <motion.div {...fadeUp(0.25)}>
            <Countdown releaseDate={album.releaseDate} variant="light" />
          </motion.div>

          {/* CTA pre-save */}
          {album.streamingLinks?.hyperfollow && (
            <motion.div {...fadeUp(0.3)} className="w-full flex justify-center">
              <PresaveButton
                hyperfollowUrl={album.streamingLinks.hyperfollow}
                releaseDate={album.releaseDate}
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
              <span className="text-gray-500 text-xs tracking-wide whitespace-nowrap">
                o avvisami quando esce
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="w-full">
              <SubscribeForm releaseSlug={album.slug} source="presave_form" />
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </main>
  );
}
