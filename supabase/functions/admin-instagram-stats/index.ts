import { corsHeaders, jsonResponse } from "../_shared/clients.ts";
import { verifyAdmin } from "../_shared/auth.ts";
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
  if (!(await verifyAdmin(req))) {
    return jsonResponse({ ok: false, error: "Non autorizzato" }, 401, origin);
  }

  const sql = getSql();

  try {
    const growth = await sql<
      { captured_at: string; followers_count: number; follows_count: number }[]
    >`
      select captured_at, followers_count, follows_count
      from instagram.account_snapshots
      where captured_at >= current_date - 90
      order by captured_at asc
    `;

    const latest = await sql<
      { followers_count: number; follows_count: number; media_count: number }[]
    >`
      select followers_count, follows_count, media_count
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

    const recentUnfollowers = await sql<
      {
        username: string;
        was_following_since: string | null;
        detected_at: string;
      }[]
    >`
      select username, was_following_since, detected_at
      from instagram.unfollow_events
      order by detected_at desc limit 25
    `;

    // Ultimo insight per ogni post, poi ordino per engagement.
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
      }[]
    >`
      select distinct on (ig_media_id)
        ig_media_id, permalink, caption, media_type, posted_at,
        likes, comments, saves, shares, reach, views
      from instagram.media_insights
      order by ig_media_id, captured_at desc
    `;

    const token = await sql<{ token_expires_at: string | null }[]>`
      select token_expires_at from instagram.app_config where id = 1
    `;

    const followers = latest[0]?.followers_count ?? null;
    const delta7d =
      followers != null && weekAgo[0]
        ? followers - weekAgo[0].followers_count
        : null;

    const topPosts = posts
      .map((p) => ({
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
        engagement:
          (p.likes ?? 0) + (p.comments ?? 0) + (p.saves ?? 0) + (p.shares ?? 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 8);

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
        })),
        topPosts,
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
