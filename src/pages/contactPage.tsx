// ========================== MAIN IMPORTS ========================== //
// Essential libraries and components for the contact form, state management, and layout

import { useState } from "react"; // React hook for local state management
import { Helmet } from "react-helmet-async"; // SEO and meta tags
import {
  Form,
  TextField,
  Label,
  Input,
  TextArea,
  Button,
  Spinner,
  toast,
} from "@heroui/react"; // HeroUI v3 components

import DefaultLayout from "@/layouts/default"; // Main site layout (Navbar + Footer)
import { title } from "@/components/primitives"; // Predefined typography style for page titles

// ========================== CONTACT PAGE COMPONENT ========================== //
// Manages the contact form, sending messages via the send-contact-email Edge Function, and user feedback

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isLoading, setLoading] = useState(false);
  const MIN_MESSAGE_LENGTH = 10;

  // ========================== FORM RESET FUNCTION ========================== //
  const formReset = (field: string) => {
    if (field === "all")
      return setFormData({ name: "", email: "", message: "" });
    setFormData({ ...formData, [field]: "" });
  };

  // ========================== SEND EMAIL FUNCTION ========================== //
  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      toast.warning("Nome obbligatorio.", {
        description: "Inserisci il tuo nome prima di inviare.",
        timeout: 5000,
      });

      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.warning("Email non valida.", {
        description: "Inserisci un indirizzo email valido.",
        timeout: 5000,
      });

      return;
    }

    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      toast.warning("Messaggio troppo breve.", {
        description: "Scrivi almeno un paio di frasi prima di inviare.",
        timeout: 5000,
      });

      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            message: trimmedMessage,
          }),
        },
      );

      if (!res.ok) throw new Error(await res.text());

      toast.success("Messaggio inviato con successo!", {
        description: "Riceverai una risposta al più presto.",
        timeout: 5000,
      });

      formReset("all");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("error: ", error);
      }
      toast.danger("Errore durante l'invio del messaggio.", {
        description:
          "Si è verificato un errore. Per favore, riprova più tardi.",
        timeout: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================== RENDER COMPONENT ========================== //
  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | Contatti</title>
        <meta
          content="Scrivimi per collaborazioni, booking live o informazioni. Lacco è un cantante e cantautore italiano di R&B e Hip-Hop."
          name="description"
        />
        <meta content="index, follow" name="robots" />
        <link href="https://lacco.it/contatti" rel="canonical" />
        <link href="https://lacco.it/contatti" hrefLang="it" rel="alternate" />
        <link
          href="https://lacco.it/contatti"
          hrefLang="x-default"
          rel="alternate"
        />
        <meta content="website" property="og:type" />
        <meta content="Lacco" property="og:site_name" />
        <meta content="Lacco | Contatti" property="og:title" />
        <meta
          content="Scrivimi per collaborazioni, booking live o informazioni. Lacco è un cantante e cantautore italiano di R&B e Hip-Hop."
          property="og:description"
        />
        <meta content="https://lacco.it/contatti" property="og:url" />
        <meta content="https://lacco.it/og-image.jpg" property="og:image" />
        <meta content="Lacco — Cantante e Cantautore" property="og:image:alt" />
        <meta content="it_IT" property="og:locale" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Lacco | Contatti" name="twitter:title" />
        <meta
          content="Scrivimi per collaborazioni, booking live o informazioni."
          name="twitter:description"
        />
        <meta content="https://lacco.it/og-image.jpg" name="twitter:image" />
      </Helmet>

      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mx-auto w-full max-w-4xl">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className={title()}>Contatti</h1>

          <Form
            className="w-full space-y-6 justify-around"
            onSubmit={sendEmail}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
              <TextField
                isRequired
                className="flex flex-col gap-1.5"
                name="name"
                type="text"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
              >
                <Label>Nome</Label>
                <Input placeholder="Inserisci il tuo nome" />
              </TextField>
              <TextField
                isRequired
                className="flex flex-col gap-1.5"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
              >
                <Label>Email</Label>
                <Input placeholder="Inserisci la tua email" />
              </TextField>
            </div>

            <TextField
              isRequired
              className="flex flex-col gap-1.5"
              value={formData.message}
              onChange={(value) => setFormData({ ...formData, message: value })}
            >
              <Label>Messaggio</Label>
              <TextArea placeholder="Inserisci il tuo messaggio qui" rows={5} />
            </TextField>

            <div className="flex w-full justify-center">
              <Button
                className="rounded-xl w-full sm:w-auto"
                isDisabled={isLoading}
                type="submit"
                variant="primary"
              >
                {isLoading ? <Spinner size="sm" /> : "Invia"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </DefaultLayout>
  );
}
