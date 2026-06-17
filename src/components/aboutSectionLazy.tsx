import { lazy, Suspense } from "react";

// Lazy-load AboutSection with Framer Motion — only when user navigates to /chi-sono
const AboutSectionLazy = lazy(() => import("@/components/aboutSection").then(m => ({ default: m.AboutSection })));

// Fallback component without animations
function AboutSectionFallback({ text, image, reversed }: any) {
  return (
    <div className={`overflow-x-hidden px-4 py-6`}>
      <div
        className={`relative overflow-hidden flex flex-col md:flex-row ${
          reversed ? "md:flex-row-reverse" : ""
        } items-center justify-center p-6 md:p-8 gap-8 mx-auto w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-lg`}
      >
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
          src={image.src || image}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative shrink-0 flex justify-center">
          <img
            alt="Lacco"
            className="w-full max-w-xs md:max-w-full rounded-lg"
            src={image.src || image}
            style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
          />
        </div>
        <p className="relative text-large md:text-2xl text-white/90 leading-relaxed text-left">
          {text.split(". ").map((sentence: string, i: number, arr: string[]) => (
            <span key={i} className="block">
              {sentence}{i < arr.length - 1 ? "." : ""}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export function AboutSectionWithLazy(props: any) {
  return (
    <Suspense fallback={<AboutSectionFallback {...props} />}>
      <AboutSectionLazy {...props} />
    </Suspense>
  );
}
