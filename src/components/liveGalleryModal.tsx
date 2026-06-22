import type { LiveEventPhoto } from "@/config/liveEvents";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
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

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

const touchDistance = (touches: React.TouchList) =>
  Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );

// Singola slide: immagine centrata con loader (spinner) finché non è caricata.
// Supporta lo zoom (rotella/doppio-click su desktop, pinch su mobile) e il pan
// trascinando quando è zoommata. Lo stato di zoom viene riportato al modale via
// `onZoomChange` così da disattivare swipe/paginazione mentre si esplora la foto.
function Slide({
  photo,
  boundsRef,
  onZoomChange,
}: {
  photo: LiveEventPhoto;
  boundsRef: React.RefObject<HTMLDivElement | null>;
  onZoomChange: (zoomed: boolean) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [panEnabled, setPanEnabled] = useState(false);
  const [constraints, setConstraints] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const wrapElRef = useRef<HTMLDivElement>(null);
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);

  const setScale = (next: number) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    const isZoomed = clamped > 1.01;

    if (isZoomed) {
      scale.set(clamped);

      // Vincoli di pan calcolati a mano: metà dell'eccedenza dell'immagine
      // scalata rispetto al viewport, per asse. Più affidabili dei vincoli via
      // ref (con `scale` framer misura gli assi in modo asimmetrico).
      const el = wrapElRef.current;
      const bounds = boundsRef.current;

      if (el && bounds) {
        const overflowX = Math.max(
          0,
          (el.offsetWidth * clamped - bounds.clientWidth) / 2,
        );
        const overflowY = Math.max(
          0,
          (el.offsetHeight * clamped - bounds.clientHeight) / 2,
        );

        setConstraints({
          top: -overflowY,
          bottom: overflowY,
          left: -overflowX,
          right: overflowX,
        });
      }
    } else {
      // Uscendo dallo zoom la foto torna sempre centrata a 1×, con animazione.
      const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

      animate(scale, 1, spring);
      animate(x, 0, spring);
      animate(y, 0, spring);
      setConstraints({ top: 0, bottom: 0, left: 0, right: 0 });
    }

    setPanEnabled(isZoomed);
    onZoomChange(isZoomed);
  };

  const onWheel = (e: React.WheelEvent) => {
    // Solo intento verticale: lo scroll orizzontale resta paginazione.
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.stopPropagation();
    setScale(scale.get() - e.deltaY * 0.002);
  };

  const onDoubleClick = () => setScale(scale.get() > 1.01 ? 1 : 2);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStart.current = {
        dist: touchDistance(e.touches),
        scale: scale.get(),
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      e.stopPropagation();
      const ratio = touchDistance(e.touches) / pinchStart.current.dist;

      setScale(pinchStart.current.scale * ratio);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchStart.current = null;
  };

  return (
    <>
      {!loaded && (
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      )}
      <motion.div
        ref={wrapElRef}
        drag
        className="flex items-center justify-center"
        dragConstraints={constraints}
        dragElastic={0.1}
        dragListener={panEnabled}
        style={{ scale, x, y, touchAction: "none" }}
        onDoubleClick={onDoubleClick}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        onWheel={onWheel}
      >
        <SmartImage
          priority
          alt={photo.alt}
          className="pointer-events-none select-none"
          isBlurred={false}
          sizes="100vw"
          src={photo.src}
          style={{
            maxHeight: "90vh",
            maxWidth: "min(100vw - 2rem, 56rem)",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            borderRadius: "12px",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
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

  // Stato di zoom della foto corrente: quando attivo disabilita swipe, rotella
  // di paginazione e frecce, così i gesti vanno al pan dell'immagine. Il ref
  // serve ai listener nativi (wheel/keydown) per leggere il valore aggiornato
  // senza doversi ri-registrare ad ogni toggle.
  const [zoomed, setZoomed] = useState(false);
  const zoomedRef = useRef(false);

  useEffect(() => {
    zoomedRef.current = zoomed;
  }, [zoomed]);

  // Reset dello zoom al cambio foto o alla (ri)apertura del modale: si aggiusta
  // lo stato in fase di render (stesso pattern di `prevStart`) invece di un
  // effetto, per non innescare render a cascata.
  const resetKey = `${index}|${isOpen}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    if (zoomed) setZoomed(false);
  }

  useEffect(() => {
    if (!isOpen || count < 2) return;

    const onKey = (e: KeyboardEvent) => {
      if (zoomedRef.current) return;
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
      // Con la foto zoommata la rotella serve allo zoom, non alla paginazione.
      if (zoomedRef.current) return;
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
                    drag={count > 1 && !zoomed ? "x" : false}
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
                    <Slide
                      boundsRef={viewportRef}
                      photo={photo}
                      onZoomChange={setZoomed}
                    />
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
