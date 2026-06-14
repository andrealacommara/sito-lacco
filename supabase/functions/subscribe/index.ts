import { corsHeaders, getSupabaseAdmin, jsonResponse } from "../_shared/clients.ts";
import { sendConfirmEmail } from "../_shared/email.ts";
import { isValidEmail } from "../_shared/validation.ts";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://lacco.it";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, message: "Method not allowed" }, 405, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON" }, 400, origin);
  }

  const { email, firstName, releaseSlug, source, consent, _hp } = body as Record<string, unknown>;

  // Honeypot: se compilato è un bot
  if (typeof _hp === "string" && _hp.length > 0) {
    return jsonResponse({ ok: true, message: "Grazie!" }, 200, origin);
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return jsonResponse({ ok: false, message: "Email non valida" }, 400, origin);
  }

  if (consent !== true) {
    return jsonResponse({ ok: false, message: "Consenso richiesto" }, 400, origin);
  }

  if (!source || !["presave_form", "newsletter_form"].includes(source as string)) {
    return jsonResponse({ ok: false, message: "Source non valida" }, 400, origin);
  }

  const supabase = getSupabaseAdmin();
  const confirmToken = crypto.randomUUID();
  const now = new Date().toISOString();

  // Upsert: se esiste ed è pending, aggiorna il token e re-invia.
  // Se è già confirmed, non toccare (risponde ok per non rivelare lo stato).
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing && existing.status === "confirmed") {
    return jsonResponse({ ok: true, message: "Grazie! Controlla la tua email." }, 200, origin);
  }

  if (existing) {
    await supabase
      .from("subscribers")
      .update({ confirm_token: confirmToken, updated_at: now })
      .eq("id", existing.id);
  } else {
    const { error } = await supabase.from("subscribers").insert({
      email: email.toLowerCase().trim(),
      first_name: typeof firstName === "string" && firstName.trim() ? firstName.trim() : null,
      release_slug: typeof releaseSlug === "string" ? releaseSlug : null,
      source,
      consent: true,
      consent_timestamp: now,
      confirm_token: confirmToken,
      status: "pending",
    });
    if (error) {
      console.error("Insert error:", error);
      return jsonResponse({ ok: false, message: "Errore interno" }, 500, origin);
    }
  }

  const confirmUrl = `${SITE_URL}/confirm?token=${confirmToken}`;
  try {
    await sendConfirmEmail(
      email.toLowerCase().trim(),
      typeof firstName === "string" ? firstName.trim() || undefined : undefined,
      confirmUrl,
    );
  } catch (err) {
    console.error("Email send error:", err);
    return jsonResponse({ ok: false, message: "Errore nell'invio dell'email" }, 500, origin);
  }

  return jsonResponse({ ok: true, message: "Controlla la tua email per confermare!" }, 200, origin);
});
