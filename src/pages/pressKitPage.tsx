// ========================== MAIN IMPORTS ========================== //
// Import style functions, layout, and custom components for the “PressKit” page.
import heroLacco from "@/assets/images/lacco/heroLacco.avif"; // Main artist image
import { Logo } from "@/components/icons"; // Artist logo
import { title, subtitle } from "@/components/primitives"; // Dynamic typography styles for titles and subtitles
import SmartImage from "@/components/smartImage"; // Optimized image component with automatic loading
import DefaultLayout from "@/layouts/default"; // General site layout (navbar + footer)
import { Helmet } from "react-helmet-async"; // Helmet for SEO and meta tags
import { Skeleton } from "@heroui/skeleton"; // Loading placeholder
import { useState } from "react"; // React hook for local state management
import { Card } from "@heroui/card"; // UI component for container
import CountUp from "@/components/countUp"; // Component for count up effect
import { pressKitStats } from "@/config/pressKitStats"; // Stats
import { songList } from "@/config/songList"; // Discography
import PressKitSongCard from "@/components/pressKitSongCard"; //UI component for songs card
import { pressKitPhotos } from "@/config/pressKitPhotos";
import { Button } from "@heroui/button";
import PressKitPhotoModal from "@/components/pressKitPhotoModal";
import { siteConfig } from "@/config/site";
import nokoruMonoArtwork from "@/assets/images/presskit/nokoruMonoArtwork.avif";
import yukuMonoArtwork from "@/assets/images/presskit/yukuMonoArtwork.avif";
import logoLaccoSVG from "@/assets/images/presskit/logo/logo-lacco.svg";
import logoLaccoPNG from "@/assets/images/presskit/logo/logo-lacco.png";

