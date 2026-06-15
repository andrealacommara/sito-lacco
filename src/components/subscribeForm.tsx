import { useState, useId } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { EF_BASE } from "@/lib/supabase";
import type { SubscribeBody, SubscribeResponse } from "@/types/api";

type Props = {
  source: "presave_form" | "newsletter_form";
  releaseSlug?: string;
  compact?: boolean;
};

export default function SubscribeForm({ source, releaseSlug, compact = false }: Props) {
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
      addToast({ title: err, color: "danger" });
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
        addToast({
          title: "Controlla la tua email per confermare!",
          color: "success",
        });
      } else {
        addToast({ title: data.message ?? "Errore. Riprova.", color: "danger" });
      }
    } catch {
      addToast({ title: "Errore di rete. Riprova.", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.p
          key="done"
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-default-500 py-2"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          Sei nella lista! Ti avviso presto.
        </motion.p>
      ) : (
        <motion.form
          key="form"
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          className="flex flex-col gap-3 w-full"
          onSubmit={handleSubmit}
        >
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
            <Input
              autoComplete="given-name"
              label="Nome"
              labelPlacement="outside"
              placeholder="Inserisci il tuo nome"
              type="text"
              value={firstName}
              onValueChange={setFirstName}
            />
          )}

          {compact ? (
            <div className="flex gap-2">
              <Input
                autoComplete="email"
                className="flex-1"
                placeholder="La tua email"
                type="email"
                value={email}
                variant="bordered"
                onValueChange={setEmail}
              />
              <Button
                aria-label="Iscriviti"
                color="danger"
                isLoading={loading}
                type="submit"
              >
                {loading ? "" : "Iscriviti"}
              </Button>
            </div>
          ) : (
            <Input
              isRequired
              autoComplete="email"
              label="Email"
              labelPlacement="outside"
              placeholder="Inserisci la tua email"
              type="email"
              value={email}
              onValueChange={setEmail}
            />
          )}

          <Checkbox
            isSelected={consent}
            size="sm"
            onValueChange={setConsent}
          >
            <span className="text-xs text-default-500">
              Accetto di ricevere aggiornamenti sulle uscite di Lacco.
            </span>
          </Checkbox>

          {!compact && (
            <>
              <Button
                color="danger"
                fullWidth
                isLoading={loading}
                type="submit"
              >
                {loading ? "" : "Avvisami"}
              </Button>
              <p className="text-center text-xs text-default-400">
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
        </motion.form>
      )}
    </AnimatePresence>
  );
}
