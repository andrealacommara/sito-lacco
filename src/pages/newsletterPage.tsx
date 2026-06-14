import { Helmet } from "react-helmet-async";
import DefaultLayout from "@/layouts/default";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <h1 className="text-3xl font-semibold">Rimani aggiornato</h1>
        <p className="text-default-500">
          Iscriviti per essere il primo a sapere delle nuove uscite di Lacco.
        </p>
        {/* SubscribeForm verrà aggiunto nella Fase 5 */}
      </div>
    </DefaultLayout>
  );
}
