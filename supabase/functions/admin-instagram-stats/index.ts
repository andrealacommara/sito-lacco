import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { getSql } from "../_shared/db.ts";

// GET counter + serie per la dashboard. Gemello concettuale di admin-stats.

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (req.method !== "GET") {
    return jsonResponse({ ok: false, error: "Metodo non valido" }, 405, origin);
  }
  const denied = await requireAdmin(req, origin);

  if (denied) return denied;

  const sql = getSql();

  try {
    const growth = await sql<
      {
        captured_at: string;
        followers_count: number;
        follows_count: number;
        insights: { reach?: number | null } | null;
      }[]
    >`
      select captured_at, followers_count, follows_count, insights
      from instagram.account_snapshots
      where captured_at >= current_date - 90
      order by captured_at asc
    `;

    const latest = await sql<
      {
        followers_count: number;
        follows_count: number;
        media_count: number;
        insights: {
          demographics?: Record<string, Record<string, number>>;
          reach28?: number | null;
          engagement?: Record<string, number | null>;
          onlineFollowers?: Record<string, number>;
        } | null;
      }[]
    >`
      select followers_count, follows_count, media_count, insights
      from instagram.account_snapshots
      order by captured_at desc limit 1
    `;

    const weekAgo = await sql<{ followers_count: number }[]>`
      select followers_count from instagram.account_snapshots
      where captured_at <= current_date - 7
      order by captured_at desc limit 1
    `;

    const unfollowers30 = await sql<{ count: number }[]>`
      select count(*)::int as count from instagram.unfollow_events
      where detected_at >= now() - interval '30 days'
    `;

    // Più ampio del display (~25) per alimentare churn/fedeltà e i download.
    const recentUnfollowers = await sql<
      {
        username: string;
        was_following_since: string | null;
        detected_at: string;
      }[]
    >`
      select username, was_following_since, detected_at
      from instagram.unfollow_events
      order by detected_at desc limit 200
    `;

    // Serie giornaliera guadagnati/persi (crescita scomposta), 90gg.
    const gainedByDay = await sql<{ d: string; c: number }[]>`
      select to_char(detected_at::date, 'YYYY-MM-DD') as d, count(*)::int as c
      from instagram.follow_events
      where detected_at >= now() - interval '90 days'
      group by 1
    `;
    const lostByDay = await sql<{ d: string; c: number }[]>`
      select to_char(detected_at::date, 'YYYY-MM-DD') as d, count(*)::int as c
      from instagram.unfollow_events
      where detected_at >= now() - interval '90 days'
      group by 1
    `;

    // Ultimo insight per ogni post (incluse le storie, media_type='STORY').
    const posts = await sql<
      {
        ig_media_id: string;
        permalink: string | null;
        caption: string | null;
        media_type: string | null;
        posted_at: string | null;
        likes: number | null;
        comments: number | null;
        saves: number | null;
        shares: number | null;
        reach: number | null;
        views: number | null;
        thumbnail_url: string | null;
        media_url: string | null;
        insights: Record<string, number | null> | null;
      }[]
    >`
      select distinct on (ig_media_id)
        ig_media_id, permalink, caption, media_type, posted_at,
        likes, comments, saves, shares, reach, views,
        thumbnail_url, media_url, insights
      from instagram.media_insights
      order by ig_media_id, captured_at desc
    `;

    // Velocity / ciclo di vita: serie storica engagement dei post non-storia
    // pubblicati negli ultimi 30 giorni (cap a 15, dal più recente). Alimenta sia
    // il grafico velocity sia la classificazione "in crescita / plateau".
    const lifecycleCutoff = Date.now() - 30 * 86_400_000;
    const recentIds = posts
      .filter(
        (p) =>
          p.media_type !== "STORY" &&
          p.posted_at &&
          new Date(p.posted_at).getTime() >= lifecycleCutoff,
      )
      .sort(
        (a, b) =>
          new Date(b.posted_at!).getTime() - new Date(a.posted_at!).getTime(),
      )
      .slice(0, 15)
      .map((p) => p.ig_media_id);

    const velocityRows = recentIds.length
      ? await sql<
          {
            ig_media_id: string;
            captured_at: string;
            likes: number | null;
            comments: number | null;
            saves: number | null;
          }[]
        >`
          select ig_media_id, to_char(captured_at, 'YYYY-MM-DD') as captured_at,
            likes, comments, saves
          from instagram.media_insights
          where ig_media_id = any(${recentIds})
          order by captured_at asc
        `
      : [];

    // Diff tra gli ultimi due snapshot dei "seguiti": chi ho iniziato/smesso di seguire.
    const fsnaps = await sql<{ id: number }[]>`
      select id from instagram.following_snapshots
      order by captured_at desc limit 2
    `;
    let stoppedFollowing: string[] = [];
    let startedFollowing: string[] = [];

    if (fsnaps.length === 2) {
      const [latest, previous] = fsnaps;

      const stopped = await sql<{ username: string }[]>`
        select username from instagram.following
        where snapshot_id = ${previous.id}
          and not exists (
            select 1 from instagram.following cur
            where cur.snapshot_id = ${latest.id} and cur.username = following.username
          )
        limit 200
      `;
      const started = await sql<{ username: string }[]>`
        select username from instagram.following cur
        where cur.snapshot_id = ${latest.id}
          and not exists (
            select 1 from instagram.following prev
            where prev.snapshot_id = ${previous.id} and prev.username = cur.username
          )
        limit 200
      `;

      stoppedFollowing = stopped.map((r) => r.username);
      startedFollowing = started.map((r) => r.username);
    }

    // Relazioni: reciproci / non ti ricambiano / ti seguono, dall'ultimo snapshot
    // follower e dal following snapshot ACCOPPIATO (stesso upload), non da due
    // "order by captured_at desc" indipendenti che potevano puntare a date diverse.
    // `reliable` è letto dalla colonna congelata all'upload: ricalcolarlo contro il
    // conteggio live faceva sparire la lista da sola man mano che i follower
    // crescevano.
    const snap = await sql<
      {
        id: number;
        captured_at: string;
        reliable: boolean;
        following_snapshot_id: number | null;
        following_captured_at: string | null;
      }[]
    >`
      select fs.id, fs.captured_at, fs.reliable, fs.following_snapshot_id,
             gs.captured_at as following_captured_at
      from instagram.follower_snapshots fs
      left join instagram.following_snapshots gs on gs.id = fs.following_snapshot_id
      order by fs.captured_at desc limit 1
    `;

    const overrideRows = await sql<{ username: string }[]>`
      select username from instagram.relationship_overrides where state = 'follows_you'
    `;
    const overrides = overrideRows.map((r) => r.username);

    let relationships: {
      available: boolean;
      reliable: boolean;
      capturedAt: string | null;
      followingCapturedAt: string | null;
      mutuals: string[];
      notFollowingBack: string[];
      fans: string[];
      overrides: string[];
    } = {
      available: false,
      reliable: true,
      capturedAt: snap[0]?.captured_at ?? null,
      followingCapturedAt: null,
      mutuals: [],
      notFollowingBack: [],
      fans: [],
      overrides,
    };

    const followerSnapId = snap[0]?.id ?? null;
    const followingSnapId = snap[0]?.following_snapshot_id ?? null;

    if (followerSnapId != null && followingSnapId != null) {
      const diff = await sql<
        { mutuals: string[]; not_following_back: string[]; fans: string[] }[]
      >`
        select
          (
            select coalesce(array_agg(f.username order by f.username), '{}')
            from instagram.following f
            where f.snapshot_id = ${followingSnapId}
              and exists (
                select 1 from instagram.followers fo
                where fo.snapshot_id = ${followerSnapId} and fo.username = f.username
              )
          ) as mutuals,
          (
            select coalesce(array_agg(f.username order by f.username), '{}')
            from instagram.following f
            where f.snapshot_id = ${followingSnapId}
              and not exists (
                select 1 from instagram.followers fo
                where fo.snapshot_id = ${followerSnapId} and fo.username = f.username
              )
          ) as not_following_back,
          (
            select coalesce(array_agg(fo.username order by fo.username), '{}')
            from instagram.followers fo
            where fo.snapshot_id = ${followerSnapId}
              and not exists (
                select 1 from instagram.following f
                where f.snapshot_id = ${followingSnapId} and f.username = fo.username
              )
          ) as fans
      `;

      // Le correzioni manuali "ora mi segue" spostano il profilo tra i reciproci
      // finché il prossimo export non conferma (o smentisce).
      const overrideSet = new Set(overrides);
      const notFollowingBack = (diff[0]?.not_following_back ?? []).filter(
        (u) => !overrideSet.has(u),
      );
      const mutuals = [
        ...(diff[0]?.mutuals ?? []),
        ...(diff[0]?.not_following_back ?? []).filter((u) =>
          overrideSet.has(u),
        ),
      ].sort((a, b) => a.localeCompare(b));

      relationships = {
        available: true,
        reliable: snap[0]?.reliable ?? true,
        capturedAt: snap[0]?.captured_at ?? null,
        followingCapturedAt: snap[0]?.following_captured_at ?? null,
        mutuals,
        notFollowingBack,
        fans: diff[0]?.fans ?? [],
        overrides,
      };
    }

    // Universo corrente: marks e tag fuori da qui sono residui di fotografie
    // vecchie e non devono riemergere (facevano ricomparire profili già barrati).
    const known = new Set([
      ...relationships.mutuals,
      ...relationships.notFollowingBack,
      ...relationships.fans,
    ]);

    const marked = await sql<{ username: string }[]>`
      select username from instagram.marked_unfollowed
    `;

    const tagRows = await sql<{ username: string; tag: string }[]>`
      select username, tag from instagram.account_tags
    `;
    const tags: Record<string, string> = {};

    for (const r of tagRows) {
      if (!known.size || known.has(r.username)) tags[r.username] = r.tag;
    }

    const token = await sql<{ token_expires_at: string | null }[]>`
      select token_expires_at from instagram.app_config where id = 1
    `;

    const followers = latest[0]?.followers_count ?? null;
    const delta7d =
      followers != null && weekAgo[0]
        ? followers - weekAgo[0].followers_count
        : null;

    // Lista completa dei post (il client deriva top/chrono/split/ER/hashtag).
    const allPosts = posts.map((p) => ({
      id: p.ig_media_id,
      permalink: p.permalink,
      caption: p.caption,
      mediaType: p.media_type,
      postedAt: p.posted_at,
      likes: p.likes,
      comments: p.comments,
      saves: p.saves,
      shares: p.shares,
      reach: p.reach,
      views: p.views,
      thumbnailUrl: p.thumbnail_url,
      mediaUrl: p.media_url,
      storyMetrics: p.insights,
      engagement:
        (p.likes ?? 0) + (p.comments ?? 0) + (p.saves ?? 0) + (p.shares ?? 0),
    }));

    // Merge guadagnati/persi per giorno.
    const flowMap = new Map<string, { gained: number; lost: number }>();

    for (const g of gainedByDay)
      flowMap.set(g.d, { gained: g.c, lost: flowMap.get(g.d)?.lost ?? 0 });
    for (const l of lostByDay)
      flowMap.set(l.d, { gained: flowMap.get(l.d)?.gained ?? 0, lost: l.c });
    const flow = [...flowMap.entries()]
      .map(([date, v]) => ({ date, gained: v.gained, lost: v.lost }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Velocity raggruppata per post.
    const velocityMap = new Map<
      string,
      { capturedAt: string; likes: number; comments: number; saves: number }[]
    >();

    for (const r of velocityRows) {
      const arr = velocityMap.get(r.ig_media_id) ?? [];

      arr.push({
        capturedAt: r.captured_at,
        likes: r.likes ?? 0,
        comments: r.comments ?? 0,
        saves: r.saves ?? 0,
      });
      velocityMap.set(r.ig_media_id, arr);
    }
    const velocity = recentIds.map((id) => ({
      id,
      series: velocityMap.get(id) ?? [],
    }));

    // Engagement account-level: rimappo le chiavi snake_case di Meta in camelCase
    // per coerenza col resto della response. null se nessuna metrica disponibile.
    const rawEngagement = latest[0]?.insights?.engagement ?? null;
    const accountEngagement = rawEngagement
      ? {
          totalInteractions: rawEngagement.total_interactions ?? null,
          accountsEngaged: rawEngagement.accounts_engaged ?? null,
          profileViews: rawEngagement.profile_views ?? null,
          profileLinksTaps: rawEngagement.profile_links_taps ?? null,
          followsAndUnfollows: rawEngagement.follows_and_unfollows ?? null,
          views: rawEngagement.views ?? null,
          likes: rawEngagement.likes ?? null,
          comments: rawEngagement.comments ?? null,
          saves: rawEngagement.saves ?? null,
          shares: rawEngagement.shares ?? null,
          replies: rawEngagement.replies ?? null,
        }
      : null;

    return jsonResponse(
      {
        ok: true,
        followers,
        follows: latest[0]?.follows_count ?? null,
        mediaCount: latest[0]?.media_count ?? null,
        delta7d,
        unfollowersLast30: unfollowers30[0]?.count ?? 0,
        growth: growth.map((g) => ({
          date: g.captured_at,
          followers: g.followers_count,
          follows: g.follows_count,
          reach: g.insights?.reach ?? null,
        })),
        posts: allPosts,
        flow,
        velocity,
        followingChanges: { stoppedFollowing, startedFollowing },
        relationships,
        markedUnfollowed: marked
          .map((m) => m.username)
          .filter((u) => !known.size || known.has(u)),
        tags,
        demographics: latest[0]?.insights?.demographics ?? null,
        accountEngagement,
        reach28: latest[0]?.insights?.reach28 ?? null,
        onlineFollowers: latest[0]?.insights?.onlineFollowers ?? null,
        recentUnfollowers: recentUnfollowers.map((u) => ({
          username: u.username,
          since: u.was_following_since,
          detectedAt: u.detected_at,
        })),
        tokenExpiresAt: token[0]?.token_expires_at ?? null,
      },
      200,
      origin,
    );
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, origin);
  }
});
