import { Helmet } from "react-helmet-async";

import DefaultLayout from "@/layouts/default";
import SubscribeForm from "@/components/subscribeForm";
import { title } from "@/components/primitives";

export default function NewsletterPage() {
  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | Newsletter</title>
        <meta
          content="Iscriviti alla newsletter di Lacco per ricevere aggiornamenti su nuove uscite, date live e novità dal cantautore R&B e Hip-Hop."
          name="description"
        />
        <meta content="index, follow" name="robots" />
        <link href="https://lacco.it/newsletter" rel="canonical" />
        <meta content="website" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content="Lacco | Newsletter" property="og:title" />
        <meta
          content="Iscriviti per ricevere aggiornamenti su nuove uscite, date live e novità da Lacco, cantautore R&B e Hip-Hop."
          property="og:description"
        />
        <meta content="https://lacco.it/newsletter" property="og:url" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content="Lacco — Cantautore" property="og:image:alt" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Lacco | Newsletter" name="twitter:title" />
        <meta
          content="Iscriviti per ricevere aggiornamenti su nuove uscite, date live e novità da Lacco."
          name="twitter:description"
        />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />
      </Helmet>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mx-auto w-full max-w-4xl px-4">
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className={title()}>Newsletter</h1>
          <p className="text-default-500 mt-3 mb-8">
            Iscriviti per essere il primo a sapere tutte le novità su Lacco.
          </p>
          <SubscribeForm source="newsletter_form" />
        </div>
      </div>
    </DefaultLayout>
  );
}
