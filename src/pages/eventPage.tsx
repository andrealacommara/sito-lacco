import type { LiveEvent } from "@/config/liveEvents";

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";

import heroLacco from "@/assets/images/lacco/heroLacco.avif";
import {
  getLiveEventBySlug,
  getOtherLiveEvents,
  isPastLiveEvent,
} from "@/config/liveEvents";
import { formatLongDate } from "@/config/date";
import SmartImage, { resolveImageSource } from "@/components/smartImage";
import Countdown from "@/components/countdown";
import LiveEventRow from "@/components/liveEventRow";
import LiveGalleryModal from "@/components/liveGalleryModal";
import YoutubeEmbed from "@/components/youtubeEmbed";
import { Logo } from "@/components/icons";
import NotFoundPage from "@/pages/notFoundPage";

// ============================ ANIMAZIONI ============================ //
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

// ============================== ICONE =============================== //
type IconProps = { className?: string };

function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={17}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={17}
    >
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={17}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={17}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MicIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={17}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={17}
    >
      <rect height="10" rx="3" width="6" x="9" y="2" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" x2="12" y1="17" y2="22" />
      <line x1="8" x2="16" y1="22" y2="22" />
    </svg>
  );
}

function TicketIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={17}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={17}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <line x1="9" x2="9" y1="6" y2="18" />
    </svg>
  );
}

function MapPinIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={17}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={17}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ============================== HELPERS ============================= //

function formatTime(date: Date): string {
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapsUrl(event: LiveEvent): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue}, ${event.address ?? event.city}`,
  )}`;
}

