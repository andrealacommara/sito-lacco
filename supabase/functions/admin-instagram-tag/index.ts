import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";
import { getSql } from "../_shared/db.ts";

// Assegna/rimuove un tag manuale su un username della lista "Non ti ricambiano".
// POST { username, tag }. tag ∈ {persona, vip, pagina} per assegnare, null/"" per
// rimuovere. Persistito in instagram.account_tags (gemella di admin-instagram-mark).

const ALLOWED_TAGS = ["persona", "vip", "pagina"];

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
  let tag: string | null;

  try {
    const body = (await req.json()) as { username?: string; tag?: string | null };

    username = (body.username ?? "").trim();
    tag = body.tag ? String(body.tag).trim().toLowerCase() : null;
    if (!username) throw new Error("username mancante");
    if (tag && !ALLOWED_TAGS.includes(tag)) throw new Error("tag non valido");
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 400, origin);
  }

  const sql = getSql();

  try {
    if (tag) {
      await sql`
        insert into instagram.account_tags (username, tag, tagged_at)
        values (${username}, ${tag}, now())
        on conflict (username) do update
          set tag = excluded.tag, tagged_at = now()
      `;
    } else {
      await sql`delete from instagram.account_tags where username = ${username}`;
    }

    return jsonResponse({ ok: true, username, tag }, 200, origin);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, origin);
  }
});
