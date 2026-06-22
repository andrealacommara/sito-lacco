import type { SubscribeBody, SubscribeResponse } from "@/types/api";

import { useState, useId } from "react";
import {
  TextField,
  Label,
  Input,
  Button,
  Checkbox,
  CheckboxControl,
  CheckboxIndicator,
  CheckboxContent,
  Spinner,
  toast,
} from "@heroui/react";

import { EF_BASE } from "@/lib/supabase";

type Props = {
  source: "presave_form" | "newsletter_form";
  releaseSlug?: string;
  compact?: boolean;
};

export default function SubscribeForm({
  source,
  releaseSlug,
  compact = false,
}: Props) {
  const formId = useId();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = (): string | null => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Inserisci un'email valida.";
    }
    if (!consent) return "Accetta il consenso per continuare.";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();

    if (err) {
      toast.danger(err);

      return;
    }
    setLoading(true);
    try {
      const body: SubscribeBody = {
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        releaseSlug,
        source,
        consent: true,
        _hp: hp,
      };
      const res = await fetch(`${EF_BASE}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as SubscribeResponse;

      if (data.ok) {
        setDone(true);
        toast.success("Ti abbiamo inviato un benvenuto!");
      } else {
        toast.danger(data.message ?? "Errore. Riprova.");
      }
    } catch {
      toast.danger("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {done ? (
        <p
          className="text-center text-sm text-default-500 py-2"
          style={{ animation: "fadeInUp 0.4s ease both" }}
        >
          Benvenuto in famiglia
        </p>
      ) : (
        <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
          {/* Honeypot nascosto */}
          <input
            aria-hidden="true"
            id={`${formId}-hp`}
            name="_hp"
            style={{ display: "none" }}
            tabIndex={-1}
            type="text"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />

          {!compact && (
            <TextField
              className="flex flex-col gap-1.5"
              type="text"
              value={firstName}
              onChange={setFirstName}
            >
              <Label>Nome</Label>
              <Input
                autoComplete="given-name"
                placeholder="Inserisci il tuo nome"
              />
            </TextField>
          )}

          {compact ? (
            <div className="flex gap-2">
              <TextField
                className="flex-1"
                type="email"
                value={email}
                onChange={setEmail}
              >
                <Input autoComplete="email" placeholder="La tua email" />
              </TextField>
              <Button
                aria-label="Iscriviti"
                className="rounded-xl"
                isDisabled={loading}
                type="submit"
                variant="danger"
              >
                {loading ? <Spinner size="sm" /> : "Iscriviti"}
              </Button>
            </div>
          ) : (
            <TextField
              isRequired
              className="flex flex-col gap-1.5"
              type="email"
              value={email}
              onChange={setEmail}
            >
              <Label>Email</Label>
              <Input
                autoComplete="email"
                placeholder="Inserisci la tua email"
              />
            </TextField>
          )}
          <Checkbox isSelected={consent} onChange={setConsent}>
            <CheckboxContent>
              <CheckboxControl>
                <CheckboxIndicator />
              </CheckboxControl>
              <span className="text-xs text-default-500">
                Accetto di ricevere aggiornamenti sulle uscite di Lacco.
              </span>
            </CheckboxContent>
          </Checkbox>

          {!compact && (
            <>
              <Button
                fullWidth
                className="rounded-xl"
                isDisabled={loading}
                type="submit"
                variant="danger"
              >
                {loading ? <Spinner size="sm" /> : "Avvisami"}
              </Button>
              <p className="text-center text-xs text-default-500">
                <a
                  className="hover:underline"
                  href="/privacy"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Leggi la Privacy policy
                </a>
              </p>
            </>
          )}
        </form>
      )}
    </>
  );
}
