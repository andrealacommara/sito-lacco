import type postgres from "https://esm.sh/postgres@3.4.5";

// Instagram Graph API (flow "Instagram API with Instagram Login").
// Host: graph.instagram.com. Il token è long-lived (60gg) e rinnovabile
// all'infinito via refresh_access_token (grant_type=ig_refresh_token, solo token).

const GRAPH = "https://graph.instagram.com";
const API_VERSION = "v21.0";
const REFRESH_THRESHOLD_MS = 10 * 24 * 60 * 60 * 1000; // rinnova se < 10gg alla scadenza

export const IG_USER_ID = Deno.env.get("IG_BUSINESS_ACCOUNT_ID") ?? "";

type Sql = ReturnType<typeof postgres>;

type TokenState = { token: string; expiresAt: Date | null };

export type AccountData = {
  followers_count: number;
  follows_count: number;
  media_count: number;
};

export type MediaInsight = {
  ig_media_id: string;
  media_type: string | null;
  permalink: string | null;
  caption: string | null;
  posted_at: string | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  reach: number | null;
  views: number | null;
  thumbnail_url: string | null;
  media_url: string | null;
  // Metriche extra (storie: replies, navigation, total_interactions, ...).
  insights: Record<string, number | null> | null;
};

// ── Token ────────────────────────────────────────────────────────────────────

// Legge il token "vivo" da instagram.app_config; al primo run fa il bootstrap dal
// secret IG_GRAPH_TOKEN (scadenza stimata 60gg) e lo persiste.
export async function getAccessToken(sql: Sql): Promise<TokenState> {
  const rows = await sql<
    { access_token: string | null; token_expires_at: Date | null }[]
  >`select access_token, token_expires_at from instagram.app_config where id = 1`;

  if (rows[0]?.access_token) {
    return { token: rows[0].access_token, expiresAt: rows[0].token_expires_at };
  }

  const envToken = Deno.env.get("IG_GRAPH_TOKEN") ?? "";

  if (!envToken) throw new Error("IG token non configurato (IG_GRAPH_TOKEN)");

  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  await persistToken(sql, envToken, expiresAt);

  return { token: envToken, expiresAt };
}

async function persistToken(sql: Sql, token: string, expiresAt: Date) {
  await sql`
    insert into instagram.app_config (id, access_token, token_expires_at, updated_at)
    values (1, ${token}, ${expiresAt.toISOString()}, now())
    on conflict (id) do update
      set access_token = excluded.access_token,
          token_expires_at = excluded.token_expires_at,
          updated_at = now()
  `;
}

