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

export default function PressKitPage() {
  const [isLoaded, setIsLoaded] = useState(false);
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
              Press Kit ufficiale:
              <br />
              Usa il ritratto e il logotipo per articoli, interviste e materiali
              promozionali.
            </p>
          </div>
        </Card>
      </section>

      {/* ============================ BIO SECTION ============================= */}
      <section id="presskit-bio">
        <div className="flex flex-col gap-4">
          <div className="pt-6">
            <h2 className={subtitle()}>Biografia</h2>
          </div>
          <Card className="p-2 md:p-4 mx-auto  w-full max-w-5xl">
            <div className="p-4">
              <p className="text-base leading-relaxed">
                Lacco, nome d’arte di Andrea La Commara, è un artista torinese
                classe ’99. La sua musica nasce dall’urgenza di dare voce a ciò
                che normalmente rimane nascosto: fragilità, pensieri sospesi,
                emozioni che attraversano senza fare rumore. Unisce sonorità
                R&B, influenze hip-hop e un approccio lirico intimo, costruito
                su immagini nitide e una scrittura che scava. Dopo gli inizi
                come Checkmate, con cui esplora la produzione e le prime forme
                di scrittura, sceglie di tornare alle origini e al nome con cui
                tutti lo conoscono: Lacco. Da quel momento, ogni brano diventa
                un capitolo di un percorso personale fatto di crescita,
                riconciliazione e consapevolezza. Le sue canzoni sono piccoli
                mondi interiori, che parlano di identità, relazioni,
                vulnerabilità e ricerca di sé. Lacco costruisce un immaginario
                pulito e minimale, ispirato all’estetica giapponese e alla
                fotografia intima. Il suo progetto si muove tra autenticità e
                cura del dettaglio, cercando sempre un equilibrio tra
                introspezione e accessibilità.
              </p>
            </div>
          </Card>
          <Card className="p-2 md:p-4 mx-auto  w-full max-w-5xl">
            <div className="p-4">
              <h3 className="text-xl font-semibold text-default-800">
                Short Bio
              </h3>
              <p className="text-base leading-relaxed text-default-600">
                Lacco è un artista torinese classe ’99 che unisce R&B e
                influenze hip-hop in un racconto introspettivo fatto di
                emozioni, fragilità e immagini cinematografiche. La sua musica
                esplora ciò che spesso resta non detto, trasformando il vissuto
                personale in narrazioni universali.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ============================ HIGHLIGHTS ============================== */}
      <section id="presskit-highlights">
        {/* TODO: numbers, sound, mood, inspirations */}
      </section>

      {/* ============================ DISCOGRAPHY ============================ */}
      <section id="presskit-discography">
        {/* TODO: CardSongExposer (press version) */}
      </section>

      {/* ============================ PHOTOS ================================= */}
      <section id="presskit-photos">
        {/* TODO: Grid images + download .zip */}
      </section>

      {/* ============================ CONTACTS =============================== */}
      <section id="presskit-contacts">
        {/* TODO: Contacts, social, professional e-mail */}
      </section>
    </DefaultLayout>
  );
}
