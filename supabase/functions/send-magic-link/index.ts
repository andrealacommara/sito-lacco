import {
  corsHeaders,
  getSupabaseAdmin,
  jsonResponse,
} from "../_shared/clients.ts";
import { magicLinkEmailHtml, resendSend } from "../_shared/email.ts";
import {
  enforceBodySize,
  enforceRateLimit,
  PUBLIC_BODY_LIMIT,
  type RateLimitRule,
} from "../_shared/rateLimit.ts";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "management@lacco.it";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://lacco.it";

// Endpoint di login: pubblico per forza di cose (verify_jwt=false), senza
// credenziali nel body, e spende una email Resend + un generateLink GoTrue per
// richiesta. È il bersaglio più conveniente del progetto: senza tetto, un loop di
// curl riempie la casella admin e brucia la quota Resend, col rischio di far
// sospendere l'account e portare giù anche la newsletter.
//
// Tre livelli, dal più specifico al più generale:
//  - burst: un solo invio al minuto per IP, contro il doppio click e i loop stretti
//  - per IP: 3 all'ora, la soglia oltre la quale non c'è più uso legittimo
//  - GLOBALE: 20 all'ora. È l'unico che regge contro chi ruota IP, ed è quindi
//    la vera protezione della casella.
//
// SE IL TETTO GLOBALE VIENE ESAURITO da un attacco, l'admin non riceve il link.
// Non è un lockout permanente: il magic link si genera anche dalla dashboard
// Supabase (Auth → Users → invia magic link). Vale la pena ricordarlo qui perché
// è esattamente il momento in cui non si ha voglia di cercarlo.
const RULES: RateLimitRule[] = [
  { name: "magic-link-burst", limit: 1, windowSeconds: 60, scope: "ip" },
  { name: "magic-link-ip", limit: 3, windowSeconds: 3600, scope: "ip" },
  { name: "magic-link", limit: 20, windowSeconds: 3600, scope: "global" },
];

// `redirectTo` arriva dal body: senza allowlist sarebbe la destinazione a cui
// GoTrue appende il token di sessione. La difesa vera resta additional_redirect_urls
// lato progetto, ma non c'è motivo di delegargliela interamente.
const ALLOWED_REDIRECTS = [
  "https://www.lacco.it/admin",
  "https://lacco.it/admin",
  "http://localhost:5173/admin",
  "http://localhost:4173/admin",
];

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse(
      { ok: false, message: "Method not allowed" },
      405,
      origin,
    );
  }

  const tooBig = enforceBodySize(req, PUBLIC_BODY_LIMIT, origin);

  if (tooBig) return tooBig;

  // Prima di leggere il body, di generare il link e soprattutto di spedire.
  const limited = await enforceRateLimit(req, RULES, origin);

  if (limited) return limited;

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON" }, 400, origin);
  }

  const requestedRedirect =
    typeof body.redirectTo === "string" ? body.redirectTo : "";
  const redirectTo = ALLOWED_REDIRECTS.includes(requestedRedirect)
    ? requestedRedirect
    : `${SITE_URL}/admin`;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: ADMIN_EMAIL,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    console.error("generateLink error:", error);

    return jsonResponse({ ok: false, message: "Errore interno" }, 500, origin);
  }

  try {
    await resendSend({
      to: ADMIN_EMAIL,
      subject: "Accedi all'area admin di Lacco",
      html: magicLinkEmailHtml(data.properties.action_link),
    });
  } catch (err) {
    console.error("Resend error:", err);

    return jsonResponse(
      { ok: false, message: "Errore nell'invio dell'email" },
      500,
      origin,
    );
  }

  return jsonResponse({ ok: true }, 200, origin);
});
