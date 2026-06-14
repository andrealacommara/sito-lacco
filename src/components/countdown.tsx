import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

export default function Countdown({ releaseDate }: { releaseDate: Date }) {
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
      <motion.p
        animate={{ opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-danger"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        Uscita oggi!
      </motion.p>
    );
  }

  const units = [
    { label: "GIORNI", value: pad(timeLeft.days) },
    { label: "ORE", value: pad(timeLeft.hours) },
    { label: "MIN", value: pad(timeLeft.minutes) },
    { label: "SEC", value: pad(timeLeft.seconds) },
  ];

  return (
    <div className="flex items-center gap-1 md:gap-3" role="timer" aria-live="off">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1 md:gap-3">
          <div className="flex flex-col items-center min-w-[2.5rem] md:min-w-[3.5rem]">
            <span className="text-3xl md:text-5xl font-bold text-white tabular-nums leading-none">
              {unit.value}
            </span>
            <span className="text-[9px] md:text-[11px] text-white/50 font-medium tracking-widest mt-1 uppercase">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl md:text-4xl font-bold text-white/40 pb-4 select-none">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
