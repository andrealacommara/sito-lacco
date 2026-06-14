import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DefaultLayout from "@/layouts/default";
import type { ConfirmResponse } from "@/types/api";

const EF_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export default function ConfirmPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "ok" | "already" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    fetch(`${EF_BASE}/confirm?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: ConfirmResponse) => {
        if (data.alreadyConfirmed) setState("already");
        else if (data.ok) setState("ok");
        else setState("error");
      })
      .catch(() => setState("error"));
  }, [token]);

  const messages = {
    loading: "Conferma in corso…",
    ok: "✓ Iscrizione confermata! Ti avviserò quando uscirà qualcosa di nuovo.",
    already: "✓ Sei già nella lista.",
    error: "Il link non è valido o è scaduto. Prova a iscriverti di nuovo.",
  };

  return (
    <DefaultLayout>
      <Helmet>
        <title>Conferma iscrizione | Lacco</title>
        <meta content="noindex, nofollow" name="robots" />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p
          className={`text-lg ${state === "error" ? "text-danger" : "text-default-700"}`}
        >
          {messages[state]}
        </p>
      </div>
    </DefaultLayout>
  );
}
