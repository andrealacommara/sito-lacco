import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, getSupabaseAdmin, jsonResponse, RESEND_AUDIENCE_ID } from "../_shared/clients.ts";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";
const FROM = "Lacco <fan@lacco.it>";

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user || user.email !== ADMIN_EMAIL) return false;
  return true;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false }, 405, origin);
  }

  if (!(await verifyAdmin(req))) {
    return jsonResponse({ ok: false, error: "Non autorizzato" }, 401, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, origin);
  }

  const { subject, htmlBody, dry } = body;

  if (!subject || typeof subject !== "string" || !htmlBody || typeof htmlBody !== "string") {
    return jsonResponse({ ok: false, error: "subject e htmlBody richiesti" }, 400, origin);
  }

  if (dry === true) {
    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from("subscribers")
      .select("id", { count: "exact" })
      .eq("status", "confirmed");
    return jsonResponse({ ok: true, dry: true, recipientCount: count ?? 0 }, 200, origin);
  }

  if (!RESEND_AUDIENCE_ID) {
    return jsonResponse({ ok: false, error: "RESEND_AUDIENCE_ID non configurato" }, 500, origin);
  }

  const apiKey = Deno.env.get("RESEND_API_KEY")!;

  // Crea broadcast Resend
  const broadcastRes = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      audience_id: RESEND_AUDIENCE_ID,
      from: FROM,
      reply_to: "ciao@lacco.it",
      subject,
      html: htmlBody,
    }),
  });

  if (!broadcastRes.ok) {
    const err = await broadcastRes.text();
    return jsonResponse({ ok: false, error: `Resend error: ${err}` }, 500, origin);
  }

  const { id: broadcastId } = await broadcastRes.json() as { id: string };

  // Invia immediatamente
  const sendRes = await fetch(`https://api.resend.com/broadcasts/${broadcastId}/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!sendRes.ok) {
    const err = await sendRes.text();
    return jsonResponse({ ok: false, error: `Resend send error: ${err}` }, 500, origin);
  }

  // Log in Supabase
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact" })
    .eq("status", "confirmed");

  await supabase.from("broadcasts").insert({
    template: "manual",
    subject: subject as string,
    resend_id: broadcastId,
    recipient_count: count ?? 0,
  });

  return jsonResponse({ ok: true, broadcastId, recipientCount: count ?? 0 }, 200, origin);
});
