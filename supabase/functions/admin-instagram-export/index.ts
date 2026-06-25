import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";
import { getSql } from "../_shared/db.ts";
import { sendInstagramDigest } from "../_shared/email.ts";

// POST on-demand dall'admin. Riceve il JSON GIÀ parsato dal client (lo ZIP non
// arriva mai al server). Crea un nuovo follower_snapshot, fa il diff con il
// precedente, scrive unfollow/follow events, notifica gli unfollower.

type ExportFollower = { username: string; followedYouAt: string | null };

const CHUNK = 1000;

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

  let followers: ExportFollower[];

  try {
    const body = (await req.json()) as { followers?: ExportFollower[] };

    followers = (body.followers ?? []).filter((f) => f?.username);
  } catch {
    return jsonResponse({ ok: false, error: "JSON non valido" }, 400, origin);
  }

  if (followers.length === 0) {
    return jsonResponse(
      { ok: false, error: "Nessun follower nel file" },
      400,
      origin,
    );
  }

  const sql = getSql();

  try {
    const prev = await sql<{ id: number }[]>`
      select id from instagram.follower_snapshots
      order by captured_at desc limit 1
    `;
    const prevId = prev[0]?.id ?? null;

    const created = await sql<{ id: number }[]>`
      insert into instagram.follower_snapshots (source, total_count)
      values ('export', ${followers.length})
      returning id
    `;
    const newId = created[0].id;

    // Dedup per username (l'export può avere duplicati teorici); l'ultima vince.
    const seen = new Map<string, ExportFollower>();

    for (const f of followers) seen.set(f.username, f);
    const unique = [...seen.values()];

    for (let i = 0; i < unique.length; i += CHUNK) {
      const rows = unique.slice(i, i + CHUNK).map((f) => ({
        snapshot_id: newId,
        username: f.username,
        followed_you_at: f.followedYouAt,
      }));

      await sql`
        insert into instagram.followers ${sql(
          rows,
          "snapshot_id",
          "username",
          "followed_you_at",
        )}
        on conflict (snapshot_id, username) do nothing
      `;
    }

    let lost: { username: string; was_following_since: string | null }[] = [];
    let gained = 0;

    if (prevId) {
      lost = await sql<
        { username: string; was_following_since: string | null }[]
      >`
        insert into instagram.unfollow_events (username, gone_between, was_following_since)
        select prev.username, ${newId}, prev.followed_you_at
        from instagram.followers prev
        where prev.snapshot_id = ${prevId}
          and not exists (
            select 1 from instagram.followers cur
            where cur.snapshot_id = ${newId} and cur.username = prev.username
          )
        returning username, was_following_since
      `;

      const gainedRows = await sql`
        insert into instagram.follow_events (username, gained_between)
        select cur.username, ${newId}
        from instagram.followers cur
        where cur.snapshot_id = ${newId}
          and not exists (
            select 1 from instagram.followers prev
            where prev.snapshot_id = ${prevId} and prev.username = cur.username
          )
        returning username
      `;

      gained = gainedRows.length;
    }

    const fmt = (d: string | null) =>
      d ? new Date(d).toLocaleDateString("it-IT") : null;

    if (lost.length > 0) {
      await sendInstagramDigest({
        kind: "unfollowers",
        date: new Date().toLocaleDateString("it-IT"),
        gained,
        lost: lost.map((u) => ({
          username: u.username,
          since: fmt(u.was_following_since),
        })),
      });
    }

    return jsonResponse(
      {
        ok: true,
        snapshotId: newId,
        isFirstSnapshot: prevId === null,
        total: unique.length,
        gained,
        unfollowers: lost.map((u) => ({
          username: u.username,
          since: fmt(u.was_following_since),
        })),
      },
      200,
      origin,
    );
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, origin);
  }
});
