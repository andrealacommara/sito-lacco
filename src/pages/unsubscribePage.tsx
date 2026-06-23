import type { UnsubscribeResponse } from "@/types/api";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import DefaultLayout from "@/layouts/default";

const EF_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "ok" | "error">(() =>
    token ? "loading" : "error",
  );

  useEffect(() => {
    if (!token) return;
    fetch(`${EF_BASE}/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: UnsubscribeResponse) => {
        setState(data.ok ? "ok" : "error");
      })
      .catch(() => setState("error"));
  }, [token]);

  const messages = {
    loading: "Elaborazione in corso…",
    ok: "Ti ho rimosso dalla lista. Puoi iscriverti di nuovo in qualsiasi momento.",
    error: "Link non valido. Se vuoi disiscriverti, scrivimi a fan@lacco.it.",
  };

  return (
    <DefaultLayout>
      <Helmet>
        <title>Disiscrizione | Lacco</title>
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
