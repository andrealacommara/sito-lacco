import type { LiveEvent } from "@/config/liveEvents";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

import heroLacco from "@/assets/images/lacco/heroLacco.avif";
import Countdown from "@/components/countdown";
import SmartImage, { resolveImageSource } from "@/components/smartImage";

type Props = {
  event: LiveEvent;
};

export default function LiveEventCard({ event }: Props) {
  const artwork = event.poster ?? heroLacco;

  return (
    <Card className="flex flex-col md:flex-row items-center justify-center p-6 md:p-8 gap-6 mx-auto w-full max-w-5xl md:max-w-fit">
      {/* Blurred backdrop — fixed dark scrim keeps text readable regardless of poster colors */}
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
        src={resolveImageSource(artwork)}
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative shrink-0 flex items-center justify-center">
        <SmartImage
          isBlurred
          priority
          alt={`Locandina di ${event.title}`}
          sizes="320px"
          src={artwork}
          style={{ aspectRatio: "1/1", objectFit: "cover" }}
          width={320}
        />
      </div>

      <div className="relative flex flex-col items-center gap-4 text-center rounded-2xl border border-white/10 bg-black/35 p-4 md:p-6 backdrop-blur-md">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {event.title}
          </h1>
          <p className="text-white/70 text-sm tracking-widest font-medium">
            {event.venue} · {event.city}
          </p>
        </div>

        <Countdown releaseDate={event.date} variant="dark" />

        <div className="text-white/70 text-sm space-y-1">
          {event.address && <p>{event.address}</p>}
          <p>
            {event.doorsTime && `Apertura porte ${event.doorsTime} · `}
            Inizio show{" "}
            {event.date.toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {event.lineup && event.lineup.length > 0 && (
            <p>Special guest: {event.lineup.join(", ")}</p>
          )}
          {event.price && <p>{event.price}</p>}
        </div>

        <Button
          aria-label="Compra i biglietti"
          className="font-semibold px-8"
          color="danger"
          size="lg"
          onPress={() =>
            window.open(event.ticketUrl, "_blank", "noopener,noreferrer")
          }
        >
          Compra i biglietti
        </Button>
      </div>
    </Card>
  );
}
