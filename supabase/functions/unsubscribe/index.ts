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
    .select("id, email, status, resend_contact_id")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (error || !subscriber) {
    return jsonResponse({ ok: false, error: "Link non valido" }, 400, origin);
  }

  if (subscriber.status === "unsubscribed") {
    return jsonResponse({ ok: true }, 200, origin);
  }

  const { error: updateError } = await supabase
    .from("subscribers")
    .update({ status: "unsubscribed" })
    .eq("id", subscriber.id);

  if (updateError) {
    return jsonResponse({ ok: false, error: "Errore interno" }, 500, origin);
  }

  // Marca come unsubscribed su Resend (upsert per email, funziona anche senza resend_contact_id)
  if (RESEND_AUDIENCE_ID) {
    try {
      const apiKey = Deno.env.get("RESEND_API_KEY")!;
      await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ email: subscriber.email, unsubscribed: true }),
        },
      );
    } catch (err) {
      console.error("Resend unsubscribe error:", err);
    }
  }

  return jsonResponse({ ok: true }, 200, origin);
});
