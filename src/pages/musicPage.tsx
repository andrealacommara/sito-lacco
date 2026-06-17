import { Helmet } from "react-helmet-async";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import SongCarousel from "@/components/songCarousel";
import { AppleMusicIcon, SpotifyIcon } from "@/components/icons";
import SmartImage, { resolveImageSource } from "@/components/smartImage";
import nokoruMonoArtwork from "@/assets/images/artworks/nokoruMonoArtwork.avif";

export default function MusicPage() {
  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | Musica</title>
        <meta
          content="Ascolta la musica di Lacco, cantautore italiano di R&B e Hip-Hop. Scopri i suoi EP, singoli e la storia dietro ogni brano."
          name="description"
        />
        <meta content="index, follow" name="robots" />
        <link href="https://lacco.it/musica" rel="canonical" />
        <meta content="music.musician" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content="Lacco | Musica" property="og:title" />
        <meta
          content="Ascolta la musica di Lacco, cantautore italiano di R&B e Hip-Hop. Scopri i suoi EP, singoli e la storia dietro ogni brano."
          property="og:description"
        />
        <meta content="https://lacco.it/musica" property="og:url" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content="Lacco — Cantautore" property="og:image:alt" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Lacco | Musica" name="twitter:title" />
        <meta
          content="Ascolta la musica di Lacco, cantautore italiano di R&B e Hip-Hop."
          name="twitter:description"
        />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />
      </Helmet>

      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Musica</h1>
      </div>

      <div className="flex flex-col justify-center min-h-fit md:min-h-fit">
        <div className="pb-6">
          <h2 className={subtitle()}>Scopri la storia dell&apos;EP</h2>
        </div>

        <Card className="relative overflow-hidden flex flex-col md:flex-row items-center justify-center p-6 md:p-8 gap-6 mx-auto w-full max-w-4xl">
          {/* Blurred artwork backdrop */}
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
            src={resolveImageSource(nokoruMonoArtwork)}
          />
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative shrink-0 flex items-center justify-center">
            <SmartImage
              isBlurred
              priority
              alt="nokoru mono Artwork"
              src={nokoruMonoArtwork}
              style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
              width={350}
            />
          </div>

          <div className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 md:p-6 backdrop-blur-md flex-1">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-danger uppercase tracking-[0.2em] text-xs font-bold">
                EP · 2026
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                nokoru mono
              </h2>
            </div>

            <div className="text-white/80 text-sm leading-relaxed space-y-3">
              <p>
                <em>nokoru mono</em> — &ldquo;quelli che restano&rdquo;
              </p>
              <p>
                Un EP stratificato, intimo e profondamente personale. Racconta
                il mondo interiore, le emozioni che accompagnano la crescita e
                gli spazi che si muovono dentro di noi, anche quando tutto
                sembra fermo. Il suono è R&amp;B: caldo, meditativo, riflessivo.
              </p>
              <p>
                L&apos;artwork di{" "}
                <a
                  className="text-white hover:underline"
                  href="https://www.instagram.com/torino_ink"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Nicolò Piazza (Torino Ink)
                </a>
                , ispirato all&apos;omonima opera di Boccioni dal trittico{" "}
                <em>&ldquo;Stati d&apos;animo&rdquo;</em>, è il primo pezzo di
                un puzzle più grande.
              </p>
            </div>
            <p className="text-white/60 text-xs text-center">
              Ascolta ora
            </p>
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="flex-1 min-w-0">
                <Button
                  fullWidth
                  aria-label="Vai al brano su Spotify"
                  className="min-w-0"
                  color="success"
                  onPress={() =>
                    window.open(
                      "https://open.spotify.com/intl-it/album/03t1vGNiDM9ORxsVWSnp8E?si=G7J5EBWJTNm3QMXpQytV1Q",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <SpotifyIcon />
                  Spotify
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <Button
                  fullWidth
                  aria-label="Vai al brano su Apple Music"
                  className="min-w-0"
                  color="danger"
                  onPress={() =>
                    window.open(
                      "https://music.apple.com/it/album/nokoru-mono/1863599627",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <AppleMusicIcon />
                  Apple Music
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="pt-10">
          <h2 className={subtitle()}>Scopri la storia di ogni singolo</h2>
        </div>

        <SongCarousel />

        <div className="flex justify-center">
          <h3 className="w-full md:w-1/2 my-2 text-default-400 block max-w-full text-center font-light text-small">
            Ogni brano è una parte di me, buon ascolto.
          </h3>
        </div>
      </div>
    </DefaultLayout>
  );
}
