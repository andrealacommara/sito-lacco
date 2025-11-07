import { motion } from "framer-motion";
import { Image } from "@heroui/image";
import { useEffect, useRef, useState } from "react";

import aboutPic1 from "@/assets/images/lacco/aboutPic1.jpg";
import aboutPic2 from "@/assets/images/lacco/aboutPic2.jpg";
import aboutPic3 from "@/assets/images/lacco/aboutPic3.jpg";
import DefaultLayout from "@/layouts/default";
import { subtitle, title } from "@/components/primitives";
import { Card, Skeleton } from "@heroui/react";

const sections = [
  {
    text: "Sono Andrea, ma tutti mi chiamano Lacco. Sono nato nel ‘99 a Torino ed ho iniziato a fare musica sotto il nome di “Checkmate“, un progetto che mi ha permesso di capire chi sono e cosa voglio.",
    image: aboutPic1,
  },
  {
    text: "Con il tempo, brano dopo brano, ho costruito la mia identità. O meglio, ho ritrovato la mia identità. In quel momento ho capito che non dovevo essere altro che me.",
    image: aboutPic2,
  },
  {
    text: "La mia musica parla alle persone che sanno ascoltare, che sanno ascoltarsi. Persone che possono essere tutto, ma non sono niente, nient'altro che loro. La mia musica parla a chi vede oltre le parole.",
    image: aboutPic3,
  },
];

function useInView(ref: React.RefObject<HTMLDivElement>, threshold = 0.2) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, threshold]);

  return isInView;
}

function AboutSection({
  text,
  image,
  reversed = false,
}: {
  text: string;
  image: string;
  reversed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: reversed ? 100 : -100 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card
        className={`flex flex-col-reverse md:flex-row ${
          reversed ? "md:flex-row-reverse" : ""
        } items-center md:items-center justify-center md:justify-center p-2 md:p-4 gap-2 md:gap-4 mx-auto  w-full max-w-5xl`}
      >
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}
        <div className="p-2 md:p-4">
          <h1 className={subtitle()}>{text}</h1>
        </div>
        <div className="p-4 md:p-4 w-fit md:w-full items-center">
          <Image
            src={image}
            alt="Lacco"
            className="item-center"
            width={400}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </Card>
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <DefaultLayout>
      <div>
        <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
          <h1 className={title()}>Su di me</h1>
        </section>
        <div className="flex flex-col gap-4">
          {sections.map((s, i) => (
            <AboutSection key={i} {...s} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
