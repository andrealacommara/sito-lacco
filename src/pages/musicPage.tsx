import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import SongCarousel from "@/components/songCarousel";
import { AppleMusicIcon, SpotifyIcon } from "@/components/icons";
import SmartImage from "@/components/smartImage";
import nokoruMonoArtwork from "@/assets/images/artworks/nokoruMonoArtwork.avif";

export default function MusicPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | La mia musica</title>
        <meta
          content="Scopri la musica di Lacco: la storia di ogni brano, l'artwork e il link per ascoltarlo su Spotify."
          name="description"
        />
        <meta content="index, follow" name="robots" />
      </Helmet>

      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>La mia musica</h1>
      </div>

      <div className="flex flex-col justify-center min-h-fit md:min-h-fit">
        <div className="pb-6">
          <h2 className={subtitle()}>Scopri la storia dell&apos;EP</h2>
        </div>

        <Card className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center p-2 md:p-4 mx-auto w-full max-w-5xl">
          {!isLoaded && (
            <Skeleton className="absolute inset-0 rounded-lg">
              <div className="h-full w-full bg-default-300 rounded-lg" />
            </Skeleton>
          )}
          <div className="p-4 md:p-4 w-fit md:w-full items-center">
            <SmartImage
              isBlurred
              priority
              alt="nokoru mono Artwork"
              className="item-center"
              sizes="400px"
              src={nokoruMonoArtwork}
              style={{ aspectRatio: "1 / 1" }}
              width={400}
              onError={() => setIsLoaded(true)}
              onLoad={() => setIsLoaded(true)}
            />
          </div>
          <div className="flex flex-col p-4">
            <div className="pb-4">
              <p>
                <em className="text-danger pr-1">nokoru mono</em> (&quot;quelli
                che restano&quot;) è il nome del primo progetto.
              </p>
              <p>
                Racconta il mondo interiore, le emozioni che accompagnano la
                crescita e gli spazi che si muovono dentro di noi, anche quando
                tutto sembra fermo.
              </p>
              <p>
                È un EP che osserva da vicino: stratificato, intimo,
                profondamente personale. Il suono si avvicina a una dimensione
                più R&B, calda e meditativa, che accompagna l&apos;ascoltatore
                in un viaggio verso sè stesso.
              </p>
              <p>
                L&apos;artwork, realizzato da Nicolò Piazza ( in arte
                <a
                  className="text-primary px-1 hover:underline"
                  href="https://www.instagram.com/torino_ink"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Torino Ink
                </a>
                ) sotto la direzione artistica di Lacco, si ispira
                all&apos;omonima opera di Umberto Boccioni, facente parte del
                trittico &quot;Stati d&apos;animo&quot;.
              </p>
              <p>
                &quot;nokoru mono&quot; rappresenta il primo pezzo di un puzzle
                più grande, il primo passo di un lungo percorso.
                <br /> Un viaggio attraverso noi stessi e le altre persone.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:justify-between md:items-stretch">
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
                  Ascolta su Spotify
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
                  Ascolta su Apple Music
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
