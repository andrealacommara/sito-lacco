import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import CardSongExposer from "@/components/cardSongExposer";
import { songList } from "@/config/songList";

export default function MusicPage() {
  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>La mia musica</h1>
      </div>
      <div className="flex flex-col justify-center min-h-fit md:min-h-fit">
        <h2 className={subtitle()}>Scopri la storia di ogni singolo</h2>
        <div className="flex p-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing">
          {songList.map((song) => (
            <div
              key={song.title}
              className="shrink-0 snap-center px-2 max-w-full first:ml-[calc(50vw-140px)] last:mr-[calc(50vw-140px)] transition-transform hover:scale-105 active:scale-95"
            >
              <CardSongExposer
                artworkAlt={song.alt}
                artworkSrc={song.src}
                songTitle={song.title}
                songDescription={song.description}
                songSpotifyLink={song.spotifyLink}
                preSaveMode={song.preSaveMode}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <h3 className="w-full md:w-1/2 my-2 text-default-400 block max-w-full text-center font-light text-small">
            Ogni brano è una parte di me, buon ascolto.
          </h3>
        </div>
      </div>
    </DefaultLayout>
  );
}