// ============================ HERO POSTER =========================== //
function EventHero({ event, isPast }: { event: LiveEvent; isPast: boolean }) {
  const artwork = event.poster ?? heroLacco;

  return (
    <motion.section
      {...fadeUp(0)}
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50"
    >
      {/* Sfondo atmosferico: poster sfocato a piena card */}
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
        src={resolveImageSource(artwork)}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/70 to-black/90" />

      <div className="relative flex flex-col items-center gap-6 px-6 pt-10 pb-9 sm:px-10 sm:pt-12 text-center">
        {/* Poster nitido incorniciato */}
        <motion.div
          className="w-52 sm:w-64 md:w-72 overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-2xl shadow-black/60"
          initial={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <SmartImage
            priority
            alt={`Locandina di ${event.title}`}
            src={artwork}
            style={{ aspectRatio: "1/1", objectFit: "cover" }}
            width={320}
          />
        </motion.div>

        {/* Eyebrow */}
        <div className="flex items-center gap-2 text-danger uppercase tracking-[0.28em] text-[0.7rem] font-bold">
          {isPast ? (
            <span className="h-2 w-2 rounded-full bg-danger" />
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
            </span>
          )}
          <span>{isPast ? "Live passato" : "Live"}</span>
          <span className="opacity-40">·</span>
          <span>{event.city}</span>
        </div>

        {/* Titolo */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.05] text-nowrap">
          {event.title}
        </h1>

        {/* Data + venue */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm sm:text-base font-semibold text-white [&>svg]:text-danger">
            <CalendarIcon />
            <span>{formatLongDate(event.date)}</span>
          </div>
          <p className="text-white/60 text-sm tracking-wide">
            {event.venue} · {event.city}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

// ===================== MODALITÀ "IN ARRIVO" ====================== //
function DetailRow({
  icon,
  children,
  href,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3.5 text-sm text-white/80 [&>svg]:shrink-0 [&>svg]:text-danger">
      {icon}
      <span className="min-w-0">{children}</span>
    </div>
  );

  if (href) {
    return (
      <a
        className="block transition-colors hover:bg-white/5 hover:text-white"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return content;
}

function UpcomingSection({ event }: { event: LiveEvent }) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-3xl mx-auto">
      {/* Countdown */}
      <motion.div {...fadeUp(0.1)} className="flex flex-col items-center gap-2">
        <p className="text-white/50 text-xs uppercase tracking-[0.25em] font-semibold">
          Mancano
        </p>
        <Countdown releaseDate={event.date} scaleAt="lg" variant="dark" />
      </motion.div>

      {/* CTA */}
      <motion.div
        {...fadeUp(0.2)}
        className="flex flex-col items-center gap-3 w-full max-w-md"
      >
        <Button
          aria-label="Acquista i biglietti"
          className="rounded-2xl font-semibold text-base h-14"
          size="lg"
          variant="danger"
          onPress={() =>
            window.open(event.ticketUrl, "_blank", "noopener,noreferrer")
          }
        >
          <TicketIcon />
          Acquista i biglietti
        </Button>
      </motion.div>

      {/* Dettagli */}
      <motion.div
        {...fadeUp(0.3)}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md divide-y divide-white/10 overflow-hidden"
      >
        <DetailRow icon={<ClockIcon />}>
          {event.doorsTime && (
            <>
              Ingresso{" "}
              <strong className="font-semibold">{event.doorsTime}</strong>
              <span className="mx-2 opacity-30">·</span>
            </>
          )}
          Show{" "}
          <strong className="font-semibold">{formatTime(event.date)}</strong>
        </DetailRow>
        {event.address && (
          <DetailRow href={mapsUrl(event)} icon={<MapPinIcon />}>
            {event.venue} — {event.address}
          </DetailRow>
        )}
        {event.lineup && event.lineup.length > 0 && (
          <DetailRow icon={<MicIcon />}>
            con {event.lineup.join(", ")}
          </DetailRow>
        )}
        {event.price && (
          <DetailRow icon={<TicketIcon />}>{event.price}</DetailRow>
        )}
      </motion.div>
    </div>
  );
}

// ======================= MODALITÀ "RECAP" ======================== //
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
        {children}
      </h2>
      <span className="h-1 w-10 rounded-full bg-danger" />
    </div>
  );
}

function RecapSection({ event }: { event: LiveEvent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const paragraphs = event.description?.split("\n").filter(Boolean) ?? [];
  const gallery = event.gallery ?? [];
  const videos = event.recapVideoIds ?? [];

  return (
    <div className="flex flex-col items-center gap-14 w-full max-w-4xl mx-auto">
      {/* Racconto */}
      {paragraphs.length > 0 && (
        <motion.div
          {...fadeUp(0.1)}
          className="max-w-2xl text-center text-white/80 text-base sm:text-lg leading-relaxed space-y-4"
        >
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </motion.div>
      )}

      {/* Galleria */}
      {gallery.length > 0 && (
        <motion.section {...fadeUp(0.1)} className="w-full">
          <SectionTitle>Galleria</SectionTitle>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {gallery.map((photo, i) => (
              <button
                key={i}
                className="group relative block overflow-hidden rounded-xl"
                type="button"
                onClick={() => setOpenIndex(i)}
              >
                <SmartImage
                  alt={photo.alt}
                  className="transition-transform duration-500 group-hover:scale-105"
                  sizes="240px"
                  src={photo.src}
                  style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Video */}
      {videos.length > 0 && (
        <motion.section {...fadeUp(0.1)} className="w-full">
          <SectionTitle>Video</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((id) => (
              <YoutubeEmbed
                key={id}
                title={`${event.title} — video`}
                videoId={id}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Nessun media ancora */}
      {gallery.length === 0 && videos.length === 0 && (
        <motion.div
          {...fadeUp(0.1)}
          className="flex flex-col items-center gap-3 text-center py-6"
        >
          <p className="text-white/60 max-w-sm">
            Foto e video di questo live arriveranno presto.
          </p>
        </motion.div>
      )}

      {gallery.length > 0 && (
        <LiveGalleryModal
          isOpen={openIndex !== null}
          photos={gallery}
          startIndex={openIndex ?? 0}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}

// ========================= ALTRI LIVE =========================== //
function OtherLiveSection({ events }: { events: LiveEvent[] }) {
  return (
    <motion.section {...fadeUp(0.1)} className="w-full max-w-3xl mx-auto pt-2">
      <SectionTitle>Altri live</SectionTitle>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <LiveEventRow key={event.slug} event={event} />
        ))}
      </div>
    </motion.section>
  );
}

// ============================== PAGINA ============================= //
export default function EventPage() {
  const { slug } = useParams<{ slug: string }>();
  const event = slug ? getLiveEventBySlug(slug) : undefined;

  if (!event) return <NotFoundPage />;

  const isPast = isPastLiveEvent(event);
  const otherEvents = getOtherLiveEvents(event.slug);
  const bgUrl = resolveImageSource(event.poster ?? heroLacco);
  const metaDescription =
    event.description?.replace(/\n/g, " ").trim() ||
    `${event.title} — live di Lacco a ${event.venue}, ${event.city} il ${formatLongDate(event.date)}.`;
  const pageUrl = `https://lacco.it/live/${event.slug}`;

  return (
    <>
      <Helmet>
        <title>{`${event.title} | Live | Lacco`}</title>
        <meta content={metaDescription} name="description" />
        <meta content="index, follow" name="robots" />
        <link href={pageUrl} rel="canonical" />
        <meta content="website" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content={`${event.title} | Live | Lacco`} property="og:title" />
        <meta content={metaDescription} property="og:description" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content={`${event.title} — Lacco`} property="og:image:alt" />
        <meta content={pageUrl} property="og:url" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={`${event.title} | Live | Lacco`} name="twitter:title" />
        <meta content={metaDescription} name="twitter:description" />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />
      </Helmet>

      {/* Background blur: poster a tutto schermo */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
        {bgUrl && (
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            src={bgUrl}
            style={{
              filter: "blur(48px) brightness(0.3)",
              transform: "scale(1.2)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative min-h-screen flex flex-col gap-6">
        {/* Header: logo centrato cliccabile → home */}
        <header className="flex items-center justify-center px-5 pt-6 pb-2">
          <Link
            aria-label="Torna a lacco.it"
            className="flex items-center text-white transition-colors duration-300 hover:text-danger"
            to="/"
          >
            <Logo />
          </Link>
        </header>

        <main className="flex flex-col items-center flex-1 w-full px-5 pb-16 gap-12">
          <EventHero event={event} isPast={isPast} />
          {isPast ? (
            <RecapSection event={event} />
          ) : (
            <UpcomingSection event={event} />
          )}
          {otherEvents.length > 0 && <OtherLiveSection events={otherEvents} />}
        </main>
      </div>
    </>
  );
}
