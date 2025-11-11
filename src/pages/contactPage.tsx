// ========================== MAIN IMPORTS ========================== //
// Essential libraries and components for the contact form, state management, and layout

import { useState } from "react"; // React hook for local state management
import { Helmet } from "react-helmet-async"; // SEO and meta tags
import emailjs from "@emailjs/browser"; // Client-side email sending via EmailJS
import { Form, Input, Textarea, Button, addToast } from "@heroui/react"; // HeroUI form components

import DefaultLayout from "@/layouts/default"; // Main site layout (Navbar + Footer)
import { title } from "@/components/primitives"; // Predefined typography style for page titles

// ========================== CONTACT PAGE COMPONENT ========================== //
// Manages the contact form, sending messages via EmailJS, and user feedback

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isLoading, setLoading] = useState(false);

  // ========================== FORM RESET FUNCTION ========================== //
  const formReset = (field: string) => {
    if (field === "all")
      return setFormData({ name: "", email: "", message: "" });
    setFormData({ ...formData, [field]: "" });
  };

  // ========================== EMAILJS CONFIG ========================== //
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // ========================== SEND EMAIL FUNCTION ========================== //
  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailjs.send(serviceId, templateId, formData, publicKey);

      addToast({
        title: "Messaggio inviato con successo!",
        description: "Riceverai una risposta al più presto.",
        timeout: 5000,
        color: "success",
        variant: "flat",
        radius: "lg",
      });

      formReset("all");
    } catch (error) {
      console.error("error: ", error);
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

  // ========================== RENDER COMPONENT ========================== //
  return (
    <DefaultLayout>
      <Helmet>
        <title>Lacco | Contatti</title>
        <meta
          name="description"
          content="Contatta Lacco per collaborazioni, informazioni o semplicemente per lasciare un messaggio."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mx-auto w-full max-w-5xl">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className={title()}>Contatti</h1>

          <Form
            className="w-full space-y-6 justify-around"
            onReset={() => formReset("all")}
            onSubmit={sendEmail}
          >
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
