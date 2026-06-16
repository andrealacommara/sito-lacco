import { Helmet } from "react-helmet-async";

import DefaultLayout from "@/layouts/default";
import SubscribeForm from "@/components/subscribeForm";
import { title } from "@/components/primitives";

export default function NewsletterPage() {
  return (
    <DefaultLayout>
      <Helmet>
        <title>Iscriviti | Lacco</title>
        <meta
          content="Iscriviti per ricevere aggiornamenti sulle nuove uscite di Lacco."
          name="description"
        />
        <meta content="index, follow" name="robots" />
      </Helmet>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mx-auto w-full max-w-5xl px-4">
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