export default function PressKitPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  return (
    <DefaultLayout>
      <Helmet>
        {/* Prevent indexing (private page) */}
        <meta name="robots" content="noindex, nofollow" />
        <title>Lacco | Press Kit</title>
      </Helmet>
      {/* ========================== INTRO SECTION ========================== */}
      <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Press Kit</h1>
      </section>
      {/* ============================ HERO SECTION ============================ */}
      <section id="presskit-hero">
        <Card className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center p-2 md:p-4 mx-auto  w-full max-w-5xl">
          <div className="p-4 md:p-4 w-fit md:w-full items-center">
            {/* Visual placeholder while the image is loading */}
            {!isLoaded && (
              <Skeleton className="absolute inset-0 rounded-lg">
                <div className="h-full w-full bg-default-300 rounded-lg" />
              </Skeleton>
            )}
            <SmartImage
              isBlurred
              priority
              alt="Lacco" // Alt text for accessibility
              className="item-center"
              sizes="500px"
              src={heroLacco} // Imported image
              style={{ aspectRatio: "1 / 1" }}
              width={500}
              onLoad={() => setIsLoaded(true)} // Removes skeleton when the image is fully loaded
            />
          </div>

          <div className="flex flex-col items-center text-center md:text-left md:items-start p-2 md:p-4">
            <Logo
              aria-label="Lacco official logo"
              className="item-center max-w-full"
              size={250}
            />
            <p className="text-base text-default-500 md:text-lg">
              <span className="text-danger">Press Kit ufficiale:</span>
              <br />
              Usa il ritratto e il logotipo per articoli, interviste e materiali
              promozionali.
            </p>
          </div>
        </Card>
      </section>
      {/* ============================ BIO SECTION ============================= */}
      <section id="presskit-bio" className="pt-8">
        <div className="flex flex-col gap-4">
          <div className="pt-6">
            <h2 className={subtitle()}>Biografia</h2>
          </div>
          <Card className="p-2 md:p-4 mx-auto  w-full max-w-5xl">
            <div className="p-4">
              <h3 className="text-xl font-semibold text-danger">Full Bio</h3>
              <p className="text-base leading-relaxed">
                Lacco, nome d’arte di Andrea La Commara (Torino, ’99),
                costruisce la sua musica intorno alle emozioni umane: le crepe,
                i dettagli, i pensieri che cambiano forma quando nessuno li
                ascolta. La sua scrittura nasce dall’osservazione — prima di sé,
                poi degli altri — e trasforma esperienze quotidiane in immagini
                nitide e racconti emotivi.
                <br />
                Dopo gli esordi come Checkmate, anni dedicati a imparare a
                produrre e a scrivere, sceglie di ripartire dal proprio nome e
                da una visione più consapevole. Ogni brano diventa un tassello
                di un percorso personale che parla di crescita, identità,
                relazioni e fragilità condivise.
                <br />
                Nel 2026 presenta
                <em className="text-danger px-1">nokoru mono</em>, il suo album
                di debutto: un progetto che esplora ciò che resta dentro di noi,
                il mondo interiore che si muove anche quando tutto sembra fermo.
                Un disco introspettivo, vicino al contemporary R&amp;B,
                costruito su una ricerca emotiva sincera e mai estetizzata.
                <br />
                Il progetto dialoga con il capitolo complementare
                <em className="text-danger px-1">yuku mono</em>, previsto per il
                futuro. Se <em>nokoru mono</em> racconta ciò che accade dentro,{" "}
                <em>yuku mono </em>
                osserva ciò che accade fuori: vite altrui, storie incrociate,
                piccoli movimenti che rivelano quanto le persone siano diverse
                solo in superficie. Insieme formano una riflessione più ampia su
                ciò che tratteniamo e ciò che lasciamo andare.
              </p>
            </div>
          </Card>
          <Card className="p-2 md:p-4 mx-auto  w-full max-w-5xl">
            <div className="p-4">
              <h3 className="text-xl font-semibold text-danger">Short Bio</h3>
              <p className="text-base leading-relaxed text-default-600">
                Lacco (Torino, ’99) racconta ciò che si muove dentro e intorno
                alle persone attraverso un R&amp;B introspettivo e narrativo.
                Nel 2026 pubblica
                <em className="text-danger px-1">nokoru mono</em>, un album che
                indaga ciò che resta nelle emozioni e nei pensieri. Il progetto
                proseguirà con
                <em className="text-danger px-1">yuku mono</em>, dedicato invece
                alle storie degli altri. Due prospettive, una sola direzione:
                illuminare ciò che spesso rimane in ombra, trasformandolo in
                immagini emotive e sincere.
              </p>
            </div>
          </Card>
        </div>
      </section>
      {/* ============================ HIGHLIGHTS ============================== */}
      <section id="presskit-highlights" className="pt-8">
        <div className="flex flex-col gap-4">
          <div className="pt-6">
            <h2 className={subtitle()}>Highlights</h2>
          </div>
          <Card className="p-2 md:p-4 mx-auto  w-full max-w-5xl">
            <section className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center p-4">
              <div>
                <div className="text-4xl font-semibold text-default-700">
                  <CountUp
                    end={pressKitStats.monthlyListeners}
                    duration={1000}
                  />
                </div>
                <p className="text-default-500">Ascoltatori mensili</p>
              </div>

              <div>
                <div className="text-4xl font-semibold text-default-700">
                  <CountUp end={pressKitStats.totalStreams} duration={1000} />
                </div>
                <p className="text-default-500">Stream totali</p>
              </div>

              <div>
                <div className="text-4xl font-semibold text-default-700">
                  <CountUp
                    end={pressKitStats.spotifyFollowers}
                    duration={1000}
                  />
                </div>
                <p className="text-default-500">Followers Spotify</p>
              </div>

              <div>
                <div className="text-4xl font-semibold text-default-700">
                  <CountUp end={songList.length} duration={1000} />
                </div>
                <p className="text-default-500">Brani pubblicati</p>
              </div>
            </section>
            <section className="p-4">
              <ul className="text-default-600 text-base leading-relaxed flex flex-col">
                <li>
                  <strong className="text-danger">Città principali:</strong>{" "}
                  Torino • Milano • Roma • Napoli • Bologna
                </li>
                <li>
                  <strong className="text-danger">Audience principale:</strong>{" "}
                  18–34 anni, ascoltatori attenti ai testi e alla ricerca
                  emotiva
                </li>
                <li>
                  <strong className="text-danger">Paesi principali:</strong>{" "}
                  Italia • Svizzera • Germania
                </li>
                <li>
                  <strong className="text-danger">Genere e identità:</strong>{" "}
                  R&B contemporaneo con influenze urban e un approccio pop
                  introspettivo
                </li>
                <li>
                  <strong className="text-danger">Estetica:</strong> minimale e
                  contemporanea
                </li>
                <li>
                  <strong className="text-danger">Focus narrativo:</strong>{" "}
                  fragilità, relazioni, identità e vissuto personale trasformato
                  in immagini nitide
                </li>
              </ul>
            </section>
          </Card>
        </div>
      </section>

      {/* ============================ PROJECT SECTION ============================ */}
      <section id="presskit-project" className="pt-8">
        <div className="flex flex-col gap-4">
          <div className="pt-6">
            <h2 className={subtitle()}>Il progetto artistico</h2>
          </div>

          <Card className="p-6 mx-auto w-full max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8 pb-4">
              <div className="flex flex-col items-center">
                <SmartImage
                  priority
                  alt="nokru mono" // Alt text for accessibility
                  className="item-center"
                  sizes="500px"
                  src={nokoruMonoArtwork} // Imported image
                  style={{ aspectRatio: "1 / 1" }}
                  width={500}
                  onLoad={() => setIsLoaded(true)} // Removes skeleton when the image is fully loaded
                />
                <em className="text-danger pt-2">nokoru mono</em>
              </div>
              <div className="flex flex-col items-center">
                <SmartImage
                  priority
                  alt="yuku mono" // Alt text for accessibility
                  className="item-center"
                  sizes="500px"
                  src={yukuMonoArtwork} // Imported image
                  style={{ aspectRatio: "1 / 1" }}
                  width={500}
                  onLoad={() => setIsLoaded(true)} // Removes skeleton when the image is fully loaded
                />
                <em className="text-danger pt-2">yuku mono</em>
              </div>
            </div>
            <div className="flex flex-col gap-4 text-base leading-relaxed text-default-600">
              <p>
                <strong className="text-danger">
                  Il progetto artistico di Lacco si basa su una dicotomia
                  fondamentale: quelli che restano e quelli che vanno.
                </strong>
                <br />
                Due movimenti che convivono e si influenzano a vicenda, come
                poli opposti dello stesso viaggio umano. Da questa dualità
                nascono i due capitoli del progetto:
                <em className="text-danger px-1">nokoru mono</em> e
                <em className="text-danger px-1">yuku mono</em>.
              </p>

              <p>
                <em className="text-danger pr-1">nokoru mono</em> (“quelli che
                restano”) è un lavoro più introspettivo e consapevole: racconta
                il mondo interiore, le emozioni che accompagnano la crescita,
                gli spazi che si muovono dentro di noi anche quando tutto sembra
                fermo. È un disco che osserva da vicino: stratificato, intimo,
                profondamente personale. Il suono si avvicina a una dimensione
                più R&B, calda, meditativa.
              </p>

              <p>
                <em className="text-danger pr-1">yuku mono</em> (“quelli che
                vanno”) guarda invece all’esterno. Non parla più di ciò che ti
                attraversa, ma di ciò che <em>succede agli altri</em>: vite
                sfiorate, storie osservate, incontri, distanze, movimenti. È un
                disco più luminoso, più acustico: racconta il mondo esterno come
                specchio, volontario o involontario, della propria crescita.
              </p>

              <p>
                Insieme, i due capitoli formano un unico messaggio:{" "}
                <em className="text-danger px-1">
                  siamo tutti unicamente uguali
                </em>
                . Cambiano i contesti, cambiano le vite, ma ogni persona
                attraversa la stessa tensione tra ciò che resta e ciò che se ne
                va. Non è un progetto autoreferenziale: è un’indagine sulla
                persona umana, sulle sue costanti e sulle sue fragilità
                condivise.
              </p>

              <p>
                L’immaginario visivo trova le sue radici negli
                <em className="text-danger px-1">Stati d’animo</em> di Umberto
                Boccioni. <br />
                <em className="text-danger pr-1">Quelli che restano</em> e{" "}
                <em className="text-danger px-1">Quelli che vanno</em> sono
                diventati due idee guida: il moto interiore e quello esteriore,
                la quiete che trattiene e lo slancio che trascina, la
                frammentazione dell’identità e la sua ricomposizione continua.
                Sono opere che non descrivono persone, ma percezioni, proprio
                come fa questo progetto.
              </p>

              <p>
                Un immaginario essenziale, unito alla profondità della scrittura
                italiana, trasforma ogni brano in una scena nitida e
                cinematografica che restituisce ciò che siamo: individui
                diversi, ma mossi dalle stesse forze.
              </p>

              <p>
                Con
                <em className="text-danger px-1">nokoru mono</em>(in uscita il{" "}
                <em className="text-danger px-1">23/01/2026</em>) si apre il
                primo capitolo di un viaggio che continua, inevitabilmente, in{" "}
                <em className="text-danger px-1">yuku mono</em>.<br />
                Due prospettive, un’unica storia: quella dell’essere umano.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ============================ DISCOGRAPHY ============================ */}
      <section id="presskit-discography" className="pt-8">
        <div className="pt-6 pb-4">
          <h2 className={subtitle()}>Discografia</h2>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
          {songList
            .filter((song) => song.preSaveMode === false)
            .map((song) => (
              <PressKitSongCard
                key={song.title}
                title={song.title}
                year={song.year}
                artwork={song.src}
                spotify={song.spotifyLink}
                appleMusic={song.appleMusicLink}
                description={song.pressKitDescription}
              />
            ))}
        </div>
      </section>

      {/* ============================ PHOTOS ============================ */}
      <section id="presskit-photos" className="pt-8">
        <div className="flex flex-col gap-4">
          <div className="pt-6">
            <h2 className={subtitle()}>Book fotografico</h2>
          </div>

          <Card className="p-2 md:p-4 mx-auto w-full max-w-5xl">
            <p className="text-default-500 text-sm p-4">
              Foto ufficiali utilizzabili per articoli, playlist editoriali,
              social e materiale promozionale.
            </p>

            {/* PREVIEW GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {pressKitPhotos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelected(photo);
                    setModalOpen(true);
                  }}
                  className="block overflow-hidden rounded-lg"
                >
                  <SmartImage
                    src={photo.src}
                    alt={photo.alt}
                    className="rounded-lg transition-transform hover:scale-105"
                    sizes="200px"
                    style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>

            {/* DOWNLOAD ZIP */}
            <div className="flex justify-center p-4">
              <a href="/presskit/HQ/photos.zip" download>
                <Button color="danger" variant="solid" className="px-6">
                  Scarica tutte le foto e gli artwork (.zip)
                </Button>
              </a>
            </div>
          </Card>

          {/* MODAL */}
          {selected && (
            <PressKitPhotoModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              src={selected.srcHQ}
              alt={selected.alt}
              downloadUrl={selected.srcHQ}
            />
          )}
        </div>
      </section>

      {/* ============================ LOGO ============================ */}
      <section id="presskit-logo" className="pt-8">
        <div className="flex flex-col gap-4">
          <div className="pt-6">
            <h2 className={subtitle()}>Logo ufficiale</h2>
          </div>

          <Card className="p-6 mx-auto w-full max-w-5xl flex flex-col items-center gap-6">
            <p className="text-default-600 text-base text-center">
              Download del logotipo ufficiale di Lacco in formato vettoriale e
              PNG per utilizzi editoriali, grafici e promozionali.
            </p>

            {/* PREVIEW */}
            <div className="w-full flex justify-center">
              <Logo size={180} className="text-default-800" />
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={logoLaccoSVG} download>
                <Button color="danger" className="px-6">
                  Scarica SVG
                </Button>
              </a>
              <a href={logoLaccoPNG} download>
                <Button color="danger" className="px-6">
                  Scarica PNG
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* ============================ CONTACTS =============================== */}
      <section id="presskit-contacts" className="pt-8">
        <div className="flex flex-col gap-4">
          <div className="pt-6">
            <h2 className={subtitle()}>Contatti</h2>
          </div>

          <Card className="p-6 mx-auto w-full max-w-5xl">
            <div className="flex flex-col gap-8">
              {/* MANAGEMENT */}
              <div>
                <h3 className="text-lg font-semibold text-danger">
                  Management
                </h3>
                <p className="text-default-600 text-base mt-1 mb-3">
                  Per richieste stampa, interviste, booking e collaborazioni:
                </p>
                <a
                  href="mailto:management@lacco.it"
                  className="text-base font-medium text-default-800 hover:text-danger transition-colors"
                >
                  management@lacco.it
                </a>
              </div>

              {/* SOCIAL LINKS */}
              <div>
                <h3 className="text-lg font-semibold text-danger mb-3">
                  Social & Streaming
                </h3>

                <ul className="flex flex-col gap-2 text-default-600 text-base">
                  <li className="flex items-center gap-2">
                    <span className="text-danger">•</span>
                    <a
                      href={siteConfig.links.instagram}
                      target="_blank"
                      className="font-medium hover:text-danger transition-colors"
                    >
                      Instagram – @laccoverse
                    </a>
                  </li>

                  <li className="flex items-center gap-2">
                    <span className="text-danger">•</span>
                    <a
                      href={siteConfig.links.tiktok}
                      target="_blank"
                      className="font-medium hover:text-danger transition-colors"
                    >
                      TikTok – @laccoverse
                    </a>
                  </li>

                  <li className="flex items-center gap-2">
                    <span className="text-danger">•</span>
                    <a
                      href={siteConfig.links.spotify}
                      target="_blank"
                      className="font-medium hover:text-danger transition-colors"
                    >
                      Spotify – Lacco
                    </a>
                  </li>

                  <li className="flex items-center gap-2">
                    <span className="text-danger">•</span>
                    <a
                      href={siteConfig.links.appleMusic}
                      target="_blank"
                      className="font-medium hover:text-danger transition-colors"
                    >
                      Apple Music – Lacco
                    </a>
                  </li>

                  <li className="flex items-center gap-2">
                    <span className="text-danger">•</span>
                    <a
                      href={siteConfig.links.youtube}
                      target="_blank"
                      className="font-medium hover:text-danger transition-colors"
                    >
                      YouTube – Lacco
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
