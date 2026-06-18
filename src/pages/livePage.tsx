import type { LiveEvent } from "@/config/liveEvents";

import { Card } from "@heroui/card";
import { Helmet } from "react-helmet-async";

import heroLacco from "@/assets/images/lacco/heroLacco.avif";
import { resolveImageSource } from "@/components/smartImage";
import DefaultLayout from "@/layouts/default";
import { subtitle, title } from "@/components/primitives";
import LiveEventCard from "@/components/liveEventCard";
import { getPastLiveEvents, getUpcomingLiveEvents } from "@/config/liveEvents";

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
        <p className="text-center text-default-500 py-8">
          Nuove date in arrivo, resta sintonizzato!
        </p>
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
