import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";
import { getSql } from "../_shared/db.ts";
import { normalizeUsername } from "../_shared/instagram.ts";

// Due correzioni manuali sulla lista "Non ti ricambiano", entrambe persistenti:
//
//  POST { username, marked }   → spunta "tolto" (instagram.marked_unfollowed)
//  POST { username, override } → "ora mi segue" (instagram.relationship_overrides)
//
// L'override copre il buco tra un export e l'altro: la Graph API non espone la
// lista follower, quindi finché non ricarichi lo ZIP nessuno può sapere che quel
// profilo ha ricominciato a seguirti. Il prossimo export completo lo azzera.

const ALLOWED_OVERRIDES = ["follows_you"];

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
  let marked: boolean | null = null;
  let override: string | null = null;
  let hasOverride = false;

  try {
    const body = (await req.json()) as {
      username?: string;
      marked?: boolean;
      override?: string | null;
    };

    username = normalizeUsername(body.username);
    if (!username) throw new Error("username mancante");

    hasOverride = "override" in body;
    if (hasOverride) {
      override = body.override ?? null;
      if (override !== null && !ALLOWED_OVERRIDES.includes(override)) {
        throw new Error("override non valido");
      }
    } else {
      marked = !!body.marked;
    }
  } catch {
    return jsonResponse({ ok: false, error: "JSON non valido" }, 400, origin);
  }

  const sql = getSql();

  try {
    if (hasOverride) {
      if (override) {
        const snap = await sql<{ id: number }[]>`
          select id from instagram.follower_snapshots
          order by captured_at desc limit 1
        `;

        await sql`
          insert into instagram.relationship_overrides (username, state, snapshot_id)
          values (${username}, ${override}, ${snap[0]?.id ?? null})
          on conflict (username) do update
            set state = excluded.state,
                set_at = now(),
                snapshot_id = excluded.snapshot_id
        `;
      } else {
        await sql`delete from instagram.relationship_overrides where username = ${username}`;
      }

      return jsonResponse({ ok: true, username, override }, 200, origin);
    }

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
