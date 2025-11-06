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

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const [isLoading, setLoading] = useState(false);
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
      console.error("Errore:", error);
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

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mx-auto w-full max-w-5xl">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className={`${title()}`}>Contatti</h1>

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
              placeholder="Inserisci il tuo messaggio qui"
              minRows={5}
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
                type="submit"
                isLoading={isLoading}
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
