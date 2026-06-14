import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, getSupabaseAdmin, jsonResponse, RESEND_AUDIENCE_ID } from "../_shared/clients.ts";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";

async function verifyAdmin(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  // Verifica il JWT con il client anon (auth non bypassa RLS per verificare il token)
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user) return null;
  if (user.email !== ADMIN_EMAIL) return null;
  return user.id;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  const adminId = await verifyAdmin(req);
  if (!adminId) {
    return jsonResponse({ ok: false, error: "Non autorizzato" }, 401, origin);
  }

  const supabase = getSupabaseAdmin();

  // GET: lista iscritti con filtri opzionali
  if (req.method === "GET") {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const source = url.searchParams.get("source");
    const releaseSlug = url.searchParams.get("releaseSlug");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const pageSize = 50;

    let query = supabase
      .from("subscribers")
      .select("id, email, first_name, status, source, release_slug, consent_timestamp, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) query = query.eq("status", status);
    if (source) query = query.eq("source", source);
    if (releaseSlug) query = query.eq("release_slug", releaseSlug);

    const { data, error, count } = await query;
    if (error) return jsonResponse({ ok: false, error: error.message }, 500, origin);

    return jsonResponse({
      subscribers: (data ?? []).map((s) => ({
        id: s.id,
        email: s.email,
        firstName: s.first_name,
        status: s.status,
        source: s.source,
        releaseSlug: s.release_slug,
        consentTimestamp: s.consent_timestamp,
        createdAt: s.created_at,
      })),
      total: count ?? 0,
    }, 200, origin);
  }

  // POST: aggiunta manuale (consenso già verificato di persona)
  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, origin);
    }

    const { email, firstName, consentTimestamp, note: _note } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: "Email non valida" }, 400, origin);
    }
    if (!consentTimestamp || typeof consentTimestamp !== "string") {
      return jsonResponse({ ok: false, error: "consentTimestamp richiesto" }, 400, origin);
    }

    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      if (existing.status === "confirmed") {
        return jsonResponse({ ok: false, error: "Email già confermata" }, 409, origin);
      }
      await supabase.from("subscribers").update({
        status: "confirmed",
        double_optin_confirmed: true,
        consent: true,
        consent_timestamp: consentTimestamp,
        source: "manual",
        confirm_token: null,
      }).eq("id", existing.id);
    } else {
      const { error } = await supabase.from("subscribers").insert({
        email: email.toLowerCase().trim(),
        first_name: typeof firstName === "string" && firstName.trim() ? firstName.trim() : null,
        source: "manual",
        consent: true,
        consent_timestamp: consentTimestamp,
        double_optin_confirmed: true,
        status: "confirmed",
      });
      if (error) return jsonResponse({ ok: false, error: error.message }, 500, origin);
    }

    // Sync su Resend Audience
    if (RESEND_AUDIENCE_ID) {
      try {
        const apiKey = Deno.env.get("RESEND_API_KEY")!;
        await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            email: (email as string).toLowerCase().trim(),
            first_name: typeof firstName === "string" ? firstName.trim() || undefined : undefined,
            unsubscribed: false,
          }),
        });
      } catch (err) {
        console.error("Resend sync error:", err);
      }
    }

    return jsonResponse({ ok: true }, 201, origin);
  }

  return jsonResponse({ ok: false }, 405, origin);
});
