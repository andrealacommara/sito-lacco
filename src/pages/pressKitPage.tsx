// ========================== MAIN IMPORTS ========================== //
// Import style functions, layout, and custom components for the “PressKit” page.
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Helmet } from "react-helmet-async";

export default function PressKitPage() {
  return (
    <DefaultLayout>
      <Helmet>
        {/* Prevent indexing (private page) */}
        <meta name="robots" content="noindex, nofollow" />
        <title>Lacco | Press Kit</title>
      </Helmet>

      {/* ========================== INTRO SECTION ========================== */}
      <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Press Kit</h1>
      </section>

      {/* ============================ HERO SECTION ============================ */}
      <section id="presskit-hero">
        {/* TODO: Header with official image + logo */}
      </section>

      {/* ============================ BIO SECTION ============================= */}
      <section id="presskit-bio">{/* TODO: Complete bio + short bio */}</section>

      {/* ============================ HIGHLIGHTS ============================== */}
      <section id="presskit-highlights">
        {/* TODO: numbers, sound, mood, inspirations */}
      </section>

      {/* ============================ DISCOGRAPHY ============================ */}
      <section id="presskit-discography">
        {/* TODO: CardSongExposer (press version) */}
      </section>

      {/* ============================ PHOTOS ================================= */}
      <section id="presskit-photos">
        {/* TODO: Grid images + download .zip */}
      </section>

      {/* ============================ CONTACTS =============================== */}
      <section id="presskit-contacts">
        {/* TODO: Contacts, social, professional e-mail */}
      </section>
    </DefaultLayout>
  );
}
