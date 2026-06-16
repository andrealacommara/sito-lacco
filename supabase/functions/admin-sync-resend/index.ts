import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  corsHeaders,
  jsonResponse,
  RESEND_AUDIENCE_ID,
} from "../_shared/clients.ts";
import { syncResendContacts } from "../_shared/resendSync.ts";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const {
    data: { user },
    error,
  } = await supabaseAnon.auth.getUser(token);

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
