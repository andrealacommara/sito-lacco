import {
  corsHeaders,
  getSupabaseAdmin,
  jsonResponse,
} from "../_shared/clients.ts";
import { requireAdmin } from "../_shared/auth.ts";

const STATUSES = ["confirmed", "unsubscribed", "bounced"] as const;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "GET") {
    return jsonResponse({ ok: false }, 405, origin);
  }
  const denied = await requireAdmin(req, origin);

  if (denied) return denied;

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
