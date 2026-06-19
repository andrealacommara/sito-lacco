import type { LiveEvent } from "@/config/liveEvents";

import { Card } from "@heroui/card";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

import heroLacco from "@/assets/images/lacco/heroLacco.avif";
import { resolveImageSource } from "@/components/smartImage";
import DefaultLayout from "@/layouts/default";
import { subtitle, title } from "@/components/primitives";
import LiveEventCard from "@/components/liveEventCard";
import { getPastLiveEvents, getUpcomingLiveEvents } from "@/config/liveEvents";

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="10" rx="3" width="6" x="9" y="2" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" x2="12" y1="17" y2="22" />
      <line x1="8" x2="16" y1="22" y2="22" />
    </svg>
  );
}

// Riflettore da palco — punta verso il basso (la lente è in fondo, dove esce il
// fascio). Il corpo usa currentColor così si adatta a light/dark mode; la lente
// è nel rosso del brand per agganciarsi visivamente al beam.
function SpotlightFixture({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 48 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* pomello di aggancio */}
      <circle cx="24" cy="4" fill="currentColor" r="3.5" />
      {/* braccio */}
      <rect fill="currentColor" height="9" rx="1.5" width="3" x="22.5" y="6" />
      {/* corpo: trapezio più largo in basso */}
      <path d="M16 14 H32 L40 44 H8 Z" fill="currentColor" />
      {/* ghiera della lente */}
      <ellipse cx="24" cy="44" fill="currentColor" rx="18" ry="5" />
      {/* lente luminosa */}
      <ellipse cx="24" cy="44" fill="#F31260" rx="12" ry="3.4" />
    </svg>
  );
}


function formatEventDate(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function PastEventCard({ event }: { event: LiveEvent }) {
  const artwork = event.poster ?? heroLacco;

  return (
    <Card className="relative mx-auto w-full max-w-4xl overflow-hidden">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
        src={resolveImageSource(artwork)}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-1 p-4 md:p-5 m-3 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md">
        <span className="font-bold text-white text-lg md:text-xl">
          {event.title}
        </span>
        <span className="text-white/60 text-sm">
          {formatEventDate(event.date)} · {event.venue}
        </span>
      </div>
    </Card>
  );
}

export default function LivePage() {
  const upcoming = getUpcomingLiveEvents();
  const past = getPastLiveEvents();

  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | Live</title>
        <meta
          content="Scopri le prossime date live di Lacco, cantautore italiano di R&B e Hip-Hop. Biglietti e info sui concerti."
          name="description"
        />
        <meta content="index, follow" name="robots" />
        <link href="https://lacco.it/live" rel="canonical" />
        <meta content="website" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content="Lacco | Live" property="og:title" />
        <meta
          content="Scopri le prossime date live di Lacco, cantautore italiano di R&B e Hip-Hop. Biglietti e info sui concerti."
          property="og:description"
        />
        <meta content="https://lacco.it/live" property="og:url" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content="Lacco — Cantautore" property="og:image:alt" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Lacco | Live" name="twitter:title" />
        <meta
          content="Le prossime date live di Lacco, cantautore R&B e Hip-Hop."
          name="twitter:description"
        />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />
      </Helmet>

      <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Live</h1>
      </section>

      <div className="flex flex-row items-center justify-center py-4 md:py-4">
        <h2 className={subtitle()}>Prossimi live</h2>
      </div>

      {upcoming.length > 0 ? (
        <div className="flex flex-col gap-8">
          {upcoming.map((event) => (
            <LiveEventCard key={event.slug} event={event} />
          ))}
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-2xl min-h-75 sm:min-h-90 overflow-hidden flex flex-col items-center justify-end gap-4 pb-14">
          {/* Riflettore sinistro: il pivot (origin-top) è sulla lente, così il
              fascio spazza come un vero faro da palco. */}
          <motion.div
            animate={{ rotate: [-34, -18, -34] }}
            className="pointer-events-none absolute top-16 left-2 sm:left-16 origin-top"
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          >
            <SpotlightFixture className="absolute bottom-full left-1/2 -translate-x-1/2 w-9 sm:w-12 text-default-500" />
            <div
              className="h-64 w-28 sm:h-80 sm:w-44"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(243,18,96,0.55) 0%, rgba(243,18,96,0.12) 60%, transparent 100%)",
                clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)",
              }}
            />
          </motion.div>

          {/* Riflettore destro */}
          <motion.div
            animate={{ rotate: [34, 18, 34] }}
            className="pointer-events-none absolute top-16 right-2 sm:right-16 origin-top"
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          >
            <SpotlightFixture className="absolute bottom-full left-1/2 -translate-x-1/2 w-9 sm:w-12 text-default-500" />
            <div
              className="h-64 w-28 sm:h-80 sm:w-44"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(243,18,96,0.55) 0%, rgba(243,18,96,0.12) 60%, transparent 100%)",
                clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)",
              }}
            />
          </motion.div>

          {/* Microfono + testo */}
          <MicIcon className="relative w-12 h-12 text-default-400" />
          <p className="relative text-lg font-semibold text-foreground text-center px-4">
            Nuove date in arrivo!
          </p>
        </div>
      )}

      {past.length > 0 && (
        <>
          <div className="flex flex-row items-center justify-center py-4 md:py-4">
            <h2 className={subtitle()}>Live passati</h2>
          </div>
          <div className="flex flex-col gap-2 mx-auto w-full max-w-4xl">
            {past.map((event) => (
              <PastEventCard key={event.slug} event={event} />
            ))}
          </div>
        </>
      )}
    </DefaultLayout>
  );
}
