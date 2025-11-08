// ========================== IMPORT PRINCIPALI ========================== //
// Librerie e componenti usati per animazioni, immagini, stato e layout.
import { motion } from "framer-motion"; // Per le animazioni di entrata (scroll reveal)
import { Image } from "@heroui/image"; // Componente immagine con gestione automatica del caricamento
import { useEffect, useRef, useState } from "react"; // Hook React per stato, effetti e riferimenti DOM
// Import di immagini statiche e componenti di supporto
import { Card, Skeleton } from "@heroui/react"; // Componenti UI per struttura e caricamento
import { Helmet } from "react-helmet-async"; // <--- Import di Helmet per SEO e meta tag
import aboutPic1 from "@/assets/images/lacco/aboutPic1.avif";
import aboutPic2 from "@/assets/images/lacco/aboutPic2.avif";
import aboutPic3 from "@/assets/images/lacco/aboutPic3.avif";
import DefaultLayout from "@/layouts/default"; // Layout base (navbar + footer)
import { subtitle, title } from "@/components/primitives"; // Stili dinamici per testi

// ========================== CONTENUTO TESTUALE ========================== //
// Array che definisce i blocchi della pagina "Su di me".
// Ogni sezione contiene un testo descrittivo e un’immagine associata.
const sections = [
  {
    text: "Sono Andrea, ma tutti mi chiamano Lacco. Sono nato nel ‘99 a Torino ed ho iniziato a fare musica sotto il nome di “Checkmate“, un progetto che mi ha permesso di capire chi sono e cosa voglio.",
    image: aboutPic1,
  },
  {
    text: "Con il tempo, brano dopo brano, ho costruito la mia identità. O meglio, ho ritrovato la mia identità. In quel momento ho capito che non dovevo essere altro che me.",
    image: aboutPic2,
  },
  {
    text: "La mia musica parla alle persone che sanno ascoltare, che sanno ascoltarsi. Persone che possono essere tutto, ma non sono niente, nient'altro che loro. La mia musica parla a chi vede oltre le parole.",
    image: aboutPic3,
  },
];

// ========================== HOOK PERSONALIZZATO: useInView ========================== //
// Controlla se un elemento è visibile all’interno del viewport (scroll reveal).
// Usa IntersectionObserver per attivare le animazioni solo quando l’elemento entra a schermo.
function useInView(ref: React.RefObject<HTMLDivElement>, threshold = 0.2) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }, // Percentuale di visibilità per considerare "in view"
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, threshold]);

  return isInView;
}

// ========================== COMPONENTE: AboutSection ========================== //
// Rappresenta una singola sezione "Su di me" con testo e immagine animati.
// Accetta props: testo, immagine e opzione "reversed" per invertire il layout.

function AboutSection({
  text,
  image,
  reversed = false,
}: {
  text: string;
  image: string;
  reversed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null); // Riferimento DOM per l’osservazione
  const inView = useInView(ref); // Verifica se la sezione è visibile
  const [isLoaded, setIsLoaded] = useState(false); // Stato di caricamento immagine

  return (
    // motion.div permette l'animazione all'apparizione su schermo
    <motion.div
      ref={ref}
      animate={inView ? { opacity: 1, x: 0 } : {}} // Attiva solo quando visibile
      initial={{ opacity: 0, x: reversed ? 100 : -100 }} // Entrata laterale dinamica
      transition={{ duration: 0.8, ease: "easeOut" }} // Durata e tipo di animazione
    >
      {/* Card che contiene testo e immagine, disposti in righe o colonne */}
      <Card
        className={`flex flex-col-reverse md:flex-row ${
          reversed ? "md:flex-row-reverse" : ""
        } items-center md:items-center justify-center md:justify-center p-2 md:p-4 gap-2 md:gap-4 mx-auto  w-full max-w-5xl`}
      >
        {/* Scheletro mostrato finché l’immagine non è caricata */}
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}

        {/* Testo descrittivo */}
        <div className="p-2 md:p-4">
          <h1 className={subtitle()}>{text}</h1>
        </div>

        {/* Immagine con effetto blur e caricamento controllato */}
        <div className="p-4 md:p-4 w-fit md:w-full items-center">
          <Image
            alt="Lacco"
            className="item-center"
            src={image}
            width={400}
            loading="eager"
            onLoad={() => setIsLoaded(true)} // Rimuove lo scheletro al caricamento
          />
        </div>
      </Card>
    </motion.div>
  );
}

// ========================== COMPONENTE PRINCIPALE: AboutPage ========================== //
// Struttura generale della pagina “Su di me”.
// Mostra il titolo principale e itera le sezioni definite in `sections`.

export default function AboutPage() {
  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      {/* Titolo e description dinamici per SEO Google */}
      <Helmet>
        <title>Lacco | Su di me</title>
        <meta
          name="description"
          content="Scopri Lacco: la sua storia, il percorso musicale e la filosofia dietro la sua musica."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div>
        {/* Titolo della pagina */}
        <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
          <h1 className={title()}>Su di me</h1>
        </section>

        {/* Mappa tutte le sezioni con layout alternato (sinistra/destra) */}
        <div className="flex flex-col gap-4">
          {sections.map((s, i) => (
            <AboutSection key={i} {...s} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
