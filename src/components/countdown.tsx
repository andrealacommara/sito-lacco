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

export default function Countdown({
  releaseDate,
  variant = "dark",
}: {
  releaseDate: Date;
  variant?: "dark" | "light";
}) {
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
        className="text-3xl md:text-4xl font-bold text-danger"
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
      className="flex items-center gap-1 md:gap-3"
      role="timer"
    >
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1 md:gap-3">
          <div className="flex flex-col items-center min-w-10 md:min-w-14">
            <span
              className={`text-3xl md:text-5xl font-bold tabular-nums leading-none ${variant === "light" ? "text-gray-900" : "text-white"}`}
            >
              {unit.value}
            </span>
            <span
              className={`text-[9px] md:text-[11px] font-medium tracking-widest mt-1 uppercase ${variant === "light" ? "text-gray-500" : "text-white/50"}`}
            >
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className={`text-2xl md:text-4xl font-bold pb-4 select-none ${variant === "light" ? "text-gray-300" : "text-white/40"}`}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
