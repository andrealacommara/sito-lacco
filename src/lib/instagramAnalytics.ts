import type {
  InstagramGrowthPoint,
  InstagramPost,
  InstagramRecentUnfollower,
  InstagramVelocity,
} from "@/types/api";

// Derivazioni pure per la dashboard IG. Niente side-effect tranne gli helper di
// download in fondo (DOM), isolati e usati solo on-click.

// ── Tipi contenuto ────────────────────────────────────────────────────────────

export const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: "Post",
  CAROUSEL_ALBUM: "Carosello",
  VIDEO: "Video",
  REEL: "Reel",
  STORY: "Storia",
};

export function mediaTypeLabel(type: string | null): string {
  if (!type) return "Contenuto";

  return MEDIA_TYPE_LABELS[type] ?? type;
}

/** Tipi macro per le tab Contenuti. STORY a parte; il resto è "post" o "reel". */
export type ContentBucket = "post" | "reel" | "story";

export function bucketOf(type: string | null): ContentBucket {
  if (type === "STORY") return "story";
  if (type === "REEL") return "reel";

  return "post";
}

// ── Engagement & virality ─────────────────────────────────────────────────────

/** Engagement rate normalizzato (in %). Preferisce reach, poi i follower. */
export function engagementRate(
  post: InstagramPost,
  followers: number | null | undefined,
): { onReach: number | null; onFollowers: number | null } {
  const eng = post.engagement;

  return {
    onReach: post.reach && post.reach > 0 ? (eng / post.reach) * 100 : null,
    onFollowers: followers && followers > 0 ? (eng / followers) * 100 : null,
  };
}

export function viralitySignals(
  post: InstagramPost,
  followers: number | null | undefined,
): {
  saveRate: number | null; // saves / reach
  shareRate: number | null; // shares / reach
  reachEfficiency: number | null; // reach / followers (>100% = oltre i follower)
} {
  const r = post.reach && post.reach > 0 ? post.reach : null;

  return {
    saveRate: r && post.saves != null ? (post.saves / r) * 100 : null,
    shareRate: r && post.shares != null ? (post.shares / r) * 100 : null,
    reachEfficiency:
      post.reach != null && followers && followers > 0
        ? (post.reach / followers) * 100
        : null,
  };
}

// ── Split per tipo ────────────────────────────────────────────────────────────

export type TypeStat = {
  type: string;
  label: string;
  count: number;
  avgEngagement: number;
  avgReach: number | null;
};

