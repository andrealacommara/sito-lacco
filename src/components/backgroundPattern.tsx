import { useEffect, useRef } from "react";

interface Wave {
  baseY: number;
  amp: number;
  freq: number;
  phase: number;
  speed: number;
}

const WAVES: Wave[] = [
  { baseY: 0.1, amp: 22, freq: 0.007, phase: 0.0, speed: 0.014 },
  { baseY: 0.22, amp: 18, freq: 0.011, phase: 1.2, speed: 0.012 },
  { baseY: 0.35, amp: 30, freq: 0.006, phase: 2.5, speed: 0.016 },
  { baseY: 0.5, amp: 26, freq: 0.009, phase: 0.8, speed: 0.013 },
  { baseY: 0.63, amp: 20, freq: 0.013, phase: 3.1, speed: 0.018 },
  { baseY: 0.76, amp: 28, freq: 0.008, phase: 1.8, speed: 0.012 },
  { baseY: 0.88, amp: 16, freq: 0.012, phase: 4.2, speed: 0.015 },
];

export function BackgroundPattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      tRef.current += 1;
      const t = tRef.current;

      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains("dark");
      const rgb = isDark ? "255,255,255" : "0,0,0";
      const alpha = isDark ? 0.12 : 0.08;

      for (const wave of WAVES) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth = 2;

        for (let x = 0; x <= w; x += 3) {
          // standing wave: shape fixed in space, amplitude pulses over time
          const primary =
            Math.sin(x * wave.freq) *
            wave.amp *
            Math.sin(t * wave.speed + wave.phase);
          // secondary harmonic adds organic complexity
          const secondary =
            Math.sin(x * wave.freq * 1.7 + 0.5) *
            wave.amp *
            0.3 *
            Math.cos(t * wave.speed * 0.6 + wave.phase + 2.1);
          const y = wave.baseY * h + primary + secondary;

          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
