import { Helmet } from "react-helmet-async";

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

export default function LivePage() {
  const upcoming = getUpcomingLiveEvents();
  const past = getPastLiveEvents();

  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | Live</title>
        <meta
          content="Le prossime date live di Lacco: dove vederlo dal vivo e dove acquistare i biglietti."
          name="description"
        />
        <meta content="index, follow" name="robots" />
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
          <div className="flex flex-col gap-2 mx-auto w-full max-w-3xl">
            {past.map((event) => (
              <div
                key={event.slug}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 p-4 border-b border-default-200"
              >
                <span className="font-semibold">{event.title}</span>
                <span className="text-default-500 text-sm">
                  {formatEventDate(event.date)} · {event.venue}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </DefaultLayout>
  );
}
