// ========================== MAIN IMPORTS ========================== //
// Import style functions, layout, and custom components for the “PressKit” page.
import DefaultLayout from "@/layouts/default";
import { Helmet } from "react-helmet-async";

export default function PressKitPage() {
  return (
    <DefaultLayout>
      <Helmet>
        {/* Prevent indexing (private page) */}
        <meta name="robots" content="noindex, nofollow" />
        <title>Press Kit</title>
      </Helmet>

      <div className="flex flex-col gap-20 px-4 py-10 md:px-8 lg:px-16">
        {/* ============================ HERO SECTION ============================ */}
        <section id="presskit-hero">
          {/* TODO: Header con foto ufficiale + logo */}
          <h1 className="text-4xl font-bold tracking-tight">Press Kit</h1>
        </section>

        {/* ============================ BIO SECTION ============================= */}
        <section id="presskit-bio">
          {/* TODO: Bio lunga + bio breve */}
        </section>

        {/* ============================ HIGHLIGHTS ============================== */}
        <section id="presskit-highlights">
          {/* TODO: numeri, sound, mood, influenze */}
        </section>

        {/* ============================ DISCOGRAPHY ============================ */}
        <section id="presskit-discography">
          {/* TODO: Cards brani, come il componente CardSongExposer (versione press) */}
        </section>

        {/* ============================ PHOTOS ================================= */}
        <section id="presskit-photos">
          {/* TODO: Grid immagini + download ZIP */}
        </section>

        {/* ============================ CONTACTS =============================== */}
        <section id="presskit-contacts">
          {/* TODO: Contatti, social, email professionale */}
        </section>
      </div>
    </DefaultLayout>
  );
}
