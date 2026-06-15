import { corsHeaders, getSupabaseAdmin, jsonResponse, RESEND_AUDIENCE_ID } from "../_shared/clients.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return jsonResponse({ ok: false, error: "Token mancante" }, 400, origin);
  }

  const supabase = getSupabaseAdmin();

  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .select("id, email, first_name, status, created_at")
    .eq("confirm_token", token)
    .maybeSingle();

  if (error || !subscriber) {
    return jsonResponse({ ok: false, error: "Token non valido" }, 400, origin);
  }

  if (subscriber.status === "confirmed") {
    return jsonResponse({ ok: true, alreadyConfirmed: true }, 200, origin);
  }

  // Token scaduto dopo 48h
  const created = new Date(subscriber.created_at as string);
  if (Date.now() - created.getTime() > 48 * 60 * 60 * 1000) {
    return jsonResponse({ ok: false, error: "Link scaduto. Iscriviti di nuovo." }, 400, origin);
  }

  // Aggiorna status e rimuove il token (usato una sola volta)
  await supabase
    .from("subscribers")
    .update({
      status: "confirmed",
      double_optin_confirmed: true,
      confirm_token: null,
    })
    .eq("id", subscriber.id);

  // Sync verso Resend Audience
  if (RESEND_AUDIENCE_ID) {
    try {
      await syncToResend(subscriber.email as string, subscriber.first_name as string | null, subscriber.id as string);
    } catch (err) {
      // Non bloccante: la conferma è già registrata in Supabase
      console.error("Resend sync error:", err);
    }
  }

  return jsonResponse({ ok: true }, 200, origin);
});

async function syncToResend(email: string, firstName: string | null, supabaseId: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY")!;
  const res = await fetch(
    `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        first_name: firstName ?? undefined,
        unsubscribed: false,
      }),
    },
  );
  if (!res.ok) throw new Error(`Resend contacts error: ${await res.text()}`);

  const { id: resendContactId } = await res.json() as { id: string };
  const supabase = getSupabaseAdmin();
  await supabase.from("subscribers").update({ resend_contact_id: resendContactId }).eq("id", supabaseId);
}
