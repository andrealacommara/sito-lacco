import {
  corsHeaders,
  getSupabaseAdmin,
  jsonResponse,
} from "../_shared/clients.ts";
import { magicLinkEmailHtml, resendSend } from "../_shared/email.ts";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "management@lacco.it";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://lacco.it";

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

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON" }, 400, origin);
  }

  const redirectTo =
    typeof body.redirectTo === "string" ? body.redirectTo : `${SITE_URL}/admin`;

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
