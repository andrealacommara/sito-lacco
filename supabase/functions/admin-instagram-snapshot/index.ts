import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";
import { getSql } from "../_shared/db.ts";
import {
  fetchAccount,
  fetchAccountInsights,
  fetchRecentMedia,
  getAccessToken,
  refreshIfNeeded,
} from "../_shared/instagram.ts";
import { sendInstagramDigest } from "../_shared/email.ts";

// Cron giornaliero (06:00 UTC) + reminder settimanale (?task=reminder).
// Auth: header x-cron-secret == segreto nel Vault (`ig_cron_secret`, letto via DB)
// OPPURE verifyAdmin (trigger manuale dall'admin). verify_jwt=false in config.toml:
// l'auth è interna. Unica fonte del segreto = il Vault, condivisa col job pg_cron.

async function authorized(
  req: Request,
  sql: ReturnType<typeof getSql>,
): Promise<boolean> {
  const provided = req.headers.get("x-cron-secret");

  if (provided) {
    try {
      const rows = await sql<{ decrypted_secret: string }[]>`
        select decrypted_secret from vault.decrypted_secrets
        where name = 'ig_cron_secret'
      `;

      if (rows[0]?.decrypted_secret && provided === rows[0].decrypted_secret) {
        return true;
      }
    } catch {
      // se il Vault non è leggibile, si ripiega sull'auth admin
    }
  }

  return verifyAdmin(req);
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  const sql = getSql();

  if (!(await authorized(req, sql))) {
    return jsonResponse({ ok: false, error: "Non autorizzato" }, 401, origin);
  }

  const task = new URL(req.url).searchParams.get("task");

  // Promemoria settimanale: nessuna chiamata Graph, solo l'email.
  if (task === "reminder") {
    try {
      await sendInstagramDigest({ kind: "reminder" });

      return jsonResponse({ ok: true, task: "reminder" }, 200, origin);
    } catch (e) {
      return jsonResponse({ ok: false, error: String(e) }, 500, origin);
    }
  }

  try {
    const tokenState = await getAccessToken(sql);
    const token = await refreshIfNeeded(sql, tokenState);

    const account = await fetchAccount(token);
    const insights = await fetchAccountInsights(token);
    const media = await fetchRecentMedia(token);

    // Snapshot account (idempotente per giorno).
    await sql`
      insert into instagram.account_snapshots
        (captured_at, followers_count, follows_count, media_count, insights)
      values
        (current_date, ${account.followers_count}, ${account.follows_count},
         ${account.media_count}, ${sql.json(insights)})
      on conflict (captured_at) do update
        set followers_count = excluded.followers_count,
            follows_count   = excluded.follows_count,
            media_count     = excluded.media_count,
            insights        = excluded.insights
    `;

    // Report post (serie storica, idempotente per giorno).
    for (const m of media) {
      await sql`
        insert into instagram.media_insights
          (ig_media_id, captured_at, media_type, permalink, caption, posted_at,
           likes, comments, saves, shares, reach, views)
        values
          (${m.ig_media_id}, current_date, ${m.media_type}, ${m.permalink},
           ${m.caption}, ${m.posted_at}, ${m.likes}, ${m.comments}, ${m.saves},
           ${m.shares}, ${m.reach}, ${m.views})
        on conflict (ig_media_id, captured_at) do update
          set likes = excluded.likes, comments = excluded.comments,
              saves = excluded.saves, shares = excluded.shares,
              reach = excluded.reach, views = excluded.views,
              caption = excluded.caption, permalink = excluded.permalink
      `;
    }

    // Alert calo netto: confronto con lo snapshot precedente.
    const prev = await sql<{ followers_count: number }[]>`
      select followers_count from instagram.account_snapshots
      where captured_at < current_date
      order by captured_at desc limit 1
    `;

    let alertSent = false;

    if (prev[0] && account.followers_count < prev[0].followers_count) {
      const delta = account.followers_count - prev[0].followers_count;

      await sendInstagramDigest({
        kind: "drop",
        followers: account.followers_count,
        delta,
        date: new Date().toLocaleDateString("it-IT"),
      });
      alertSent = true;
    }

    return jsonResponse(
      {
        ok: true,
        followers: account.followers_count,
        mediaTracked: media.length,
        alertSent,
      },
      200,
      origin,
    );
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, origin);
  }
});
