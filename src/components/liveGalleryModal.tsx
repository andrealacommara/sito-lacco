import type { LiveEventPhoto } from "@/config/liveEvents";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalBody,
} from "@heroui/react";

import SmartImage, { resolveImageSource } from "@/components/smartImage";

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={26}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={26}
    >
      {dir === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={20}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={20}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={18}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={18}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

// Singola slide: immagine centrata con loader (spinner) finché non è caricata.
function Slide({ photo }: { photo: LiveEventPhoto }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      )}
      <SmartImage
        priority
        alt={photo.alt}
        className="pointer-events-none select-none"
        isBlurred={false}
        sizes="100vw"
        src={photo.src}
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: "12px",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

const arrowBtn =
  "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 h-12 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95";

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;
const SWIPE_THRESHOLD = 10000;

interface LiveGalleryModalProps {
  photos: LiveEventPhoto[];
  startIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

// Lightbox della gallery: solo la foto grande sul fondo scurito (niente card).
// Scorrimento in stile galleria del telefono (drag/swipe con snap) + frecce su
// desktop e tastiera; loader sulle immagini; piccolo tasto download.
export default function LiveGalleryModal({
  photos,
  startIndex,
  isOpen,
  onClose,
}: LiveGalleryModalProps) {
  const count = photos.length;
  const viewportRef = useRef<HTMLDivElement>(null);

  // `page` può eccedere [0,count): l'indice reale è il modulo. `direction`
  // serve alle animazioni di entrata/uscita.
  const [[page, direction], setPage] = useState<[number, number]>([
    startIndex,
    0,
  ]);
  const [prevStart, setPrevStart] = useState(startIndex);

  if (startIndex !== prevStart) {
    setPrevStart(startIndex);
    setPage([startIndex, 0]);
  }

  const index = ((page % count) + count) % count;

  useEffect(() => {
    if (!isOpen || count < 2) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPage(([p]) => [p + 1, 1]);
      else if (e.key === "ArrowLeft") setPage(([p]) => [p - 1, -1]);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, count]);

  // Pre-carica e pre-decodifica le foto adiacenti (successiva/precedente), così
  // quando ci si arriva scorrendo sono già pronte e non si vede il render
  // parziale ("bande verticali") durante l'animazione di slide.
  useEffect(() => {
    if (!isOpen || count < 2) return;

    const neighbors = [
      photos[(index + 1) % count],
      photos[(index - 1 + count) % count],
    ];

    for (const p of neighbors) {
      if (!p) continue;
      const im = new Image();

      im.src = resolveImageSource(p.src);
      im.decode?.().catch(() => {});
    }
  }, [isOpen, index, count, photos]);

  // Scroll orizzontale (trackpad o shift+rotella) per cambiare foto, oltre allo
  // swipe touch. Un gesto = una foto: blocco fino a quando lo scroll si ferma
  // (~150ms senza eventi) per non saltare più foto con l'inerzia del trackpad.
  useEffect(() => {
    if (!isOpen || count < 2) return;

    const el = viewportRef.current;

    if (!el) return;

    let locked = false;
    let endTimer: number | undefined;

    const onWheel = (e: WheelEvent) => {
      // Solo intento orizzontale: ignora lo scroll prevalentemente verticale.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      e.preventDefault();

      window.clearTimeout(endTimer);
      endTimer = window.setTimeout(() => {
        locked = false;
      }, 150);

      if (locked || Math.abs(e.deltaX) < 20) return;

      locked = true;
      const dir = e.deltaX > 0 ? 1 : -1;

      setPage(([p]) => [p + dir, dir]);
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(endTimer);
    };
  }, [isOpen, count]);

  const photo = photos[index];

  if (!photo) return null;

  const paginate = (dir: number) => setPage(([p]) => [p + dir, dir]);

  return (
    <ModalBackdrop
      isDismissable
      isOpen={isOpen}
      variant="blur"
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <ModalContainer
        className="flex items-center justify-center w-full max-w-none px-4"
        placement="center"
      >
        <ModalDialog
          aria-label={`Foto ${index + 1} di ${count}`}
          className="bg-transparent shadow-none w-auto max-w-none p-0"
        >
          <ModalBody className="overflow-hidden p-0">
            <div
              className="relative mx-auto flex flex-col"
              style={{ width: "min(100vw - 2rem, 56rem)", height: "90vh" }}
            >
              {/* Viewport dello slider */}
              <div
                ref={viewportRef}
                className="relative w-full flex-1 min-h-0 overflow-hidden"
              >
                <AnimatePresence custom={direction} initial={false}>
                  <motion.div
                    key={page}
                    animate="center"
                    className="absolute inset-0 flex items-center justify-center"
                    custom={direction}
                    drag={count > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.9}
                    exit="exit"
                    initial="enter"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    variants={variants}
                    onDragEnd={(_, { offset, velocity }) => {
                      const power = swipePower(offset.x, velocity.x);

                      if (power < -SWIPE_THRESHOLD) paginate(1);
                      else if (power > SWIPE_THRESHOLD) paginate(-1);
                    }}
                  >
                    <Slide photo={photo} />
                  </motion.div>
                </AnimatePresence>

                {/* Chiudi: X in alto a destra sulla foto */}
                <button
                  aria-label="Chiudi"
                  className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95"
                  type="button"
                  onClick={onClose}
                >
                  <CloseIcon />
                </button>

                {/* Download: stesso stile della X, in alto a sinistra */}
                <a
                  download
                  aria-label="Scarica la foto"
                  className="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95"
                  href={photo.downloadUrl}
                >
                  <DownloadIcon />
                </a>

                {count > 1 && (
                  <>
                    <button
                      aria-label="Foto precedente"
                      className={`${arrowBtn} left-2`}
                      type="button"
                      onClick={() => paginate(-1)}
                    >
                      <ChevronIcon dir="left" />
                    </button>
                    <button
                      aria-label="Foto successiva"
                      className={`${arrowBtn} right-2`}
                      type="button"
                      onClick={() => paginate(1)}
                    >
                      <ChevronIcon dir="right" />
                    </button>
                    <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
                      {index + 1} / {count}
                    </span>
                  </>
                )}
              </div>
            </div>
          </ModalBody>
        </ModalDialog>
      </ModalContainer>
    </ModalBackdrop>
  );
}
