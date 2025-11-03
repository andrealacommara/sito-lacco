import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import emailjs from "@emailjs/browser";
import { Form, Input, Button, Textarea, addToast } from "@heroui/react";
import { useState } from "react";

export default function DocsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const formReset = () => {
    setFormData({ name: "", email: "", message: "" });
  };

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs
      .send(serviceId, templateId, formData, publicKey)
      .then(() => {
        addToast({
          title: "✅ Messaggio inviato con successo!",
          description: "Riceverai una risposta al più presto.",
          timeout: 5000,
          color: "success",
          variant: "solid",
          radius: "full",
        });
        formReset();
      })
      .catch((error) => {
        console.error("Errore:", error);
        addToast({
          title: "❌ Errore durante l'invio del messaggio.",
          description:
            "Si è verificato un errore. Per favore, riprova più tardi.",
          timeout: 5000,
          color: "danger",
          variant: "solid",
          radius: "full",
        });
      });
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center-safe w-full  px-4">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className={`${title()} text-center mb-8`}>Contatti</h1>

          <Form
            className="w-full space-y-6 justify-around"
            onReset={formReset}
            onSubmit={sendEmail}
          >
            <div className="flex grid-cols-1 md:grid-raws-2 gap-6 mt-8 w-full justify-center-safe">
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
              />
            </div>

            <Textarea
              isRequired
              label="Messaggio"
              placeholder="Inserisci il tuo messaggio qui"
              minRows={5}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />

            <div className="flex flex-row gap-2 justify-center flex-wrap w-full">
              <Button
                className="w-full sm:w-auto"
                color="primary"
                type="submit"
              >
                Invia
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
      </section>
    </DefaultLayout>
  );
}
