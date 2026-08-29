import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";
import { getSql } from "../_shared/db.ts";
import { sendInstagramDigest } from "../_shared/email.ts";
import { isExportReliable, normalizeUsername } from "../_shared/instagram.ts";

// POST on-demand dall'admin. Riceve il JSON GIÀ parsato dal client (lo ZIP non
// arriva mai al server). Crea un nuovo follower_snapshot accoppiato al relativo
// following_snapshot, fa il diff col precedente, scrive unfollow/follow events,
// notifica gli unfollower.
//
// Se l'export è troncato (molti meno nomi dei follower reali, tipico di un export
// richiesto con periodo ristretto) lo snapshot viene salvato ma il diff NON viene
// scritto: altrimenti centinaia di falsi unfollow finirebbero per sempre in churn,
// fedeltà e grafici.

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
  let following: string[] = [];

  try {
    const body = (await req.json()) as {
      followers?: ExportFollower[];
      following?: { username: string }[];
    };

    // Forma canonica lato server: il client normalizza già, ma la chiave delle
    // tabelle è lo username e un solo record fuori forma rompe il diff per sempre.
    followers = (body.followers ?? [])
      .map((f) => ({
        username: normalizeUsername(f?.username),
        followedYouAt: f?.followedYouAt ?? null,
      }))
      .filter((f) => f.username);
    following = [
      ...new Set(
        (body.following ?? [])
          .map((f) => normalizeUsername(f?.username))
          .filter((u) => !!u),
      ),
    ];
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
    // Dedup per username (l'export può avere duplicati); vince chi ha la data.
    const seen = new Map<string, ExportFollower>();

    for (const f of followers) {
      const prevEntry = seen.get(f.username);

      if (!prevEntry || (!prevEntry.followedYouAt && f.followedYouAt)) {
        seen.set(f.username, f);
      }
    }
    const unique = [...seen.values()];

    // Completezza dell'export, valutata PRIMA di scrivere qualsiasi evento e
    // congelata sullo snapshot: a read-time non va più confrontata con un
    // conteggio live, che crescendo invaliderebbe da solo la fotografia.
    const account = await sql<{ followers_count: number }[]>`
      select followers_count from instagram.account_snapshots
      order by captured_at desc limit 1
    `;
    const accountFollowers = account[0]?.followers_count ?? null;
    const reliable = isExportReliable(unique.length, accountFollowers);

    const prev = await sql<{ id: number }[]>`
      select id from instagram.follower_snapshots
      order by captured_at desc limit 1
    `;
    const prevId = prev[0]?.id ?? null;

    // Lista "seguiti" (following): snapshot a parte, accoppiato a quello follower
    // così il confronto non-mutuals non mescola mai fotografie di date diverse.
    // Se l'export non porta i seguiti, riporto l'ultimo snapshot esistente.
    let followingSnapshotId: number | null = null;

    if (following.length > 0) {
      const fsnap = await sql<{ id: number }[]>`
        insert into instagram.following_snapshots (total_count)
        values (${following.length})
        returning id
      `;

      followingSnapshotId = fsnap[0].id;

      for (let i = 0; i < following.length; i += CHUNK) {
        const rows = following
          .slice(i, i + CHUNK)
          .map((username) => ({ snapshot_id: followingSnapshotId, username }));

        await sql`
          insert into instagram.following ${sql(rows, "snapshot_id", "username")}
          on conflict (snapshot_id, username) do nothing
        `;
      }
    } else {
      const lastFollowing = await sql<{ id: number }[]>`
        select id from instagram.following_snapshots
        order by captured_at desc limit 1
      `;

      followingSnapshotId = lastFollowing[0]?.id ?? null;
    }

    const created = await sql<{ id: number }[]>`
      insert into instagram.follower_snapshots
        (source, total_count, reliable, following_snapshot_id)
      values ('export', ${unique.length}, ${reliable}, ${followingSnapshotId})
      returning id
    `;
    const newId = created[0].id;

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

    // Diff solo su export completi: da uno troncato uscirebbero centinaia di
    // falsi unfollow, permanenti e impossibili da distinguere a posteriori.
    if (prevId && reliable) {
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

    if (reliable) {
      // L'export è ora la fonte di verità: le correzioni manuali "ora mi segue"
      // hanno esaurito il loro scopo.
      await sql`delete from instagram.relationship_overrides`;

      // Le spunte "tolto" su profili che non segui più (o che ora ti ricambiano)
      // non significano più niente: senza questa pulizia riemergono già barrate
      // se il profilo rientra nella lista.
      if (followingSnapshotId != null) {
        await sql`
          delete from instagram.marked_unfollowed m
          where not exists (
            select 1 from instagram.following f
            where f.snapshot_id = ${followingSnapshotId}
              and f.username = m.username
          )
        `;
      }
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
        partial: !reliable,
        expected: accountFollowers,
        got: unique.length,
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
