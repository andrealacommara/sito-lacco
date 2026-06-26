import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";
import { getSql } from "../_shared/db.ts";

// Toggle della spunta "tolto" su un username della lista "Non ti ricambiano".
// POST { username, marked }. Persistito in instagram.marked_unfollowed.

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Metodo non valido" }, 405, origin);
  }
  if (!(await verifyAdmin(req))) {
    return jsonResponse({ ok: false, error: "Non autorizzato" }, 401, origin);
  }

  let username: string;
  let marked: boolean;

  try {
    const body = (await req.json()) as { username?: string; marked?: boolean };

    username = (body.username ?? "").trim();
    marked = !!body.marked;
    if (!username) throw new Error("username mancante");
  } catch {
    return jsonResponse({ ok: false, error: "JSON non valido" }, 400, origin);
  }

  const sql = getSql();

  try {
    if (marked) {
      await sql`
        insert into instagram.marked_unfollowed (username)
        values (${username})
        on conflict (username) do nothing
      `;
    } else {
      await sql`delete from instagram.marked_unfollowed where username = ${username}`;
    }

    return jsonResponse({ ok: true, username, marked }, 200, origin);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, origin);
  }
});
