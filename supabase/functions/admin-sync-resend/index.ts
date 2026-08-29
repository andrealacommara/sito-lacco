import {
  corsHeaders,
  jsonResponse,
  RESEND_AUDIENCE_ID,
} from "../_shared/clients.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { syncResendContacts } from "../_shared/resendSync.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false }, 405, origin);
  }
  const denied = await requireAdmin(req, origin);

  if (denied) return denied;
  if (!RESEND_AUDIENCE_ID) {
    return jsonResponse(
      { ok: false, error: "RESEND_AUDIENCE_ID non configurato" },
      500,
      origin,
    );
  }

  const apiKey = Deno.env.get("RESEND_API_KEY")!;

  try {
    const { checked, updated } = await syncResendContacts(apiKey);

    return jsonResponse({ ok: true, checked, updated }, 200, origin);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500, origin);
  }
});
