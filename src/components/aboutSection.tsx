import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Card } from "@heroui/card";

import SmartImage, {
  resolveImageSource,
  type ImageLikeImport,
} from "./smartImage";

function useInView(
  ref: React.RefObject<HTMLDivElement | null>,
  threshold = 0.1,
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, threshold]);

  return isInView;
}

export function AboutSection({
  text,
  image,
  reversed = false,
}: {
  text: string;
  image: ImageLikeImport;
  reversed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <div ref={ref} className="overflow-x-hidden px-4 py-6">
      <Card
        className={`relative overflow-hidden flex flex-col md:flex-row ${
          reversed ? "md:flex-row-reverse" : ""
        } items-center justify-center p-6 md:p-8 gap-8 mx-auto w-full max-w-4xl`}
      >
        {/* Blurred photo backdrop */}
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
          src={resolveImageSource(image)}
        />
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          className="relative shrink-0 flex justify-center"
          initial={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <SmartImage
            alt="Lacco"
            className="w-full max-w-xs md:max-w-full"
            src={image}
            style={{ aspectRatio: "1 / 1" }}
            width={350}
          />
        </motion.div>

        <motion.p
          animate={inView ? { opacity: 1, x: 0 } : {}}
          className="relative text-large md:text-2xl text-white/90 leading-relaxed text-left"
          initial={{ opacity: 0, x: reversed ? -80 : 80 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {text.split(". ").map((sentence, i, arr) => (
            <span key={i} className="block">
              {sentence}
              {i < arr.length - 1 ? "." : ""}
            </span>
          ))}
        </motion.p>
      </Card>
    </div>
  );
}
