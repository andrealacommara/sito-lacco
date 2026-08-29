import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getResendApiKey(): string {
  const key = Deno.env.get("RESEND_API_KEY");

  if (!key) throw new Error("RESEND_API_KEY not set");

  return key;
}

export const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID") ?? "";

// Origin ammessi. Prima si rifletteva qualunque origin, il che permetteva a una
// qualsiasi pagina di terzi di far partire richieste alle nostre funzioni dai
// browser dei suoi visitatori: un modo gratuito di amplificare gli endpoint che
// spendono email. Il CORS non ferma curl — quello è compito del rate limit — ma
// chiude il vettore drive-by.
const ALLOWED_ORIGINS = [
  "https://www.lacco.it",
  "https://lacco.it",
  "http://localhost:5173",
  "http://localhost:4173",
];

const DEFAULT_ORIGIN = "https://www.lacco.it";

export function corsHeaders(origin?: string | null) {
  return {
    // Un origin non in lista riceve comunque un valore, ma non il suo: il browser
    // blocca la risposta lato client.
    "Access-Control-Allow-Origin":
      origin && ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    // L'header varia in base all'origin: senza questo una CDN potrebbe servire a
    // un origin la risposta cachata per un altro.
    Vary: "Origin",
  };
}

export function jsonResponse(
  data: unknown,
  status = 200,
  origin?: string | null,
  extraHeaders?: Record<string, string>,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}
