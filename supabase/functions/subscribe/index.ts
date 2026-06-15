import { corsHeaders, getSupabaseAdmin, jsonResponse, RESEND_AUDIENCE_ID } from "../_shared/clients.ts";
import { sendWelcomeEmail } from "../_shared/email.ts";
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
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedFirstName = typeof firstName === "string" && firstName.trim() ? firstName.trim() : undefined;
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status, unsubscribe_token")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing && existing.status === "confirmed") {
    return jsonResponse({ ok: true, message: "Grazie!" }, 200, origin);
  }

  let subscriberId: string;
  let unsubscribeToken: string;

  if (existing) {
    // Aggiorna pending/unsubscribed a confirmed
    const { data: updated, error } = await supabase
      .from("subscribers")
      .update({
        status: "confirmed",
        double_optin_confirmed: true,
        consent: true,
        consent_timestamp: now,
        confirm_token: null,
        updated_at: now,
      })
      .eq("id", existing.id)
      .select("id, unsubscribe_token")
      .single();

    if (error || !updated) {
      console.error("Update error:", error);
      return jsonResponse({ ok: false, message: "Errore interno" }, 500, origin);
    }
    subscriberId = updated.id as string;
    unsubscribeToken = updated.unsubscribe_token as string;
  } else {
    const { data: inserted, error } = await supabase
      .from("subscribers")
      .insert({
        email: normalizedEmail,
        first_name: normalizedFirstName ?? null,
        release_slug: typeof releaseSlug === "string" ? releaseSlug : null,
        source,
        consent: true,
        consent_timestamp: now,
        double_optin_confirmed: true,
        status: "confirmed",
      })
      .select("id, unsubscribe_token")
      .single();

    if (error || !inserted) {
      console.error("Insert error:", error);
      return jsonResponse({ ok: false, message: "Errore interno" }, 500, origin);
    }
    subscriberId = inserted.id as string;
    unsubscribeToken = inserted.unsubscribe_token as string;
  }

  // Sync verso Resend Audience
  if (RESEND_AUDIENCE_ID) {
    try {
      const apiKey = Deno.env.get("RESEND_API_KEY")!;
      const res = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            first_name: normalizedFirstName,
            unsubscribed: false,
          }),
        },
      );
      if (res.ok) {
        const { id: resendContactId } = await res.json() as { id: string };
        await supabase
          .from("subscribers")
          .update({ resend_contact_id: resendContactId })
          .eq("id", subscriberId);
      }
    } catch (err) {
      console.error("Resend sync error:", err);
    }
  }

  // Invia welcome email
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${unsubscribeToken}`;
  try {
    await sendWelcomeEmail(normalizedEmail, normalizedFirstName, unsubscribeUrl);
  } catch (err) {
    console.error("Email send error:", err);
    return jsonResponse({ ok: false, message: "Errore nell'invio dell'email" }, 500, origin);
  }

  return jsonResponse({ ok: true, message: "Benvenuto in famiglia!" }, 200, origin);
});
