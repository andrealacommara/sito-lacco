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

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    emailjs
      .send(
        "service_cl6ok9e",
        "template_k7cg5id",
        formData,
        "SAappjO2xQb1M0N5o"
      )
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
      <section className="flex flex-col items-center justify-center">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Contatti</h1>
          <Form
            className="w-full justify-center items-center space-y-4 mt-8"
            onReset={formReset}
            onSubmit={sendEmail}
          >
            <div className="flex flex-col gap-4 max-w-md">
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

              <Textarea
                isRequired
                className="max-w-xs"
                label="Messaggio"
                placeholder="Inserisci il tuo messaggio qui"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />

              <div className="flex gap-4">
                <Button className="w-full" color="primary" type="submit">
                  Invia
                </Button>
                <Button type="reset" variant="bordered">
                  Pulisci
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </section>
    </DefaultLayout>
  );
}
