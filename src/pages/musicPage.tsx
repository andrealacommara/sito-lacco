import { Helmet } from "react-helmet-async";

import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import SongCarousel from "@/components/songCarousel";
import AlbumCard from "@/components/albumCard";
import { albums } from "@/config/catalog";

export default function MusicPage() {
  // Le release in pre-save vivono solo in Home: qui mostriamo le uscite pubblicate,
  // dalla più recente alla più vecchia (l'ultima uscita è la più importante).
  const releasedAlbums = albums
    .filter((album) => !album.presaveMode)
    .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());

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
        {releasedAlbums.length > 0 && (
          <>
            <div className="pb-6">
              <h2 className={subtitle()}>Scopri il progetto musicale</h2>
            </div>

            <div className="flex flex-col gap-6">
              {releasedAlbums.map((album) => (
                <AlbumCard key={album.slug} album={album} />
              ))}
            </div>
          </>
        )}

        <div className="pt-10">
          <h2 className={subtitle()}>Scopri la storia di ogni singolo</h2>
        </div>

        <SongCarousel />

        <div className="flex justify-center">
          <h3 className="w-full md:w-1/2 my-2 text-default-400 block max-w-full text-center font-light text-sm">
            Ogni brano è una parte di me, buon ascolto.
          </h3>
        </div>
      </div>
    </DefaultLayout>
  );
}