export function typeBreakdown(posts: InstagramPost[]): TypeStat[] {
  const groups = new Map<string, InstagramPost[]>();

  for (const p of posts) {
    const key = p.mediaType ?? "IMAGE";

    groups.set(key, [...(groups.get(key) ?? []), p]);
  }

  return [...groups.entries()]
    .map(([type, items]) => {
      const reachVals = items
        .map((i) => i.reach)
        .filter((r): r is number => r != null);

      return {
        type,
        label: mediaTypeLabel(type),
        count: items.length,
        avgEngagement: Math.round(
          items.reduce((s, i) => s + i.engagement, 0) / items.length,
        ),
        avgReach: reachVals.length
          ? Math.round(reachVals.reduce((s, r) => s + r, 0) / reachVals.length)
          : null,
      };
    })
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

// ── Hashtag ───────────────────────────────────────────────────────────────────

export type HashtagStat = {
  tag: string;
  count: number;
  avgEngagement: number;
};

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;

export function extractHashtags(posts: InstagramPost[]): HashtagStat[] {
  const map = new Map<string, { count: number; eng: number }>();

  for (const p of posts) {
    if (!p.caption) continue;
    const tags = p.caption.match(HASHTAG_RE);

    if (!tags) continue;
    // dedup per post: lo stesso tag ripetuto conta una volta sola.
    for (const raw of new Set(tags.map((t) => t.toLowerCase()))) {
      const prev = map.get(raw) ?? { count: 0, eng: 0 };

      map.set(raw, { count: prev.count + 1, eng: prev.eng + p.engagement });
    }
  }

  return [...map.entries()]
    .map(([tag, v]) => ({
      tag,
      count: v.count,
      avgEngagement: Math.round(v.eng / v.count),
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

// ── Quando pubblicare (engagement medio per giorno / fascia oraria) ───────────

export const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
export const TIME_BUCKETS = ["0-4", "4-8", "8-12", "12-16", "16-20", "20-24"];

export type SlotStat = { label: string; avg: number; count: number };

// getDay(): 0=Dom..6=Sab → rimappo a 0=Lun..6=Dom.
const dayIndex = (d: Date) => (d.getDay() + 6) % 7;
const bucketIndex = (d: Date) => Math.min(5, Math.floor(d.getHours() / 4));

function aggregateBy(
  posts: InstagramPost[],
  labels: string[],
  indexOf: (d: Date) => number,
): SlotStat[] {
  const acc = labels.map(() => ({ sum: 0, count: 0 }));

  for (const p of posts) {
    if (!p.postedAt) continue;
    const cell = acc[indexOf(new Date(p.postedAt))];

    cell.sum += p.engagement;
    cell.count += 1;
  }

  return labels.map((label, i) => ({
    label,
    avg: acc[i].count ? Math.round(acc[i].sum / acc[i].count) : 0,
    count: acc[i].count,
  }));
}

export function engagementByDay(posts: InstagramPost[]): SlotStat[] {
  return aggregateBy(posts, DAY_LABELS, dayIndex);
}

export function engagementByBucket(posts: InstagramPost[]): SlotStat[] {
  return aggregateBy(posts, TIME_BUCKETS, bucketIndex);
}

/**
 * Distribuzione dei follower online per fascia oraria (le stesse 6 fasce di
 * `engagementByBucket`, così i due grafici sono confrontabili). `map` arriva da
 * Meta con ore in UTC (0-23 → conteggio): le converto in ora locale —
 * coerente col resto del dashboard, che usa `new Date(postedAt)` in locale.
 * `tzOffsetMinutes` = `Date.getTimezoneOffset()` (passato dal chiamante per
 * mantenere pura questa funzione): minuti da aggiungere al locale per ottenere
 * UTC, quindi localHour = utcHour - offsetMin/60 (Italia estate -120 → +2).
 */
export function onlineFollowersByBucket(
  map: Record<string, number> | null | undefined,
  tzOffsetMinutes: number,
): SlotStat[] {
  const acc = TIME_BUCKETS.map(() => 0);

  if (map) {
    const offsetH = tzOffsetMinutes / 60;

    for (const [hourStr, count] of Object.entries(map)) {
      const utcHour = Number(hourStr);

      if (!Number.isFinite(utcHour) || typeof count !== "number") continue;
      const localHour = (((utcHour - offsetH) % 24) + 24) % 24;

      acc[Math.min(5, Math.floor(localHour / 4))] += count;
    }
  }

  return TIME_BUCKETS.map((label, i) => ({
    label,
    avg: Math.round(acc[i]),
    count: acc[i] > 0 ? 1 : 0,
  }));
}

/** Miglior combinazione giorno×fascia tra quelle con dati. */
export function bestSlot(
  posts: InstagramPost[],
): { day: string; bucket: string; avg: number } | null {
  const grid = new Map<string, { sum: number; count: number }>();

  for (const p of posts) {
    if (!p.postedAt) continue;
    const d = new Date(p.postedAt);
    const key = `${dayIndex(d)}|${bucketIndex(d)}`;
    const cell = grid.get(key) ?? { sum: 0, count: 0 };

    cell.sum += p.engagement;
    cell.count += 1;
    grid.set(key, cell);
  }

  let best: { day: string; bucket: string; avg: number } | null = null;

  for (const [key, cell] of grid) {
    const avg = Math.round(cell.sum / cell.count);

    if (!best || avg > best.avg) {
      const [di, bi] = key.split("|").map(Number);

      best = { day: DAY_LABELS[di], bucket: TIME_BUCKETS[bi], avg };
    }
  }

  return best;
}

// ── Churn & fedeltà ───────────────────────────────────────────────────────────

export function churnRate(
  unfollowersLast30: number | undefined,
  followers: number | null | undefined,
): number | null {
  if (!followers || followers <= 0 || unfollowersLast30 == null) return null;

  return (unfollowersLast30 / followers) * 100;
}

/** Giorni di "fedeltà" (since → detectedAt) per ogni unfollower con data nota. */
export function unfollowerTenure(
  unfollowers: InstagramRecentUnfollower[],
): number[] {
  const days: number[] = [];

  for (const u of unfollowers) {
    if (!u.since) continue;
    const ms = new Date(u.detectedAt).getTime() - new Date(u.since).getTime();

    if (ms > 0) days.push(Math.round(ms / 86_400_000));
  }

  return days;
}

export function avgTenure(days: number[]): number | null {
  if (!days.length) return null;

  return Math.round(days.reduce((s, d) => s + d, 0) / days.length);
}

/** Istogramma della tenure in bucket (giorni → mesi grossolani). */
export const TENURE_BUCKETS: { label: string; max: number }[] = [
  { label: "<1m", max: 30 },
  { label: "1-3m", max: 90 },
  { label: "3-6m", max: 180 },
  { label: "6-12m", max: 365 },
  { label: ">1a", max: Infinity },
];

export function tenureHistogram(
  days: number[],
): { label: string; count: number }[] {
  return TENURE_BUCKETS.map((b, i) => {
    const min = i === 0 ? 0 : TENURE_BUCKETS[i - 1].max;

    return {
      label: b.label,
      count: days.filter((d) => d >= min && d < b.max).length,
    };
  });
}

// ── Confronto tra periodi ─────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

export type PeriodMetric = {
  key: "followers" | "reach" | "engagement" | "er";
  label: string;
  current: number | null;
  previous: number | null;
  deltaPct: number | null; // variazione % corrente vs precedente
  unit: "" | "%";
  signed: boolean; // mostra il segno (+/–) sul valore, es. guadagno follower
};

const inWindow = (posts: InstagramPost[], startMs: number, endMs: number) =>
  posts.filter((p) => {
    if (!p.postedAt) return false;
    const t = new Date(p.postedAt).getTime();

    return t >= startMs && t < endMs;
  });

const avgErOnReach = (posts: InstagramPost[]): number | null => {
  const vals = posts
    .map((p) =>
      p.reach && p.reach > 0 ? (p.engagement / p.reach) * 100 : null,
    )
    .filter((v): v is number => v != null);

  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
};

// Follower all'istante `ms`: ultimo snapshot con data ≤ ms (growth è asc).
const followersAt = (
  growth: InstagramGrowthPoint[],
  ms: number,
): number | null => {
  let val: number | null = null;

  for (const g of growth) {
    if (new Date(g.date).getTime() <= ms) val = g.followers;
    else break;
  }

  return val;
};

const avgReachInWindow = (
  growth: InstagramGrowthPoint[],
  startMs: number,
  endMs: number,
): number | null => {
  const vals = growth
    .filter((g) => {
      const t = new Date(g.date).getTime();

      return t >= startMs && t < endMs;
    })
    .map((g) => g.reach)
    .filter((v): v is number => v != null && v > 0);

  return vals.length
    ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
    : null;
};

const deltaPct = (cur: number | null, prev: number | null): number | null =>
  cur != null && prev != null && prev !== 0
    ? ((cur - prev) / Math.abs(prev)) * 100
    : null;

/**
 * Confronto finestra corrente vs precedente (stessa ampiezza). Engagement ed ER
 * dai post pubblicati nella finestra; follower (guadagno netto) e reach medio
 * dalla serie account.
 */
export function periodComparison(
  posts: InstagramPost[],
  growth: InstagramGrowthPoint[],
  windowDays: number,
): PeriodMetric[] {
  const now = Date.now();
  const span = windowDays * DAY_MS;
  const curStart = now - span;
  const prevStart = now - 2 * span;

  const curPosts = inWindow(posts, curStart, now);
  const prevPosts = inWindow(posts, prevStart, curStart);

  const curFollowers = followersAt(growth, now);
  const midFollowers = followersAt(growth, curStart);
  const prevFollowers = followersAt(growth, prevStart);
  const curFollowerNet =
    curFollowers != null && midFollowers != null
      ? curFollowers - midFollowers
      : null;
  const prevFollowerNet =
    midFollowers != null && prevFollowers != null
      ? midFollowers - prevFollowers
      : null;

  const curReach = avgReachInWindow(growth, curStart, now);
  const prevReach = avgReachInWindow(growth, prevStart, curStart);

  const curEng = curPosts.reduce((s, p) => s + p.engagement, 0);
  const prevEng = prevPosts.reduce((s, p) => s + p.engagement, 0);

  const curEr = avgErOnReach(curPosts);
  const prevEr = avgErOnReach(prevPosts);

  const round = (v: number | null) => (v == null ? null : Math.round(v));
  const round1 = (v: number | null) =>
    v == null ? null : Math.round(v * 10) / 10;

  return [
    {
      key: "followers",
      label: "Follower netti",
      current: curFollowerNet,
      previous: prevFollowerNet,
      deltaPct: deltaPct(curFollowerNet, prevFollowerNet),
      unit: "",
      signed: true,
    },
    {
      key: "reach",
      label: "Reach medio",
      current: curReach,
      previous: prevReach,
      deltaPct: deltaPct(curReach, prevReach),
      unit: "",
      signed: false,
    },
    {
      key: "engagement",
      label: "Engagement",
      current: curPosts.length ? curEng : null,
      previous: prevPosts.length ? prevEng : null,
      deltaPct: deltaPct(
        curPosts.length ? curEng : null,
        prevPosts.length ? prevEng : null,
      ),
      unit: "",
      signed: false,
    },
    {
      key: "er",
      label: "ER medio",
      current: round1(curEr),
      previous: round1(prevEr),
      deltaPct: deltaPct(curEr, prevEr),
      unit: "%",
      signed: false,
    },
  ].map((m) => ({
    ...m,
    current: m.key === "er" ? m.current : round(m.current),
  })) as PeriodMetric[];
}

// ── Ciclo di vita post ────────────────────────────────────────────────────────

export type LifecycleStatus = "growing" | "plateau";

export type PostLifecycle = {
  status: LifecycleStatus;
  daysToPeak: number | null; // snapshot dall'inizio al picco di engagement
  latestEngagement: number;
};

/**
 * Stato di un post dalla sua serie giornaliera. `growing` se l'ultimo rilevamento
 * è cresciuto oltre l'1% sul precedente, altrimenti `plateau`. Una sola
 * rilevazione = troppo recente, lo consideriamo ancora in crescita.
 */
export function postLifecycle(
  series: InstagramVelocity["series"],
): PostLifecycle | null {
  if (!series.length) return null;
  const vals = series.map((s) => s.likes + s.comments + s.saves);
  const latest = vals[vals.length - 1];

  let peakIdx = 0;

  for (let i = 1; i < vals.length; i++) {
    if (vals[i] > vals[peakIdx]) peakIdx = i;
  }

  let status: LifecycleStatus = "growing";

  if (vals.length >= 2) {
    const prev = vals[vals.length - 2];
    const delta = latest - prev;

    status = delta / (prev || 1) > 0.01 ? "growing" : "plateau";
  }

  return { status, daysToPeak: peakIdx, latestEngagement: latest };
}

// ── Consigli automatici ───────────────────────────────────────────────────────

export type InsightTone = "good" | "warn" | "tip";
export type Insight = { tone: InsightTone; text: string };

/** Sintesi azionabile che compone le derivazioni esistenti in poche frasi. */
export function buildInsights(args: {
  posts: InstagramPost[];
  followers: number | null | undefined;
  growth: InstagramGrowthPoint[];
  unfollowersLast30: number | undefined;
  delta7d: number | null | undefined;
}): Insight[] {
  const { posts, followers, growth, unfollowersLast30, delta7d } = args;
  const nonStory = posts.filter((p) => p.mediaType !== "STORY");
  const out: Insight[] = [];

  if (nonStory.length === 0) return out;

  const types = typeBreakdown(nonStory);

  if (types.length > 1) {
    const top = types[0];

    out.push({
      tone: "tip",
      text: `I ${top.label} rendono di più: ${top.avgEngagement} di engagement medio. Puntaci più spesso.`,
    });
  }

  const slot = bestSlot(nonStory);

  if (slot) {
    out.push({
      tone: "tip",
      text: `Momento migliore per pubblicare: ${slot.day} nella fascia ${slot.bucket}.`,
    });
  }

  const hashtags = extractHashtags(nonStory);

  if (hashtags.length && hashtags[0].count >= 2) {
    out.push({
      tone: "good",
      text: `${hashtags[0].tag} è il tuo hashtag più efficace (${hashtags[0].avgEngagement} engagement medio su ${hashtags[0].count} post).`,
    });
  }

  const churn = churnRate(unfollowersLast30, followers);

  if (delta7d != null && delta7d < 0) {
    out.push({
      tone: "warn",
      text: `Hai perso ${Math.abs(delta7d)} follower negli ultimi 7 giorni${
        churn != null ? ` (churn ${churn.toFixed(1)}%)` : ""
      }.`,
    });
  } else if (churn != null && churn > 2) {
    out.push({
      tone: "warn",
      text: `Churn alto: ${churn.toFixed(1)}% dei follower persi in 30 giorni. Cura la costanza.`,
    });
  }

  const reachEffVals = nonStory
    .map((p) => viralitySignals(p, followers).reachEfficiency)
    .filter((v): v is number => v != null);
  const reachEff = reachEffVals.length
    ? reachEffVals.reduce((s, v) => s + v, 0) / reachEffVals.length
    : null;

  if (reachEff != null && reachEff < 100) {
    out.push({
      tone: "warn",
      text: `I contenuti restano nella tua bolla: reach medio al ${Math.round(
        reachEff,
      )}% dei follower. Prova Reel e hashtag nuovi per uscirne.`,
    });
  } else if (reachEff != null && reachEff >= 150) {
    out.push({
      tone: "good",
      text: `Ottima distribuzione: reach medio al ${Math.round(
        reachEff,
      )}% dei follower, stai arrivando oltre la tua cerchia.`,
    });
  }

  const lastPostedMs = Math.max(
    0,
    ...nonStory.map((p) => (p.postedAt ? new Date(p.postedAt).getTime() : 0)),
  );

  if (lastPostedMs > 0) {
    const days = Math.floor((Date.now() - lastPostedMs) / DAY_MS);

    if (days >= 7) {
      out.push({
        tone: "warn",
        text: `Non pubblichi da ${days} giorni: la costanza è il fattore numero uno per crescere.`,
      });
    }
  }

  const reachTrend = periodComparison(nonStory, growth, 30).find(
    (m) => m.key === "reach",
  );

  if (reachTrend?.deltaPct != null && reachTrend.deltaPct <= -15) {
    out.push({
      tone: "warn",
      text: `Reach account in calo del ${Math.abs(
        Math.round(reachTrend.deltaPct),
      )}% rispetto al mese precedente.`,
    });
  } else if (reachTrend?.deltaPct != null && reachTrend.deltaPct >= 15) {
    out.push({
      tone: "good",
      text: `Reach account in crescita del ${Math.round(
        reachTrend.deltaPct,
      )}% rispetto al mese precedente.`,
    });
  }

  return out;
}

// ── Export JSON/CSV ───────────────────────────────────────────────────────────

export function toCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v ?? "");

    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export function download(
  filename: string,
  content: string,
  mime: string,
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
