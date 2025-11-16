// ========================== MAIN IMPORTS ========================== //
import { useEffect, useRef, useState } from "react"; // React Hooks

// ========================== COMPONENT ========================== //
// Count from 0 to the end number one time when in the viewport.
interface CountUpProps {
  end: number;
  duration?: number; // ms
}

export default function CountUp({ end, duration = 1500 }: CountUpProps) {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false); // prevent reruns
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          setHasAnimated(true); // block future animations

          let start = 0;
          const increment = end / (duration / 16);

          const counter = setInterval(() => {
            start += increment;
            if (start >= end) {
              start = end;
              clearInterval(counter);
            }
            setValue(Math.floor(start));
          }, 16);

          observer.disconnect();
        }
      },
      { threshold: 0.3 } // 30% visibility required
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={ref}>{value.toLocaleString("it-IT")}</span>;
}
