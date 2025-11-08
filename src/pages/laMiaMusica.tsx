// ========================== IMPORT DIPENDENZE PRINCIPALI ========================== //
// Importa funzioni di stile, layout e componenti personalizzati per la pagina “La mia musica”.

import { subtitle, title } from "@/components/primitives"; // Classi di stile per i titoli principali e secondari
import DefaultLayout from "@/layouts/default"; // Layout base (include navbar e footer)
import CardSongExposer from "@/components/cardSongExposer"; // Componente personalizzato per mostrare ogni singolo musicale
import { songList } from "@/config/songList"; // Dati statici dei brani (titolo, descrizione, artwork, link, ecc.)

// ========================== COMPONENTE PRINCIPALE ========================== //
// Pagina “La mia musica” – visualizza tutti i singoli con descrizione e copertina.

export default function MusicPage() {
  return (
    <DefaultLayout>
      {/* ========================== SEZIONE TITOLO ========================== */}
      {/* Titolo principale della pagina */}
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>La mia musica</h1>
      </div>

      {/* ========================== SEZIONE CONTENUTI ========================== */}
      <div className="flex flex-col justify-center min-h-fit md:min-h-fit">
        {/* Sottotitolo introduttivo */}
        <h2 className={subtitle()}>Scopri la storia di ogni singolo</h2>

        {/* ========================== SEZIONE SCORRIMENTO CANZONI ========================== */}
        {/* Contenitore orizzontale che permette di scorrere tra le card dei brani */}
        <div className="flex p-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing">
          {/* Mappa dinamicamente tutti gli oggetti di songList, creando una CardSongExposer per ciascun brano */}
          {songList.map((song) => (
            <div
              key={song.title} // Chiave unica per React
              className="shrink-0 snap-center px-2 max-w-full first:ml-[calc(50vw-140px)] last:mr-[calc(50vw-140px)] transition-transform hover:scale-105 active:scale-95"
            >
              <CardSongExposer
                artworkAlt={song.alt} // Testo alternativo per l’immagine
                artworkSrc={song.src} // Immagine del brano (artwork)
                preSaveMode={song.preSaveMode} // Flag per distinguere brani ancora da pubblicare (pre-save)
                songDescription={song.description} // Descrizione narrativa del brano
                songSpotifyLink={song.spotifyLink} // Link diretto al brano su Spotify
                songTitle={song.title} // Titolo del singolo
              />
            </div>
          ))}
        </div>

        {/* ========================== SEZIONE CONCLUSIVA ========================== */}
        {/* Breve messaggio finale all’utente */}
        <div className="flex justify-center">
          <h3 className="w-full md:w-1/2 my-2 text-default-400 block max-w-full text-center font-light text-small">
            Ogni brano è una parte di me, buon ascolto.
          </h3>
        </div>
      </div>
    </DefaultLayout>
  );
}
