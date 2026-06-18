// ========================== MAIN IMPORTS ========================== //
// Libraries and components used for layout, state management, images, and animations

import { Helmet } from "react-helmet-async"; // SEO and meta tags for the page

import { section1, section2 } from "@/config/sectionsAboutPage"; // Data for AboutPage sections
import DefaultLayout from "@/layouts/default"; // Base layout including navbar and footer
import { subtitle, title } from "@/components/primitives"; // Dynamic text styles for headings and subtitles
import { AboutSection } from "@/components/aboutSection";

// ========================== MAIN COMPONENT: AboutPage ========================== //
// Page structure for “Chi sono”
// Renders the main title and iterates over sections from the configuration

export default function AboutPage() {
  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      {/* Dynamic title and description for SEO */}
      <Helmet>
        <title>Lacco | Chi sono</title>
        <meta
          content="Scopri chi è Lacco: cantautore italiano di R&B e Hip-Hop. La sua storia, il percorso musicale e la filosofia dietro ogni canzone."
          name="description"
        />
        <meta content="index, follow" name="robots" />
        <link href="https://lacco.it/chi-sono" rel="canonical" />
        <meta content="profile" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content="Lacco | Chi sono" property="og:title" />
        <meta
          content="Scopri chi è Lacco: cantautore italiano di R&B e Hip-Hop. La sua storia, il percorso musicale e la filosofia dietro ogni canzone."
          property="og:description"
        />
        <meta content="https://lacco.it/chi-sono" property="og:url" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content="Lacco — Cantautore" property="og:image:alt" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Lacco | Chi sono" name="twitter:title" />
        <meta
          content="Scopri chi è Lacco: cantautore italiano di R&B e Hip-Hop."
          name="twitter:description"
        />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />
      </Helmet>

      <div>
        {/* PAGE TITLE */}
        <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
          <h1 className={title()}>Chi sono</h1>
        </section>

        <div className="pb-2">
          <h2 className={subtitle()}>Raccontare l&apos;invisibile</h2>
        </div>

        {/* SECTION 1 - Alternating layout */}
        <div className="flex flex-col">
          {section1.map((s, i) => (
            <AboutSection key={i} {...s} reversed={i % 2 === 1} />
          ))}
        </div>

        <div className="pt-6 pb-2">
          <h2 className={subtitle()}>Radici</h2>
        </div>

        {/* SECTION 2 - Alternating layout */}
        <div className="flex flex-col">
          {section2.map((s, i) => (
            <AboutSection key={i} {...s} reversed={(i + 1) % 2 === 1} />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
