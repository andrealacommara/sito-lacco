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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className={title({ size: "md" })}>Rimani aggiornato</h1>
          <p className="text-default-500 max-w-sm">
            Iscriviti per essere il primo a sapere delle nuove uscite, date e
            aggiornamenti di Lacco.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <SubscribeForm source="newsletter_form" />
        </div>
      </div>
    </DefaultLayout>
  );
}
