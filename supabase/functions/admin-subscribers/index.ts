import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  corsHeaders,
  getSupabaseAdmin,
  jsonResponse,
  RESEND_AUDIENCE_ID,
} from "../_shared/clients.ts";

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
  const {
    data: { user },
    error,
  } = await supabaseAnon.auth.getUser(token);

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
    const search = url.searchParams.get("search")?.trim();
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const requestedPageSize = parseInt(
      url.searchParams.get("pageSize") ?? "15",
    );
    const pageSize = Math.min(
      200,
      Math.max(1, Number.isFinite(requestedPageSize) ? requestedPageSize : 15),
    );

    const SORTABLE_COLUMNS: Record<string, string> = {
      email: "email",
      status: "status",
      source: "source",
      createdAt: "created_at",
    };
    const sortColumn =
      SORTABLE_COLUMNS[url.searchParams.get("sortBy") ?? "email"] ?? "email";
    const ascending = url.searchParams.get("sortDir") !== "desc";

    let query = supabase
      .from("subscribers")
      .select(
        "id, email, first_name, status, source, release_slug, consent_timestamp, created_at",
        { count: "exact" },
      )
      .order(sortColumn, { ascending })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) query = query.eq("status", status);
    if (source) query = query.eq("source", source);
    if (releaseSlug) query = query.eq("release_slug", releaseSlug);
    if (search) {
      // Le virgole separano le condizioni nel filtro `or` di PostgREST: vanno rimosse
      // dal termine di ricerca per evitare di rompere la sintassi del filtro.
      const safeSearch = search.replace(/[,()%]/g, "");

      if (safeSearch) {
        query = query.or(
          `email.ilike.%${safeSearch}%,first_name.ilike.%${safeSearch}%`,
        );
      }
    }

    const { data, error, count } = await query;

    if (error)
      return jsonResponse({ ok: false, error: error.message }, 500, origin);

    return jsonResponse(
      {
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
      },
      200,
      origin,
    );
  }

  // POST: aggiunta manuale (consenso già verificato di persona)
  if (req.method === "POST") {
    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, origin);
    }

    const { email, firstName, consentTimestamp } = body;

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return jsonResponse(
        { ok: false, error: "Email non valida" },
        400,
        origin,
      );
    }
    if (!consentTimestamp || typeof consentTimestamp !== "string") {
      return jsonResponse(
        { ok: false, error: "consentTimestamp richiesto" },
        400,
        origin,
      );
    }

    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      if (existing.status === "confirmed") {
        return jsonResponse(
          { ok: false, error: "Email già confermata" },
          409,
          origin,
        );
      }
      await supabase
        .from("subscribers")
        .update({
          status: "confirmed",
          consent: true,
          consent_timestamp: consentTimestamp,
          source: "manual",
        })
        .eq("id", existing.id);
    } else {
      const { error } = await supabase.from("subscribers").insert({
        email: email.toLowerCase().trim(),
        first_name:
          typeof firstName === "string" && firstName.trim()
            ? firstName.trim()
            : null,
        source: "manual",
        consent: true,
        consent_timestamp: consentTimestamp,
        status: "confirmed",
      });

      if (error)
        return jsonResponse({ ok: false, error: error.message }, 500, origin);
    }

    // Sync su Resend Audience
    if (RESEND_AUDIENCE_ID) {
      try {
        const apiKey = Deno.env.get("RESEND_API_KEY")!;

        await fetch(
          `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: (email as string).toLowerCase().trim(),
              first_name:
                typeof firstName === "string"
                  ? firstName.trim() || undefined
                  : undefined,
              unsubscribed: false,
            }),
          },
        );
      } catch (err) {
        console.error("Resend sync error:", err);
      }
    }

    return jsonResponse({ ok: true }, 201, origin);
  }

  // PATCH: disiscrizione manuale degli iscritti selezionati in admin
  if (req.method === "PATCH") {
    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, origin);
    }

    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return jsonResponse({ ok: false, error: "ids richiesto" }, 400, origin);
    }

    // Esclude chi è già disiscritto: niente da aggiornare né da risincronizzare.
    const { data: targets, error: fetchError } = await supabase
      .from("subscribers")
      .select("id, email")
      .in("id", ids as string[])
      .neq("status", "unsubscribed");

    if (fetchError)
      return jsonResponse(
        { ok: false, error: fetchError.message },
        500,
        origin,
      );

    const targetIds = (targets ?? []).map((t) => t.id);

    if (targetIds.length > 0) {
      const { error: updateError } = await supabase
        .from("subscribers")
        .update({ status: "unsubscribed" })
        .in("id", targetIds);

      if (updateError)
        return jsonResponse(
          { ok: false, error: updateError.message },
          500,
          origin,
        );
    }

    // Sync su Resend Audience (best-effort, non bloccante)
    if (RESEND_AUDIENCE_ID) {
      const apiKey = Deno.env.get("RESEND_API_KEY")!;

      await Promise.all(
        (targets ?? []).map((t) =>
          fetch(
            `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: t.email, unsubscribed: true }),
            },
          ).catch((err) => console.error("Resend sync error:", err)),
        ),
      );
    }

    return jsonResponse(
      { ok: true, updated: targets?.length ?? 0 },
      200,
      origin,
    );
  }

  return jsonResponse({ ok: false }, 405, origin);
});
