// ========================== MAIN IMPORTS ========================== //
// Libraries and components used for layout, state management, images, and animations

import { section1, section2 } from "@/config/sectionsAboutPage"; // Data for AboutPage sections
import { Helmet } from "react-helmet-async"; // SEO and meta tags for the page
import DefaultLayout from "@/layouts/default"; // Base layout including navbar and footer
import { subtitle, title } from "@/components/primitives"; // Dynamic text styles for headings and subtitles
import { AboutSection } from "@/components/aboutSection"; // Component to render each section with text and image

// ========================== MAIN COMPONENT: AboutPage ========================== //
// Page structure for “Su di me”
// Renders the main title and iterates over sections from the configuration

export default function AboutPage() {
  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      {/* Dynamic title and description for SEO */}
      <Helmet>
        <title>Lacco | Su di me</title>
        <meta
          name="description"
          content="Scopri Lacco: la sua storia, il percorso musicale e la filosofia dietro la sua musica."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div>
        {/* PAGE TITLE */}
        <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
          <h1 className={title()}>Su di me</h1>
        </section>

        <div className="pb-6">
          <h2 className={subtitle()}>Raccontare l'invisibile</h2>
        </div>

        {/* SECTION 1 - Alternating layout */}
        <div className="flex flex-col gap-4">
          {section1.map((s, i) => (
            <AboutSection key={i} {...s} reversed={i % 2 === 1} />
          ))}
        </div>

        <div className="p-6">
          <h2 className={subtitle()}>Radici</h2>
        </div>

        {/* SECTION 2 - Alternating layout */}
        <div className="flex flex-col gap-4">
          {section2.map((s, i) => (
            <AboutSection key={i} {...s} reversed={(i + 1) % 2 === 1} />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
