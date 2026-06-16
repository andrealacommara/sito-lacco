import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  corsHeaders,
  getSupabaseAdmin,
  jsonResponse,
} from "../_shared/clients.ts";

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

const STATUSES = ["confirmed", "unsubscribed", "bounced"] as const;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "GET") {
    return jsonResponse({ ok: false }, 405, origin);
  }
  if (!(await verifyAdmin(req))) {
    return jsonResponse({ ok: false, error: "Non autorizzato" }, 401, origin);
  }

  const supabase = getSupabaseAdmin();

  const counts = await Promise.all(
    STATUSES.map((status) =>
      supabase
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  );

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { count: newLast7Days } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);

  const result: Record<string, number> = {};

  STATUSES.forEach((status, i) => {
    result[status] = counts[i].count ?? 0;
  });

  return jsonResponse(
    {
      ok: true,
      confirmed: result.confirmed,
      unsubscribed: result.unsubscribed,
      bounced: result.bounced,
      newLast7Days: newLast7Days ?? 0,
    },
    200,
    origin,
  );
});
