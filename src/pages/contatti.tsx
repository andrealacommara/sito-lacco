// ========================== IMPORT DIPENDENZE PRINCIPALI ========================== //
// Importa gli elementi essenziali per il form di contatto, la gestione dello stato e il layout generale.

import emailjs from "@emailjs/browser"; // Libreria per l'invio di email lato client
import { Form, Input, Button, Textarea, addToast } from "@heroui/react"; // Componenti UI forniti da HeroUI
import { useState } from "react"; // Hook per la gestione dello stato locale del componente
import { Helmet } from "react-helmet-async"; // <--- Import di Helmet per SEO e meta tag

import DefaultLayout from "@/layouts/default"; // Layout principale del sito (Navbar + Footer)
import { title } from "@/components/primitives"; // Stile tipografico predefinito per i titoli

// ========================== COMPONENTE PAGINA CONTATTI ========================== //
// Gestisce il form di contatto, l'invio dei messaggi tramite EmailJS e il feedback all'utente.

export default function DocsPage() {
  // Stato del form — mantiene i valori dei campi inseriti dall'utente.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // ========================== FUNZIONE DI RESET ========================== //
  // Permette di svuotare uno o più campi del form, a seconda del parametro ricevuto.
  const formReset = (data: string) => {
    if (data === "name") {
      setFormData({ ...formData, name: "" });
      return;
    }
    if (data === "email") {
      setFormData({ ...formData, email: "" });
      return;
    }
    if (data === "message") {
      setFormData({ ...formData, message: "" });
      return;
    }
    if (data === "all") setFormData({ name: "", email: "", message: "" });
  };

  // ========================== CONFIGURAZIONE EMAILJS ========================== //
  // Le chiavi vengono lette dalle variabili d’ambiente definite nel file `.env` (per il locale) o su GitHub Action.
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // ========================== INVIO EMAIL ========================== //
  // Gestisce la chiamata asincrona a EmailJS e mostra notifiche di successo o errore.
  const [isLoading, setLoading] = useState(false);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previene il refresh della pagina
    setLoading(true);

    try {
      // Invio del messaggio tramite EmailJS
      await emailjs.send(serviceId, templateId, formData, publicKey);

      // Notifica di successo
      addToast({
        title: "Messaggio inviato con successo!",
        description: "Riceverai una risposta al più presto.",
        timeout: 5000,
        color: "success",
        variant: "flat",
        radius: "lg",
      });

      // Pulizia dei campi dopo l’invio
      formReset("all");
    } catch (e) {
      console.error("error: ", e);
      // Notifica di errore
      addToast({
        title: "Errore durante l'invio del messaggio.",
        description:
          "Si è verificato un errore. Per favore, riprova più tardi.",
        timeout: 5000,
        color: "danger",
        variant: "flat",
        radius: "lg",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================== RENDER COMPONENTE ========================== //
  // Include layout generale, titolo, form e pulsanti di invio/reset.

  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      <Helmet>
        <title>Lacco | Contatti</title>
        <meta
          name="description"
          content="Contatta Lacco per collaborazioni, informazioni o semplicemente per lasciare un messaggio."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mx-auto w-full max-w-5xl">
        {/* Contenitore centrale del form */}
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className={`${title()}`}>Contatti</h1>

          {/* FORM PRINCIPALE */}
          <Form
            className="w-full space-y-6 justify-around"
            onReset={() => formReset("all")} // Reset completo
            onSubmit={sendEmail} // Invio del form
          >
            {/* Campi nome ed email, affiancati su desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
              <Input
                isRequired
                label="Nome"
                labelPlacement="outside"
                name="name"
                placeholder="Inserisci il tuo nome"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onClear={() => formReset("name")}
              />

              <Input
                isRequired
                label="Email"
                labelPlacement="outside"
                name="email"
                placeholder="Inserisci la tua email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onClear={() => formReset("email")}
              />
            </div>

            {/* Campo testo per il messaggio */}
            <Textarea
              isRequired
              label="Messaggio"
              minRows={5}
              placeholder="Inserisci il tuo messaggio qui"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              onClear={() => formReset("message")}
            />

            {/* Pulsanti di invio e reset */}
            <div className="flex flex-col md:flex-row gap-2 w-full md:justify-center">
              <Button
                className="w-full sm:w-auto"
                color="primary"
                isLoading={isLoading}
                type="submit"
              >
                {isLoading ? "Invio..." : "Invia"}
              </Button>

              <Button
                className="w-full sm:w-auto"
                type="reset"
                variant="bordered"
              >
                Pulisci
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </DefaultLayout>
  );
}
