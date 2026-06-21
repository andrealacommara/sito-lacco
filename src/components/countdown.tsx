import { useState, useEffect } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function hasReleased(releaseDate: Date): boolean {
  return getTimeLeft(releaseDate) === null;
}

// `scaleAt` controlla a quale breakpoint il countdown passa alle dimensioni
// grandi. Le card lo usano con "lg" perché su tablet il pannello info è stretto
// (resterebbe compatto fino a 1024px); releasePage usa il default "md".
const SCALE = {
  md: {
    gap: "gap-0.5 xs:gap-1 md:gap-3",
    unit: "min-w-8 xs:min-w-10 md:min-w-14",
    num: "text-2xl xs:text-3xl md:text-5xl",
    colon: "text-xl xs:text-2xl md:text-4xl",
    label: "text-[8px] xs:text-[9px] md:text-[11px]",
    today: "text-2xl xs:text-3xl md:text-4xl",
  },
  lg: {
    gap: "gap-0.5 sm:gap-1 lg:gap-3",
    unit: "min-w-7 xs:min-w-8 sm:min-w-10 lg:min-w-14",
    num: "text-xl xs:text-2xl sm:text-3xl lg:text-5xl",
    colon: "text-base xs:text-xl sm:text-2xl lg:text-4xl",
    label: "text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[11px]",
    today: "text-xl xs:text-2xl sm:text-3xl lg:text-4xl",
  },
} as const;

export default function Countdown({
  releaseDate,
  variant = "dark",
  scaleAt = "md",
}: {
  releaseDate: Date;
  variant?: "dark" | "light";
  scaleAt?: "md" | "lg";
}) {
  const s = SCALE[scaleAt];
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    getTimeLeft(releaseDate),
  );

  useEffect(() => {
    if (timeLeft === null) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(releaseDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseDate, timeLeft]);

  if (timeLeft === null) {
    return (
      <p
        className={`${s.today} font-bold text-danger`}
        style={{ animation: "fadeIn 0.5s ease both" }}
      >
        Uscita oggi!
      </p>
    );
  }

  const units = [
    { label: "GIORNI", value: pad(timeLeft.days) },
    { label: "ORE", value: pad(timeLeft.hours) },
    { label: "MIN", value: pad(timeLeft.minutes) },
    { label: "SEC", value: pad(timeLeft.seconds) },
  ];

  return (
    <div
      aria-live="off"
      className={`flex items-center ${s.gap}`}
      role="timer"
    >
      {units.map((unit, i) => (
        <div key={unit.label} className={`flex items-center ${s.gap}`}>
          <div className={`flex flex-col items-center ${s.unit}`}>
            <span
              className={`${s.num} font-bold tabular-nums leading-none ${variant === "light" ? "text-gray-900" : "text-white"}`}
            >
              {unit.value}
            </span>
            <span
              className={`${s.label} font-medium tracking-widest mt-1 uppercase ${variant === "light" ? "text-gray-500" : "text-white/50"}`}
            >
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className={`${s.colon} font-bold pb-4 select-none ${variant === "light" ? "text-gray-300" : "text-white/40"}`}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
