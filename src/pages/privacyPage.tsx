import { Helmet } from "react-helmet-async";

import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function PrivacyPage() {
  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | Privacy Policy</title>
        <meta
          content="Informativa sul trattamento dei dati personali raccolti tramite la newsletter di Lacco."
          name="description"
        />
        <meta content="index, follow" name="robots" />
        <link href="https://lacco.it/privacy" rel="canonical" />
        <meta content="website" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content="Lacco | Privacy Policy" property="og:title" />
        <meta
          content="Informativa sul trattamento dei dati personali raccolti tramite la newsletter di Lacco."
          property="og:description"
        />
        <meta content="https://lacco.it/privacy" property="og:url" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content="Lacco — Cantautore" property="og:image:alt" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Lacco | Privacy Policy" name="twitter:title" />
        <meta
          content="Informativa sul trattamento dei dati personali raccolti tramite la newsletter di Lacco."
          name="twitter:description"
        />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />
      </Helmet>

      <div className="flex flex-col items-center py-8 md:py-10 mx-auto w-full max-w-4xl px-4">
        <div className="w-full max-w-2xl">
          <h1 className={`${title()} text-center block mb-10`}>
            Privacy Policy
          </h1>

          <div className="flex flex-col gap-8 text-default-700 text-sm leading-relaxed">
            <Section title="Titolare del trattamento">
              <p>
                Andrea La Commara (in arte <strong>Lacco</strong>)<br />
                Email:{" "}
                <a
                  className="text-primary hover:underline"
                  href="mailto:management@lacco.it"
                >
                  management@lacco.it
                </a>
              </p>
            </Section>

            <Section title="Dati raccolti">
              <p>
                Tramite il modulo di iscrizione alla newsletter vengono
                raccolti:
              </p>
              <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
                <li>Indirizzo email (obbligatorio)</li>
                <li>Nome (facoltativo)</li>
              </ul>
            </Section>

            <Section title="Finalità del trattamento">
              <p>
                I dati sono trattati esclusivamente per l&apos;invio di
                aggiornamenti sulle uscite musicali, eventi e notizie relative a
                Lacco.
              </p>
            </Section>

            <Section title="Base giuridica">
              <p>
                Il trattamento si basa sul consenso esplicito
                dell&apos;interessato (art. 6, par. 1, lett. a del Regolamento
                UE 2016/679 — GDPR), prestato al momento dell&apos;iscrizione.
              </p>
            </Section>

            <Section title="Conservazione dei dati">
              <p>
                I dati sono conservati fino alla revoca del consenso da parte
                dell&apos;interessato. È possibile disiscriversi in qualsiasi
                momento tramite il link presente in ogni email o scrivendo a{" "}
                <a
                  className="text-primary hover:underline"
                  href="mailto:management@lacco.it"
                >
                  management@lacco.it
                </a>
                .
              </p>
            </Section>

            <Section title="Responsabile del trattamento">
              <p>
                I dati sono archiviati su infrastruttura fornita da{" "}
                <strong>Supabase Inc.</strong>, con server situati
                nell&apos;Unione Europea. Supabase agisce in qualità di
                responsabile del trattamento ai sensi dell&apos;art. 28 GDPR.
              </p>
            </Section>

            <Section title="Diritti dell'interessato">
              <p>
                In conformità agli artt. 15–22 del GDPR, l&apos;interessato ha
                diritto di:
              </p>
              <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
                <li>Accedere ai propri dati personali</li>
                <li>Richiederne la rettifica o la cancellazione</li>
                <li>Opporsi al trattamento</li>
                <li>Richiedere la portabilità dei dati</li>
                <li>Revocare il consenso in qualsiasi momento</li>
              </ul>
              <p className="mt-3">
                Per esercitare questi diritti, scrivere a{" "}
                <a
                  className="text-primary hover:underline"
                  href="mailto:management@lacco.it"
                >
                  management@lacco.it
                </a>
                .
              </p>
            </Section>

            <Section title="Reclami">
              <p>
                L&apos;interessato ha il diritto di proporre reclamo al{" "}
                <strong>Garante per la Protezione dei Dati Personali</strong> (
                <a
                  className="text-primary hover:underline"
                  href="https://www.garanteprivacy.it"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  garanteprivacy.it
                </a>
                ).
              </p>
            </Section>

            <p className="text-xs text-default-400 pt-4 border-t border-default-200">
              Ultimo aggiornamento: giugno 2026
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

function Section({
  title: sectionTitle,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-semibold text-foreground text-base mb-2">
        {sectionTitle}
      </h2>
      {children}
    </div>
  );
}