// Rinnova il token se prossimo alla scadenza e ripersiste. Ritorna il token valido.
export async function refreshIfNeeded(
  sql: Sql,
  state: TokenState,
): Promise<string> {
  if (
    !state.expiresAt ||
    state.expiresAt.getTime() - Date.now() > REFRESH_THRESHOLD_MS
  ) {
    return state.token;
  }

  const url = `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${state.token}`;
  const res = await fetch(url);

  if (!res.ok) {
    // Refresh fallito: non è fatale, continuiamo col token attuale finché vale.
    return state.token;
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  const expiresAt = new Date(Date.now() + json.expires_in * 1000);

  await persistToken(sql, json.access_token, expiresAt);

  return json.access_token;
}

// ── Graph calls ───────────────────────────────────────────────────────────────

async function graphGet(
  path: string,
  params: Record<string, string>,
  token: string,
): Promise<any> {
  const qs = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${GRAPH}/${API_VERSION}/${path}?${qs}`);

  if (!res.ok) {
    const err = await res.text();

    throw new Error(`Graph API ${res.status}: ${err}`);
  }

  return res.json();
}

export async function fetchAccount(token: string): Promise<AccountData> {
  const data = await graphGet(
    IG_USER_ID,
    { fields: "followers_count,follows_count,media_count" },
    token,
  );

  return {
    followers_count: data.followers_count ?? 0,
    follows_count: data.follows_count ?? 0,
    media_count: data.media_count ?? 0,
  };
}

// Insight account best-effort (reach giornaliero). Mai fatale: se il metric non è
// disponibile (es. account < 100 follower o metric deprecato) ritorna {}.
export async function fetchAccountInsights(
  token: string,
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};

  try {
    const data = await graphGet(
      `${IG_USER_ID}/insights`,
      { metric: "reach", period: "day" },
      token,
    );

    out.reach = data.data?.[0]?.values?.[0]?.value ?? null;
  } catch {
    // ignorato di proposito
  }

  return out;
}

// Demografica dei follower (età, genere, paese, città). Best-effort: richiede
// il permesso instagram_business_manage_insights e ≥100 follower. Se non
// disponibile ritorna {} senza rompere lo snapshot.
export async function fetchFollowerDemographics(
  token: string,
): Promise<Record<string, Record<string, number>>> {
  const out: Record<string, Record<string, number>> = {};

  for (const dim of ["age", "gender", "country", "city"]) {
    try {
      const data = await graphGet(
        `${IG_USER_ID}/insights`,
        {
          metric: "follower_demographics",
          period: "lifetime",
          timeframe: "last_30_days",
          breakdown: dim,
          metric_type: "total_value",
        },
        token,
      );

      const results =
        data.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
      const map: Record<string, number> = {};

      for (const r of results) {
        const key = r.dimension_values?.[0];

        if (key != null) map[String(key)] = r.value ?? 0;
      }

      if (Object.keys(map).length) out[dim] = map;
    } catch {
      // best-effort: metric non disponibile o permesso mancante
    }
  }

  return out;
}

// Media recenti + insight per-post. like/comment vengono dai campi diretti
// (più affidabili); reach/saves/shares/views dagli insights (best-effort).
export async function fetchRecentMedia(
  token: string,
  limit = 25,
): Promise<MediaInsight[]> {
  const list = await graphGet(
    `${IG_USER_ID}/media`,
    {
      fields:
        "id,media_type,media_product_type,permalink,caption,timestamp,like_count,comments_count,media_url,thumbnail_url",
      limit: String(limit),
    },
    token,
  );

  const media: MediaInsight[] = [];

  for (const m of list.data ?? []) {
    const insights = await fetchMediaInsights(m.id, token);

    media.push({
      ig_media_id: m.id,
      media_type:
        m.media_product_type === "REELS" ? "REEL" : (m.media_type ?? null),
      permalink: m.permalink ?? null,
      caption: m.caption ?? null,
      posted_at: m.timestamp ?? null,
      likes: m.like_count ?? null,
      comments: m.comments_count ?? null,
      saves: insights.saved,
      shares: insights.shares,
      reach: insights.reach,
      views: insights.views,
      // thumbnail_url presente per video/reel; per le immagini usiamo media_url.
      thumbnail_url: m.thumbnail_url ?? null,
      media_url: m.media_url ?? null,
      insights: null,
    });
  }

  return media;
}

// Storie attualmente attive (la Graph API le espone solo finché sono vive, 24h).
// Best-effort: se l'endpoint o gli insight non sono disponibili, ritorna [].
// Le metriche storia (reach/replies/navigation/...) finiscono in `insights`.
export async function fetchStories(token: string): Promise<MediaInsight[]> {
  let list: any;

  try {
    list = await graphGet(
      `${IG_USER_ID}/stories`,
      {
        fields:
          "id,media_type,media_product_type,permalink,timestamp,media_url,thumbnail_url",
      },
      token,
    );
  } catch {
    return [];
  }

  const stories: MediaInsight[] = [];

  for (const s of list.data ?? []) {
    const insights = await fetchStoryInsights(s.id, token);

    stories.push({
      ig_media_id: s.id,
      media_type: "STORY",
      permalink: s.permalink ?? null,
      caption: null,
      posted_at: s.timestamp ?? null,
      likes: null,
      comments: null,
      saves: null,
      shares: typeof insights.shares === "number" ? insights.shares : null,
      reach: typeof insights.reach === "number" ? insights.reach : null,
      views: typeof insights.views === "number" ? insights.views : null,
      thumbnail_url: s.thumbnail_url ?? null,
      media_url: s.media_url ?? null,
      insights,
    });
  }

  return stories;
}

async function fetchStoryInsights(
  mediaId: string,
  token: string,
): Promise<Record<string, number | null>> {
  try {
    const data = await graphGet(
      `${mediaId}/insights`,
      { metric: "reach,replies,shares,total_interactions,navigation" },
      token,
    );
    const map: Record<string, number | null> = {};

    for (const entry of data.data ?? []) {
      map[entry.name] = entry.values?.[0]?.value ?? null;
    }

    return map;
  } catch {
    return {};
  }
}

async function fetchMediaInsights(
  mediaId: string,
  token: string,
): Promise<Record<string, number | null>> {
  try {
    const data = await graphGet(
      `${mediaId}/insights`,
      { metric: "reach,saved,shares,views" },
      token,
    );
    const map: Record<string, number | null> = {};

    for (const entry of data.data ?? []) {
      map[entry.name] = entry.values?.[0]?.value ?? null;
    }

    return map;
  } catch {
    return {};
  }
}
