import type { InstagramPost, InstagramRecentUnfollower } from "@/types/api";

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
