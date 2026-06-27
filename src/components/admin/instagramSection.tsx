import type { Session } from "@supabase/supabase-js";
import type {
  InstagramAccountTag,
  InstagramDemographics,
  InstagramExportBody,
  InstagramAccountEngagement,
  InstagramExportResponse,
  InstagramGrowthPoint,
  InstagramPost,
  InstagramSnapshotResponse,
  InstagramStatsResponse,
  InstagramVelocity,
} from "@/types/api";
import type { Insight, InsightTone } from "@/lib/instagramAnalytics";
import type { EngagementTier } from "@/lib/instagramAnalytics";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxContent,
  CheckboxControl,
  CheckboxIndicator,
  Chip,
  Spinner,
  toast,
} from "@heroui/react";
import JSZip from "jszip";
import clsx from "clsx";

import AdminSelect from "@/components/admin/adminSelect";
import { EF_BASE } from "@/lib/supabase";
import {
  GrowthChart,
  ReachChart,
  FlowChart,
  ChronoEngagementChart,
  TypeBreakdownChart,
  VelocityChart,
  TenureHistogram,
  UnfollowTimelineChart,
  AvgBarChart,
  OnlineFollowersChart,
  CadenceChart,
} from "@/components/admin/instagramCharts";
import {
  bucketOf,
  mediaTypeLabel,
  engagementRate,
  engagementRateOnReach,
  viralitySignals,
  typeBreakdown,
  extractHashtags,
  engagementByDay,
  engagementByBucket,
  onlineFollowersByBucket,
  bestSlot,
  churnRate,
  unfollowerTenure,
  avgTenure,
  tenureHistogram,
  periodComparison,
  buildInsights,
  buildAdvicePayload,
  postLifecycle,
  engagementTiers,
  postingCadence,
  toCsv,
  download,
} from "@/lib/instagramAnalytics";
import LikesIcon from "@/assets/icons/likes.svg?react";
import CommentsIcon from "@/assets/icons/comments.svg?react";
import SavesIcon from "@/assets/icons/saves.svg?react";
import SharesIcon from "@/assets/icons/shares.svg?react";
import ReachIcon from "@/assets/icons/reach.svg?react";
import ViewsIcon from "@/assets/icons/views.svg?react";
import RefreshIcon from "@/assets/icons/refresh.svg?react";

type SubTab = "dashboard" | "follower" | "contenuti";
type ContentTab = "generale" | "post" | "reel" | "storie";

const IG_DOWNLOAD_URL =
  "https://accountscenter.instagram.com/info_and_permissions/dyi/";

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100];

// Tag manuali per classificare i profili "Non ti ricambiano". Instagram non
// espone il conteggio follower di account terzi via API, quindi la categoria
// (persona / VIP / pagina) la assegni a mano e serve a filtrare la lista.
const TAG_OPTIONS: { key: InstagramAccountTag; label: string }[] = [
  { key: "persona", label: "Persona" },
  { key: "vip", label: "VIP" },
  { key: "pagina", label: "Pagina" },
];

// Colore del trigger del select quando un tag è assegnato (distinzione a colpo
// d'occhio): verde = persona, giallo = VIP, blu = pagina.
const TAG_TRIGGER_CLASS: Record<InstagramAccountTag, string> = {
  persona: "border-success bg-success-soft text-success font-semibold",
  vip: "border-warning bg-warning-soft text-warning font-semibold",
  pagina: "border-primary bg-primary-soft text-primary font-semibold",
};

const dateFmt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("it-IT") : "–";

const pct = (n: number | null) => (n == null ? "–" : `${n.toFixed(1)}%`);

type ParsedExport = {
  followers: { username: string; followedYouAt: string | null }[];
  following: string[];
};

type SldEntry = { value: string; timestamp: number | null };

// Ricava lo username dall'href Instagram (es. ".../_u/mario.rossi" → "mario.rossi").
function hrefUsername(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const seg = href.split("?")[0].replace(/\/+$/, "").split("/").pop();

  return seg || null;
}

// Raccoglie ricorsivamente OGNI voce con `string_list_data` ovunque nel JSON.
// Lo username può stare in `value` (follower), in `title` (seguiti) o ricavato
// dall'href: l'export Instagram non è uniforme. Indipendente da chiave/annidamento.
function deepStringListValues(node: unknown, out: SldEntry[]): void {
  if (Array.isArray(node)) {
    for (const item of node) deepStringListValues(item, out);

    return;
  }
  if (!node || typeof node !== "object") return;

  const obj = node as Record<string, unknown>;
  const sld = obj.string_list_data;

  if (Array.isArray(sld)) {
    const title =
      typeof obj.title === "string" && obj.title.trim()
        ? obj.title.trim()
        : null;

    for (const s of sld as {
      value?: string;
      href?: string;
      timestamp?: number;
    }[]) {
      const value =
        (typeof s?.value === "string" && s.value) ||
        title ||
        hrefUsername(s?.href);

      if (value) out.push({ value, timestamp: s?.timestamp ?? null });
    }
  }
  for (const k in obj) {
    if (k !== "string_list_data") deepStringListValues(obj[k], out);
  }
}

// Estrae follower (con data) e seguiti da uno ZIP export Instagram, lato client.
// Classifica i file come followers/following per nome O per chiave JSON
// (relationships_followers / relationships_following), poi estrae gli username
// con uno scan profondo (robusto a chiavi e annidamenti diversi).
async function parseExportZip(file: File): Promise<ParsedExport> {
  const zip = await JSZip.loadAsync(file);

  const followerMap = new Map<string, string | null>();
  const followingSet = new Set<string>();

  for (const path of Object.keys(zip.files)) {
    if (zip.files[path].dir || !/\.json$/i.test(path)) continue;

    const isFollowing = /(^|\/)following(_\d+)?\.json$/i.test(path);
    const isFollowers = /(^|\/)followers(_\d+)?\.json$/i.test(path);

    // Parsa solo i file rilevanti (evita media/ads pesanti).
    if (
      !isFollowing &&
      !isFollowers &&
      !/followers_and_following/i.test(path)
    ) {
      continue;
    }

    let json: unknown;

    try {
      json = JSON.parse(await zip.files[path].async("string"));
    } catch {
      continue;
    }

    const obj =
      json && typeof json === "object" && !Array.isArray(json)
        ? (json as Record<string, unknown>)
        : null;
    const followingArr = obj?.relationships_following;
    const followersArr = obj?.relationships_followers;
    const values: SldEntry[] = [];

    // Following: per nome file o per chiave. Estrae dalla chiave se presente,
    // altrimenti scandaglia l'intero file (es. followers/following sono soli).
    if (isFollowing || Array.isArray(followingArr)) {
      deepStringListValues(followingArr ?? json, values);
      for (const e of values) followingSet.add(e.value);
    } else if (isFollowers || Array.isArray(followersArr)) {
      deepStringListValues(followersArr ?? json, values);
      for (const e of values) {
        followerMap.set(
          e.value,
          e.timestamp ? new Date(e.timestamp * 1000).toISOString() : null,
        );
      }
    }
  }

  if (followerMap.size === 0) {
    throw new Error(
      'Nessun file followers nel pacchetto. Assicurati di esportare "Follower e seguiti" in JSON.',
    );
  }

  return {
    followers: [...followerMap.entries()].map(([username, followedYouAt]) => ({
      username,
      followedYouAt,
    })),
    following: [...followingSet],
  };
}

export default function InstagramSection({ session }: { session: Session }) {
  const [subTab, setSubTab] = useState<SubTab>("dashboard");
  const [stats, setStats] = useState<InstagramStatsResponse | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [exportResult, setExportResult] =
    useState<InstagramExportResponse | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Record<string, InstagramAccountTag>>({});

  useEffect(() => {
    // Sincronizza le spunte "tolto" con la verità del server a ogni fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMarked(new Set(stats?.markedUnfollowed ?? []));
  }, [stats?.markedUnfollowed]);

  useEffect(() => {
    // Idem per i tag manuali (username → persona/vip/pagina).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTags(stats?.tags ?? {});
  }, [stats?.tags]);

  const setTag = useCallback(
    async (username: string, tag: InstagramAccountTag | null) => {
      const prevTag = tags[username] ?? null;

      setTags((prev) => {
        const next = { ...prev };

        if (tag) next[username] = tag;
        else delete next[username];

        return next;
      });
      try {
        const res = await fetch(`${EF_BASE}/admin-instagram-tag`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ username, tag }),
        });
        const data = (await res.json()) as { ok?: boolean };

        if (!data.ok) throw new Error();
      } catch {
        toast.danger("Errore nel salvataggio del tag");
        setTags((prev) => {
          const next = { ...prev };

          if (prevTag) next[username] = prevTag;
          else delete next[username];

          return next;
        });
      }
    },
    [session.access_token, tags],
  );

  const toggleMark = useCallback(
    async (username: string, value: boolean) => {
      setMarked((prev) => {
        const next = new Set(prev);

        if (value) next.add(username);
        else next.delete(username);

        return next;
      });
      try {
        const res = await fetch(`${EF_BASE}/admin-instagram-mark`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ username, marked: value }),
        });
        const data = (await res.json()) as { ok?: boolean };

        if (!data.ok) throw new Error();
      } catch {
        toast.danger("Errore nel salvataggio della spunta");
        setMarked((prev) => {
          const next = new Set(prev);

          if (value) next.delete(username);
          else next.add(username);

          return next;
        });
      }
    },
    [session.access_token],
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${EF_BASE}/admin-instagram-stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await res.json()) as InstagramStatsResponse;

      setStats(data);
    } catch {
      toast.danger("Errore nel caricamento delle statistiche IG");
    }
  }, [session.access_token]);

  useEffect(() => {
    // Fetch-on-mount standard; fetchStats è stabile (useCallback).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  const handleZip = async (file: File) => {
    setParsing(true);
    setExportResult(null);
    try {
      const { followers, following } = await parseExportZip(file);

      if (followers.length === 0) {
        toast.danger("Nessun follower trovato nel file");

        return;
      }

      // I non-mutuals vengono calcolati lato server (persistenti) dopo l'upload.
      // Qui avvisiamo soltanto se l'export non conteneva la lista "Seguiti".
      if (following.length === 0) {
        toast.danger(
          "Lista 'Seguiti' non trovata nell'export: il confronto non-mutuals resta vuoto. Riscarica includendo anche i Seguiti.",
        );
      }

      const body: InstagramExportBody = {
        followers,
        following: following.map((username) => ({ username })),
      };
      const res = await fetch(`${EF_BASE}/admin-instagram-export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as InstagramExportResponse;

      if (data.ok) {
        setExportResult(data);
        toast.success(
          data.isFirstSnapshot
            ? `Primo snapshot salvato (${data.total} follower)`
            : `Diff completato: ${data.unfollowers?.length ?? 0} unfollower`,
        );
        fetchStats();
      } else {
        toast.danger(data.error ?? "Errore durante l'upload");
      }
    } catch (e) {
      toast.danger(e instanceof Error ? e.message : "File non valido");
    } finally {
      setParsing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];

    if (file) handleZip(file);
  };

  const handleManualSnapshot = async () => {
    setSnapshotLoading(true);
    try {
      const res = await fetch(`${EF_BASE}/admin-instagram-snapshot`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await res.json()) as InstagramSnapshotResponse;

      if (data.ok) {
        toast.success(`Snapshot ok · ${data.followers ?? "–"} follower`);
        fetchStats();
      } else {
        toast.danger(data.error ?? "Errore snapshot");
      }
    } catch {
      toast.danger("Errore di rete");
    } finally {
      setSnapshotLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab bar */}
      <div className="flex gap-1 sm:gap-2 justify-center">
        {(
          [
            ["dashboard", "Dashboard"],
            ["follower", "Follower"],
            ["contenuti", "Contenuti"],
          ] as [SubTab, string][]
        ).map(([key, label]) => (
          <Button
            key={key}
            className="min-w-0 rounded-xl font-semibold px-2.5 sm:px-4"
            size="sm"
            variant={subTab === key ? "danger" : "outline"}
            onPress={() => setSubTab(key)}
          >
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>

      {subTab === "dashboard" && (
        <DashboardView
          accessToken={session.access_token}
          snapshotLoading={snapshotLoading}
          stats={stats}
          onSnapshot={handleManualSnapshot}
        />
      )}

      {subTab === "follower" && (
        <FollowerView
          dragOver={dragOver}
          exportResult={exportResult}
          marked={marked}
          parsing={parsing}
          setDragOver={setDragOver}
          stats={stats}
          tags={tags}
          onDrop={onDrop}
          onPick={handleZip}
          onSetTag={setTag}
          onToggleMark={toggleMark}
        />
      )}

      {subTab === "contenuti" && <ContenutiView stats={stats} />}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

const STAT_TEXT: Record<string, string> = {
  success: "text-success",
  danger: "text-danger",
  default: "text-default-700",
  primary: "text-primary",
};

function StatCard({
  label,
  value,
  color = "default",
  hint,
}: {
  label: string;
  value: number | string | null | undefined;
  color?: "success" | "danger" | "default" | "primary";
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-default-100 bg-default-50 p-3 flex flex-col gap-1">
      <span className="text-xs text-default-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold ${STAT_TEXT[color]}`}>
        {value ?? "–"}
      </span>
      {hint && (
        <span className="text-[10px] text-default-400 leading-tight">
          {hint}
        </span>
      )}
    </div>
  );
}

function SectionCard({
  title,
  note,
  action,
  children,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-default-100 bg-default-50 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
      {note && <p className="text-xs text-default-400 mt-2">{note}</p>}
    </div>
  );
}

// ── Confronto periodi ─────────────────────────────────────────────────────────

const COMPARE_WINDOWS: [number, string][] = [
  [7, "7 giorni"],
  [30, "30 giorni"],
];

function DeltaChip({ pct }: { pct: number | null }) {
  if (pct == null) {
    return <span className="text-[10px] text-default-300">—</span>;
  }
  const up = pct >= 0;

  return (
    <span
      className={`text-[10px] font-semibold ${up ? "text-success" : "text-danger"}`}
    >
      {up ? "▲" : "▼"} {Math.abs(Math.round(pct))}%
    </span>
  );
}

function ComparisonCards({
  posts,
  growth,
}: {
  posts: InstagramPost[];
  growth: InstagramGrowthPoint[];
}) {
  const [windowDays, setWindowDays] = useState(7);
  const nonStory = useMemo(
    () => posts.filter((p) => p.mediaType !== "STORY"),
    [posts],
  );
  const metrics = useMemo(
    () => periodComparison(nonStory, growth, windowDays),
    [nonStory, growth, windowDays],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold">
          Confronto col periodo precedente
        </h3>
      </div>
      <div className="flex gap-1 justify-center">
        {COMPARE_WINDOWS.map(([days, label]) => (
          <Button
            key={days}
            className="min-w-0 rounded-xl font-semibold px-2.5 sm:px-4"
            size="sm"
            variant={windowDays === days ? "danger" : "outline"}
            onPress={() => setWindowDays(days)}
          >
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div
            key={m.key}
            className="rounded-xl border border-default-100 bg-default-50 p-3 flex flex-col gap-1"
          >
            <span className="text-xs text-default-400 uppercase tracking-wide">
              {m.label}
            </span>
            <span className="text-2xl font-bold text-default-700">
              {m.current == null
                ? "–"
                : `${m.signed && m.current > 0 ? "+" : ""}${m.current}${m.unit}`}
            </span>
            <DeltaChip pct={m.deltaPct} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Consigli automatici ───────────────────────────────────────────────────────

const INSIGHT_TONE: Record<InsightTone, { cls: string; icon: string }> = {
  good: { cls: "text-success", icon: "✓" },
  warn: { cls: "text-danger", icon: "!" },
  tip: { cls: "text-primary", icon: "→" },
};

function InsightsPanel({
  insights,
  loading,
  isAi,
  onRegenerate,
}: {
  insights: Insight[];
  loading?: boolean;
  isAi?: boolean;
  onRegenerate?: () => void;
}) {
  if (!loading && insights.length === 0) return null;

  return (
    <SectionCard
      action={
        onRegenerate ? (
          <Button
            className="rounded-lg"
            isDisabled={loading}
            size="sm"
            variant="ghost"
            onPress={onRegenerate}
          >
            <span className="inline-flex items-center gap-1.5">
              <RefreshIcon aria-hidden className="w-3.5 h-3.5" />
              Rigenera
            </span>
          </Button>
        ) : undefined
      }
      note={
        isAi
          ? "Generati dall'AI sui tuoi dati. Indicazioni, non regole assolute."
          : "Sintesi automatica dai tuoi dati. Indicazioni, non regole assolute."
      }
      title="Consigli"
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-default-500">
          <Spinner size="sm" />
          Genero i consigli…
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {insights.map((it, i) => {
            const tone = INSIGHT_TONE[it.tone];

            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span
                  className={`shrink-0 w-5 h-5 rounded-full bg-default-100 flex items-center justify-center text-xs font-bold ${tone.cls}`}
                >
                  {tone.icon}
                </span>
                <span className="text-default-600 leading-snug">{it.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ── Ciclo di vita post ────────────────────────────────────────────────────────

function LifecycleList({
  velocity,
  posts,
}: {
  velocity: InstagramVelocity[];
  posts: InstagramPost[];
}) {
  const rows = useMemo(
    () =>
      velocity
        .map((v) => ({
          id: v.id,
          post: posts.find((p) => p.id === v.id),
          lc: postLifecycle(v.series),
        }))
        .filter((r) => r.lc != null),
    [velocity, posts],
  );

  if (rows.length === 0) return null;

  return (
    <SectionCard
      note="Stato dei post recenti dalla loro serie storica: 'in crescita' = l'ultimo rilevamento è ancora salito, 'plateau' = ormai fermo. 'picco rilN' = il rilevamento (snapshot giornaliero) in cui il post ha toccato il massimo engagement."
      title="Ciclo di vita dei post"
    >
      <div className="flex flex-col">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 py-2.5 px-2 border-b border-default-100 text-sm last:border-b-0"
          >
            <Chip
              color={r.lc!.status === "growing" ? "success" : "default"}
              size="sm"
              variant="soft"
            >
              {r.lc!.status === "growing" ? "In crescita" : "Plateau"}
            </Chip>
            <span className="flex-1 min-w-0 truncate text-default-600">
              {r.post
                ? `${mediaTypeLabel(r.post.mediaType)} · ${dateFmt(r.post.postedAt)}`
                : r.id}
            </span>
            <span className="text-xs text-default-400 shrink-0">
              picco ril{(r.lc!.daysToPeak ?? 0) + 1} · {r.lc!.latestEngagement}{" "}
              eng.
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

// Engagement a livello account da Meta (best-effort). Si popola solo dai
// prossimi snapshot dopo il deploy: prima di allora mostra l'empty-state.
function AccountEngagementSection({
  engagement,
  reach28,
}: {
  engagement: InstagramAccountEngagement | null | undefined;
  reach28: number | null | undefined;
}) {
  const hasData =
    reach28 != null ||
    (engagement != null && Object.values(engagement).some((v) => v != null));

  return (
    <SectionCard title="Engagement generale (account)">
      {hasData ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            color="primary"
            hint="like + commenti + salvataggi + condivisioni"
            label="Interazioni totali"
            value={engagement?.totalInteractions ?? undefined}
          />
          <StatCard
            color="default"
            hint="account unici che hanno interagito"
            label="Account coinvolti"
            value={engagement?.accountsEngaged ?? undefined}
          />
          <StatCard
            color="default"
            hint="reach rolling 28 giorni"
            label="Reach 28gg"
            value={reach28 ?? undefined}
          />
          <StatCard
            color="default"
            hint="visite al profilo"
            label="Visite profilo"
            value={engagement?.profileViews ?? undefined}
          />
          <StatCard
            color="default"
            hint="tap sui link in bio"
            label="Tap sui link"
            value={engagement?.profileLinksTaps ?? undefined}
          />
          <StatCard
            color="default"
            hint="visualizzazioni dei contenuti"
            label="Visualizzazioni"
            value={engagement?.views ?? undefined}
          />
        </div>
      ) : (
        <p className="text-default-400 text-sm py-6 text-center">
          Verrà popolato ai prossimi snapshot.
        </p>
      )}
    </SectionCard>
  );
}

function DashboardView({
  stats,
  onSnapshot,
  snapshotLoading,
  accessToken,
}: {
  stats: InstagramStatsResponse | null;
  onSnapshot: () => void;
  snapshotLoading: boolean;
  accessToken: string;
}) {
  const delta = stats?.delta7d;

  // Ultimi post/reel in ordine cronologico decrescente (storie escluse).
  const recentPosts = useMemo(
    () =>
      [...(stats?.posts ?? [])]
        .filter((p) => p.mediaType !== "STORY" && p.postedAt)
        .sort(
          (a, b) =>
            new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime(),
        )
        .slice(0, 12),
    [stats?.posts],
  );

  // Classifica Top/Flop sui post mostrati, come in Dettaglio contenuti.
  const recentTiers = useMemo(
    () => engagementTiers(recentPosts),
    [recentPosts],
  );

  // Consigli generati dall'AI (Gemini, via edge function). I consigli
  // rule-based di buildInsights restano come fallback se l'API fallisce, per non
  // lasciare il pannello vuoto. Il payload sintetico riusa le derivazioni note.
  const advicePayload = useMemo(
    () =>
      stats
        ? buildAdvicePayload({
            posts: stats.posts ?? [],
            followers: stats.followers,
            growth: stats.growth ?? [],
            unfollowersLast30: stats.unfollowersLast30,
            delta7d: stats.delta7d,
          })
        : null,
    [stats],
  );
  const fallbackInsights = useMemo(
    () =>
      buildInsights({
        posts: stats?.posts ?? [],
        followers: stats?.followers,
        growth: stats?.growth ?? [],
        unfollowersLast30: stats?.unfollowersLast30,
        delta7d: stats?.delta7d,
      }),
    [stats],
  );

  const [aiInsights, setAiInsights] = useState<Insight[] | null>(null);
  const [adviceState, setAdviceState] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const fetchAdvice = useCallback(async () => {
    if (!advicePayload || advicePayload.postsAnalysed === 0) {
      setAdviceState("ready");

      return;
    }
    setAdviceState("loading");
    try {
      const res = await fetch(`${EF_BASE}/admin-instagram-advice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(advicePayload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        insights?: Insight[];
      };

      if (!res.ok || !data.ok || !Array.isArray(data.insights)) {
        throw new Error("advice non valida");
      }
      setAiInsights(data.insights);
      setAdviceState("ready");
    } catch {
      setAdviceState("error");
    }
  }, [accessToken, advicePayload]);

  useEffect(() => {
    // Genera i consigli AI quando arrivano (o cambiano) i dati.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdvice();
  }, [fetchAdvice]);

  const insights = aiInsights ?? fallbackInsights;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Panoramica</h3>
        <Button
          className="rounded-xl font-semibold"
          isDisabled={snapshotLoading}
          size="sm"
          variant="secondary"
          onPress={onSnapshot}
        >
          {snapshotLoading ? (
            <Spinner size="sm" />
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <RefreshIcon aria-hidden className="w-4 h-4" />
              Aggiorna
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          color="danger"
          label="Follower"
          value={stats?.followers ?? undefined}
        />
        <StatCard
          color={delta == null ? "default" : delta >= 0 ? "success" : "danger"}
          hint="variazione negli ultimi 7 giorni"
          label="Δ 7gg"
          value={delta == null ? undefined : delta > 0 ? `+${delta}` : delta}
        />
        <StatCard
          color="default"
          hint="profili che segui tu"
          label="Seguiti"
          value={stats?.follows ?? undefined}
        />
        <StatCard
          color="primary"
          hint="chi ti ha smesso di seguire (30gg)"
          label="Unfollower (30gg)"
          value={stats?.unfollowersLast30}
        />
      </div>

      <AccountEngagementSection
        engagement={stats?.accountEngagement}
        reach28={stats?.reach28}
      />

      {(stats?.growth?.length ?? 0) > 0 && (
        <ComparisonCards growth={stats!.growth!} posts={stats?.posts ?? []} />
      )}

      <InsightsPanel
        insights={insights}
        isAi={aiInsights != null}
        loading={adviceState === "loading"}
        onRegenerate={fetchAdvice}
      />

      {recentPosts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Andamento ultimi post/reel</h3>
          <ChronoEngagementChart numbered data={recentPosts} />
          <div className="flex flex-col gap-2">
            {recentPosts.map((post, i) => (
              <div key={post.id ?? i} className="flex items-stretch gap-2">
                <span className="shrink-0 self-stretch flex w-7 items-center justify-center rounded-xl bg-default-100 text-xs font-semibold text-default-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <PostCard
                    followers={stats?.followers}
                    post={post}
                    tier={recentTiers.get(post.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Metric icons ──────────────────────────────────────────────────────────────

type IconCmp = React.FC<React.SVGProps<SVGSVGElement>>;

function Metric({
  icon: Icon,
  value,
}: {
  icon: IconCmp;
  value: number | null;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon aria-hidden className="w-4 h-4" />
      {value ?? "–"}
    </span>
  );
}

function PostThumb({ post }: { post: InstagramPost }) {
  const [broken, setBroken] = useState(false);
  const src = post.thumbnailUrl ?? post.mediaUrl;

  if (!src || broken) {
    return (
      <div className="w-14 h-14 shrink-0 rounded-lg bg-default-100 flex items-center justify-center text-default-300 text-lg">
        {bucketOf(post.mediaType) === "reel" ? "▶" : "▣"}
      </div>
    );
  }

  return (
    <img
      alt=""
      className="w-14 h-14 shrink-0 rounded-lg object-cover bg-default-100"
      loading="lazy"
      src={src}
      onError={() => setBroken(true)}
    />
  );
}

function PostCard({
  post,
  followers,
  tier,
}: {
  post: InstagramPost;
  followers: number | null | undefined;
  tier?: EngagementTier;
}) {
  const er = engagementRate(post, followers);
  const vir = viralitySignals(post, followers);

  return (
    <a
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-default-100 bg-default-50 text-sm hover:bg-default-100 transition-colors"
      href={post.permalink ?? "#"}
      rel="noreferrer"
      target="_blank"
    >
      <PostThumb post={post} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Chip color="danger" size="sm" variant="soft">
            {mediaTypeLabel(post.mediaType)}
          </Chip>
          {tier && (
            <Chip
              color={tier === "top" ? "success" : "warning"}
              size="sm"
              title={
                tier === "top"
                  ? "Tra i migliori per engagement rate (interazioni sul reach)"
                  : "Tra i più bassi per engagement rate (interazioni sul reach)"
              }
              variant="soft"
            >
              {tier === "top" ? "Top" : "Flop"}
            </Chip>
          )}
          <span className="text-xs text-default-400">
            {dateFmt(post.postedAt)}
          </span>
        </div>
        <p className="font-medium truncate">
          {post.caption?.trim() || "(senza didascalia)"}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-default-500 mt-1">
          <Metric icon={LikesIcon} value={post.likes} />
          <Metric icon={CommentsIcon} value={post.comments} />
          <Metric icon={SavesIcon} value={post.saves} />
          <Metric icon={SharesIcon} value={post.shares} />
          <Metric icon={ReachIcon} value={post.reach} />
          <Metric icon={ViewsIcon} value={post.views} />
        </div>
      </div>
      <div className="hidden md:flex flex-col items-end gap-0.5 text-xs shrink-0 w-28">
        <span className="text-default-400">
          ER{" "}
          <span className="font-semibold text-foreground">
            {pct(er.onReach)}
          </span>
        </span>
        <span className="text-default-400">
          Salv.{" "}
          <span className="font-semibold text-foreground">
            {pct(vir.saveRate)}
          </span>
        </span>
        <span className="text-default-400">
          Reach{" "}
          <span className="font-semibold text-foreground">
            {pct(vir.reachEfficiency)}
          </span>
        </span>
      </div>
    </a>
  );
}

// ── Contenuti ─────────────────────────────────────────────────────────────────

function ContenutiView({ stats }: { stats: InstagramStatsResponse | null }) {
  const [tab, setTab] = useState<ContentTab>("generale");
  const allPosts = stats?.posts ?? [];

  const filtered = useMemo(() => {
    if (tab === "generale")
      return allPosts.filter((p) => p.mediaType !== "STORY");
    if (tab === "post")
      return allPosts.filter((p) => bucketOf(p.mediaType) === "post");
    if (tab === "reel")
      return allPosts.filter((p) => bucketOf(p.mediaType) === "reel");

    return allPosts.filter((p) => bucketOf(p.mediaType) === "story");
  }, [allPosts, tab]);

  if (allPosts.length === 0) {
    return (
      <p className="text-default-400 text-sm py-10 text-center">
        Nessun contenuto tracciato. Lancia uno snapshot dalla Dashboard.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 sm:gap-2 justify-center">
        {(
          [
            ["generale", "Generale"],
            ["post", "Post"],
            ["reel", "Reel"],
            ["storie", "Storie"],
          ] as [ContentTab, string][]
        ).map(([key, label]) => (
          <Button
            key={key}
            className="min-w-0 rounded-xl font-semibold px-2.5 sm:px-4"
            size="sm"
            variant={tab === key ? "danger" : "outline"}
            onPress={() => setTab(key)}
          >
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>

      {tab === "storie" ? (
        <StoriesAnalytics posts={filtered} />
      ) : (
        <ContentAnalytics
          followers={stats?.followers}
          posts={filtered}
          showAggregate={tab === "generale"}
          stats={stats}
        />
      )}
    </div>
  );
}

function ContentAnalytics({
  posts,
  followers,
  showAggregate,
  stats,
}: {
  posts: InstagramPost[];
  followers: number | null | undefined;
  showAggregate: boolean;
  stats: InstagramStatsResponse | null;
}) {
  const [sortBy, setSortBy] = useState<"total" | "rate">("total");
  const types = useMemo(() => typeBreakdown(posts), [posts]);
  const tiers = useMemo(() => engagementTiers(posts), [posts]);
  // Classifica del dettaglio: per engagement totale grezzo, oppure per
  // engagement rate (eng/reach), la stessa metrica dei badge top/flop. I post
  // senza reach non hanno un rate confrontabile → in fondo.
  const ranked = useMemo(() => {
    if (sortBy === "total")
      return [...posts].sort((a, b) => b.engagement - a.engagement);

    return [...posts].sort((a, b) => {
      const ra = engagementRateOnReach(a);
      const rb = engagementRateOnReach(b);

      if (ra == null && rb == null) return b.engagement - a.engagement;
      if (ra == null) return 1;
      if (rb == null) return -1;

      return rb - ra;
    });
  }, [posts, sortBy]);
  const cadence = useMemo(() => postingCadence(posts), [posts]);
  const hashtags = useMemo(() => extractHashtags(posts).slice(0, 12), [posts]);
  const byDay = useMemo(() => engagementByDay(posts), [posts]);
  const byBucket = useMemo(() => engagementByBucket(posts), [posts]);
  const best = useMemo(() => bestSlot(posts), [posts]);
  // Derivazione leggera (6 bucket): niente useMemo, l'offset TZ è una lettura
  // impura che il compiler non può tracciare in un memo manuale.

  const tzOffset = new Date().getTimezoneOffset();
  const onlineByBucket = stats?.onlineFollowers
    ? onlineFollowersByBucket(stats.onlineFollowers, tzOffset)
    : null;

  if (posts.length === 0) {
    return (
      <p className="text-default-400 text-sm py-10 text-center">
        Nessun contenuto di questo tipo tracciato.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        note="Engagement = like + commenti + salvataggi + condivisioni. Colore per tipo di contenuto."
        title="Engagement cronologico"
      >
        <ChronoEngagementChart data={posts} />
      </SectionCard>

      {showAggregate && types.length > 1 && (
        <SectionCard title="Engagement medio per tipo">
          <TypeBreakdownChart data={types} />
        </SectionCard>
      )}

      {showAggregate && (
        <SectionCard
          note={
            cadence.declining
              ? "Post pubblicati per settimana. Attenzione: la cadenza delle ultime settimane è in calo."
              : "Post pubblicati per settimana (storie escluse). La costanza è il fattore numero uno per crescere."
          }
          title="Cadenza di pubblicazione"
        >
          <CadenceChart data={cadence.weeks} />
        </SectionCard>
      )}

      {showAggregate && (stats?.velocity?.length ?? 0) > 0 && (
        <SectionCard
          note="Accumulo di like+commenti+salvataggi rilevamento dopo rilevamento (ril = snapshot giornaliero, ril1 = primo rilevamento del post)."
          title="Velocity dell'engagement"
        >
          <VelocityChart data={stats!.velocity!} posts={posts} />
        </SectionCard>
      )}

      {showAggregate && (stats?.velocity?.length ?? 0) > 0 && (
        <LifecycleList posts={posts} velocity={stats!.velocity!} />
      )}

      <SectionCard
        note={
          showAggregate && onlineByBucket
            ? "Giorno/fascia = engagement medio dei tuoi post (campione limitato). Follower online = quando il tuo pubblico è attivo, dato Meta a livello account (ora locale)."
            : "Engagement medio · campione limitato ai post tracciati."
        }
        title="Quando pubblicare"
      >
        {best && (
          <p className="text-sm text-default-600 mb-3">
            Miglior momento:{" "}
            <strong className="text-foreground">
              {best.day} · {best.bucket}
            </strong>
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-default-400 mb-1">Per giorno</p>
            <AvgBarChart data={byDay} />
          </div>
          <div>
            <p className="text-xs text-default-400 mb-1">Per fascia oraria</p>
            <AvgBarChart color="#006FEE" data={byBucket} />
          </div>
        </div>
        {showAggregate && onlineByBucket && (
          <div className="mt-4">
            <p className="text-xs text-default-400 mb-1">
              Follower online per fascia (dato Meta · ora locale)
            </p>
            <OnlineFollowersChart data={onlineByBucket} />
          </div>
        )}
      </SectionCard>

      {hashtags.length > 0 && (
        <SectionCard
          note="Engagement medio dei post che usano ciascun hashtag."
          title="Hashtag più efficaci"
        >
          <div className="flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <Chip key={h.tag} color="default" size="sm" variant="soft">
                {h.tag} · {h.avgEngagement}
              </Chip>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            Engagement dei contenuti ({posts.length} totali)
          </h3>
        </div>
        <div className="flex gap-1 justify-center">
          {(
            [
              ["total", "Totale"],
              ["rate", "Normalizzato"],
            ] as ["total" | "rate", string][]
          ).map(([key, label]) => (
            <Button
              key={key}
              className="min-w-0 rounded-xl font-semibold px-2.5 sm:px-4"
              size="sm"
              variant={sortBy === key ? "danger" : "outline"}
              onPress={() => setSortBy(key)}
            >
              <span className="truncate">{label}</span>
            </Button>
          ))}
        </div>
        {ranked.map((p, i) => (
          <div key={p.id} className="flex items-stretch gap-2">
            <span className="shrink-0 self-stretch flex w-7 items-center justify-center rounded-xl bg-default-100 text-xs font-semibold text-default-500">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <PostCard followers={followers} post={p} tier={tiers.get(p.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoriesAnalytics({ posts }: { posts: InstagramPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-default-400 text-sm py-10 text-center">
        Nessuna storia catturata. Le storie vengono lette solo se attive
        all&apos;ora dello snapshot (spariscono dopo 24h).
      </p>
    );
  }

  const num = (m: InstagramPost, k: string) => {
    const v = m.storyMetrics?.[k];

    return typeof v === "number" ? v : null;
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Storie ({posts.length})</h3>
      <p className="text-[10px] text-default-400">
        Metriche storia: reach (account unici raggiunti) · risposte ·
        condivisioni · Σ interazioni totali · ↪ navigazione (tap avanti/indietro
        e uscite).
      </p>
      {posts.map((s) => (
        <a
          key={s.id}
          className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-default-100 bg-default-50 text-sm hover:bg-default-100 transition-colors"
          href={s.permalink ?? "#"}
          rel="noreferrer"
          target="_blank"
        >
          <PostThumb post={s} />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-default-400">
              {dateFmt(s.postedAt)}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-default-500 mt-1">
              <Metric icon={ReachIcon} value={num(s, "reach")} />
              <Metric icon={CommentsIcon} value={num(s, "replies")} />
              <Metric icon={SharesIcon} value={num(s, "shares")} />
              <span>Σ {num(s, "total_interactions") ?? "–"}</span>
              <span>↪ {num(s, "navigation") ?? "–"}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

// ── Demografica pubblico ──────────────────────────────────────────────────────

const AGE_ORDER = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const GENDER_LABEL: Record<string, string> = {
  F: "Donne",
  M: "Uomini",
  U: "Non spec.",
};

// Codice ISO paese → nome italiano (es. "IT" → "Italia"), fallback al codice.
const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["it"], { type: "region" });
  } catch {
    return null;
  }
})();
const countryLabel = (code: string) => {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
};

function sortedEntries(
  rec: Record<string, number> | undefined,
  opts: { order?: string[]; limit?: number; labelMap?: Record<string, string> },
): [string, number][] {
  if (!rec) return [];
  let entries = Object.entries(rec);

  if (opts.order) {
    entries.sort(
      (a, b) => opts.order!.indexOf(a[0]) - opts.order!.indexOf(b[0]),
    );
  } else {
    entries.sort((a, b) => b[1] - a[1]);
  }
  if (opts.limit) entries = entries.slice(0, opts.limit);
  if (opts.labelMap) {
    entries = entries.map(([k, v]) => [opts.labelMap![k] ?? k, v]);
  }

  return entries;
}

function BarList({ entries }: { entries: [string, number][] }) {
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map(([label, v]) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          <span className="w-24 shrink-0 truncate text-default-500">
            {label}
          </span>
          <div className="flex-1 h-3 rounded bg-default-100 overflow-hidden">
            <div
              className="h-full rounded bg-danger"
              style={{ width: `${(v / max) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-default-400">
            {Math.round((v / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function DemographicsSection({ demo }: { demo: InstagramDemographics }) {
  const blocks: [string, [string, number][]][] = [
    ["Età", sortedEntries(demo.age, { order: AGE_ORDER })],
    ["Genere", sortedEntries(demo.gender, { labelMap: GENDER_LABEL })],
    [
      "Paesi",
      sortedEntries(demo.country, { limit: 6 }).map(
        ([k, v]) => [countryLabel(k), v] as [string, number],
      ),
    ],
    ["Città", sortedEntries(demo.city, { limit: 6 })],
  ];
  const shown = blocks.filter(([, e]) => e.length > 0);

  if (shown.length === 0) return null;

  return (
    <SectionCard
      note="Demografica dei follower (ultimi 30 giorni, fonte Instagram). Percentuali sul totale rilevato."
      title="Pubblico"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {shown.map(([title, entries]) => (
          <div key={title}>
            <p className="text-xs font-medium text-default-600 mb-1.5">
              {title}
            </p>
            <BarList entries={entries} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Follower ──────────────────────────────────────────────────────────────────

function FollowerView({
  parsing,
  dragOver,
  setDragOver,
  onDrop,
  onPick,
  exportResult,
  stats,
  marked,
  tags,
  onToggleMark,
  onSetTag,
}: {
  parsing: boolean;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onPick: (file: File) => void;
  exportResult: InstagramExportResponse | null;
  stats: InstagramStatsResponse | null;
  marked: Set<string>;
  tags: Record<string, InstagramAccountTag>;
  onToggleMark: (username: string, value: boolean) => void;
  onSetTag: (username: string, tag: InstagramAccountTag | null) => void;
}) {
  const recentUnfollowers = stats?.recentUnfollowers ?? [];
  const flow = stats?.flow ?? [];
  const changes = stats?.followingChanges;
  const nonMutuals = stats?.nonMutuals;
  const demo = stats?.demographics;
  const tenureDays = useMemo(
    () => unfollowerTenure(recentUnfollowers),
    [recentUnfollowers],
  );

  const followers = stats?.followers;
  const follows = stats?.follows;
  const delta = stats?.delta7d;
  const hasGrowth = (stats?.growth?.length ?? 0) > 0;
  const ratio =
    followers != null && follows ? (followers / follows).toFixed(2) : null;
  const churn = churnRate(stats?.unfollowersLast30, followers);
  const meanTenure = avgTenure(tenureDays);

  const exportJson = () =>
    download(
      "unfollowers.json",
      JSON.stringify(recentUnfollowers, null, 2),
      "application/json",
    );
  const exportCsv = () =>
    download(
      "unfollowers.csv",
      toCsv(
        recentUnfollowers.map((u) => ({
          username: u.username,
          seguiva_dal: u.since ?? "",
          rilevato_il: u.detectedAt,
        })),
      ),
      "text/csv;charset=utf-8",
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Panoramica follower */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          color="danger"
          label="Follower"
          value={followers ?? undefined}
        />
        <StatCard
          color="default"
          hint="profili che segui tu"
          label="Seguiti"
          value={follows ?? undefined}
        />
        <StatCard
          color="default"
          hint="follower per ogni profilo che segui"
          label="Ratio"
          value={ratio ?? undefined}
        />
        <StatCard
          color={delta == null ? "default" : delta >= 0 ? "success" : "danger"}
          hint="variazione negli ultimi 7 giorni"
          label="Δ 7gg"
          value={delta == null ? undefined : delta > 0 ? `+${delta}` : delta}
        />
      </div>

      <SectionCard title="Crescita follower">
        {hasGrowth ? (
          <GrowthChart data={stats!.growth!} />
        ) : (
          <p className="text-default-400 text-sm py-10 text-center">
            Ancora nessuno snapshot. Il cron giornaliero popolerà il grafico,
            oppure lancia uno snapshot manuale dalla Dashboard.
          </p>
        )}
      </SectionCard>

      {hasGrowth && (
        <SectionCard
          note="Account unici raggiunti al giorno (fonte Instagram). Mostra se la distribuzione dei contenuti cresce a prescindere dai follower."
          title="Reach account nel tempo"
        >
          <ReachChart data={stats!.growth!} />
        </SectionCard>
      )}

      {flow.length > 0 && (
        <SectionCard
          note="Verde = nuovi follower, rosso = follower persi, giorno per giorno."
          title="Crescita scomposta"
        >
          <FlowChart data={flow} />
        </SectionCard>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          color={churn == null ? "default" : churn > 2 ? "danger" : "success"}
          hint="% di follower persi sul totale (30gg)"
          label="Churn 30gg"
          value={churn == null ? undefined : `${churn.toFixed(1)}%`}
        />
        <StatCard
          color="default"
          hint="da quanto ti seguivano, in media, gli unfollower (dall'inizio del follow, da export, al rilevamento dell'uscita)"
          label="Fedeltà media"
          value={meanTenure == null ? undefined : `${meanTenure} gg`}
        />
      </div>

      {demo ? (
        <DemographicsSection demo={demo} />
      ) : (
        <SectionCard title="Pubblico">
          <p className="text-default-400 text-sm py-4 text-center">
            Demografica non ancora disponibile. Verrà popolata al prossimo
            snapshot.
          </p>
        </SectionCard>
      )}

      {/* Gestione unfollower da export */}
      <div className="border-t border-default-100 pt-5 flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-semibold">Chi ha smesso di seguirti</h3>
        </div>

        <p className="text-sm text-default-500 leading-relaxed">
          Richiedi l&apos;export <strong>&quot;Follower e seguiti&quot;</strong>{" "}
          (formato JSON){" "}
          <a
            className="text-danger underline"
            href={IG_DOWNLOAD_URL}
            rel="noreferrer"
            target="_blank"
          >
            direttamente da qui
          </a>
          , poi trascina qui lo ZIP.
        </p>

        <div className="relative">
          <label
            className={clsx(
              "flex flex-col items-center justify-center gap-2 w-full h-44 rounded-lg border-2 border-dashed transition-colors cursor-pointer bg-default-50",
              dragOver
                ? "border-danger bg-danger-soft/40"
                : "border-default-200 hover:border-default-400",
            )}
            htmlFor="ig-zip-upload"
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDrop={onDrop}
          >
            {parsing ? (
              <>
                <Spinner size="sm" />
                <span className="text-xs text-default-400">Elaborazione…</span>
              </>
            ) : (
              <>
                <span className="text-default-400 text-3xl leading-none">
                  +
                </span>
                <span className="text-sm text-default-500">
                  Trascina lo ZIP o clicca per selezionarlo
                </span>
              </>
            )}
          </label>
          <input
            accept=".zip,application/zip"
            className="hidden"
            id="ig-zip-upload"
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) onPick(file);
              e.target.value = "";
            }}
          />
        </div>

        {exportResult && (
          <div className="rounded-xl border border-default-100 bg-default-50 p-4 flex flex-col gap-3">
            {exportResult.isFirstSnapshot ? (
              <p className="text-sm text-default-600">
                Primo snapshot salvato con <strong>{exportResult.total}</strong>{" "}
                follower. Carica un nuovo export più avanti per vedere il diff.
              </p>
            ) : (
              <>
                <div className="flex gap-3">
                  <StatCard
                    color="danger"
                    label="Unfollower"
                    value={exportResult.unfollowers?.length ?? 0}
                  />
                  <StatCard
                    color="success"
                    label="Nuovi follower"
                    value={exportResult.gained ?? 0}
                  />
                </div>
                {(exportResult.unfollowers?.length ?? 0) > 0 && (
                  <div className="flex flex-col">
                    {exportResult.unfollowers!.map((u) => (
                      <UserRow
                        key={u.username}
                        sub={u.since ? `seguiva dal ${dateFmt(u.since)}` : "—"}
                        username={u.username}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Lista principale: chi non ricambia il tuo follow (persistente) */}
        {nonMutuals?.available ? (
          nonMutuals.reliable ? (
            <UnfollowManager
              marked={marked}
              tags={tags}
              users={nonMutuals.notFollowingBack}
              onSetTag={onSetTag}
              onToggle={onToggleMark}
            />
          ) : (
            <div className="rounded-xl border border-warning/40 bg-warning-soft/30 p-4">
              <h3 className="text-sm font-semibold text-warning">
                Export follower incompleto
              </h3>
              <p className="text-xs text-default-500 mt-1 leading-relaxed">
                Il file follower caricato contiene molti meno nomi dei tuoi
                follower reali: probabilmente l&apos;export è stato richiesto
                con un <strong>periodo ristretto</strong>. La lista &quot;Non ti
                ricambiano&quot; sarebbe piena di falsi positivi, quindi è
                nascosta. Riscarica l&apos;export su{" "}
                <strong>&quot;Da sempre&quot;</strong> e ricaricalo.
              </p>
            </div>
          )
        ) : (
          <p className="text-xs text-default-400 text-center">
            Per vedere chi segui che non ti ricambia, carica un export che
            includa anche la lista <strong>Seguiti</strong>.
          </p>
        )}

        {/* Studio storico (richiede ≥2 export) */}
        {changes &&
          (changes.stoppedFollowing.length > 0 ||
            changes.startedFollowing.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UserList
                emptyLabel="Nessuno"
                title={`Ho smesso di seguire (${changes.stoppedFollowing.length})`}
                users={changes.stoppedFollowing}
              />
              <UserList
                emptyLabel="Nessuno"
                title={`Ho iniziato a seguire (${changes.startedFollowing.length})`}
                users={changes.startedFollowing}
              />
            </div>
          )}

        {flow.some((f) => f.lost > 0) && (
          <SectionCard title="Unfollower nel tempo">
            <UnfollowTimelineChart data={flow} />
          </SectionCard>
        )}

        {tenureDays.length > 0 && (
          <SectionCard
            note="Da quando hanno iniziato a seguirti (data dell'export) fino al rilevamento dell'uscita (caricamento del file): l'inizio è preciso, la fine è il momento in cui ce ne siamo accorti."
            title="Fedeltà degli unfollower"
          >
            <TenureHistogram data={tenureHistogram(tenureDays)} />
          </SectionCard>
        )}

        {recentUnfollowers.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">
                  Ultimi unfollower rilevati
                </h3>
                <p className="text-[10px] text-default-400">
                  &quot;uscito il&quot; = data in cui l&apos;abbiamo rilevato
                  (al caricamento dell&apos;export).
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="rounded-xl"
                  size="sm"
                  variant="outline"
                  onPress={exportJson}
                >
                  Scarica JSON
                </Button>
                <Button
                  className="rounded-xl"
                  size="sm"
                  variant="outline"
                  onPress={exportCsv}
                >
                  Scarica CSV
                </Button>
              </div>
            </div>
            <div className="flex flex-col">
              {recentUnfollowers.slice(0, 25).map((u) => (
                <UserRow
                  key={`${u.username}-${u.detectedAt}`}
                  sub={`uscito il ${dateFmt(u.detectedAt)}${
                    u.since ? ` · seguiva dal ${dateFmt(u.since)}` : ""
                  }`}
                  username={u.username}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Lista "Non ti ricambiano": tutti gli username, con spunta "tolto" persistente
// e tag manuale (persona/vip/pagina) per filtrare.
function UnfollowManager({
  users,
  marked,
  tags,
  onToggle,
  onSetTag,
}: {
  users: string[];
  marked: Set<string>;
  tags: Record<string, InstagramAccountTag>;
  onToggle: (username: string, value: boolean) => void;
  onSetTag: (username: string, tag: InstagramAccountTag | null) => void;
}) {
  // Filtro (come il filtro stato negli iscritti). "none" = senza tag,
  // "eliminati" = quelli già spuntati come tolti.
  // Default automatico: "senza tag" finché ci sono profili ancora da taggare
  // (così li triaggi), poi "persona" (i profili da controllare). La scelta
  // manuale dell'utente (pickedFilter) ha sempre la precedenza.
  const [pickedFilter, setPickedFilter] = useState<string | null>(null);
  const autoFilter = useMemo(
    () => (users.some((u) => !tags[u]) ? "none" : "persona"),
    [users, tags],
  );
  const tagFilter = pickedFilter ?? autoFilter;

  // Base filtrata per tag: NON dipende da `marked`, così spuntare "tolto" non
  // riordina/rimuove la riga all'istante (vedi sotto). "all"/"eliminati"
  // partono da tutti.
  const tagFiltered = useMemo(() => {
    if (tagFilter === "none") return users.filter((u) => !tags[u]);
    if (
      tagFilter === "persona" ||
      tagFilter === "vip" ||
      tagFilter === "pagina"
    ) {
      return users.filter((u) => tags[u] === tagFilter);
    }

    return users;
  }, [users, tags, tagFilter]);

  // Solo "eliminati" filtra per `marked` (e quindi si aggiorna subito quando
  // spunti/togli). Negli altri filtri ritorna lo STESSO riferimento di
  // tagFiltered, così `sorted` non ricalcola e l'ordine resta congelato.
  const filtered = useMemo(
    () =>
      tagFilter === "eliminati"
        ? tagFiltered.filter((u) => marked.has(u))
        : tagFiltered,
    [tagFiltered, tagFilter, marked],
  );

  // Da gestire in cima (alfabetico), già tolti in fondo. L'ordine è "congelato"
  // sulla lista corrente: spuntare un nome NON lo fa saltare in fondo all'istante
  // (sarebbe disorientante in una lista lunga), viene solo barrato sul posto. Si
  // riordina quando cambia la lista filtrata (nuovo upload o cambio filtro).
  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const ma = marked.has(a);
        const mb = marked.has(b);

        if (ma !== mb) return ma ? 1 : -1;

        return a.localeCompare(b);
      }),
    [filtered],
  );

  // Paginazione come la lista newsletter: niente scroll interno infinito, la
  // pagina resta corta. Reset a pagina 1 quando cambia la lista (nuovo upload).
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageItems = sorted.slice((current - 1) * pageSize, current * pageSize);

  // Seleziona-tutti come negli iscritti: agisce sui soli elementi in pagina.
  // La checkbox per riga È lo stato "tolto", quindi il select-all spunta o
  // toglie la spunta a tutti i profili della pagina corrente.
  const allOnPageSelected =
    pageItems.length > 0 && pageItems.every((u) => marked.has(u));
  const someOnPageSelected =
    !allOnPageSelected && pageItems.some((u) => marked.has(u));
  const toggleSelectAllOnPage = () => {
    const next = !allOnPageSelected;

    for (const u of pageItems) {
      if (marked.has(u) !== next) onToggle(u, next);
    }
  };

  return (
    <div className="rounded-xl border border-default-100 bg-default-50 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">
            Non ti ricambiano ({users.length})
          </h3>
        </div>
        {users.length > 0 && (
          <AdminSelect
            aria-label="Filtra per tag"
            className="w-auto min-w-28 shrink-0"
            options={[
              { key: "all", label: "Tutti" },
              ...TAG_OPTIONS.map((t) => ({ key: t.key, label: t.label })),
              { key: "none", label: "Senza tag" },
              { key: "eliminati", label: "Eliminati" },
            ]}
            selectedKey={tagFilter}
            onSelectionChange={(key) => {
              if (key != null) {
                setPickedFilter(String(key));
                setPage(1);
              }
            }}
          />
        )}
      </div>

      {users.length === 0 ? (
        <p className="text-xs text-default-400 py-4 text-center">
          Tutti i tuoi seguiti ti ricambiano 🎉
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-xs text-default-400 py-4 text-center">
          Nessun profilo con questo filtro.
        </p>
      ) : (
        <>
          {/* Header colonne con seleziona-tutti, come la lista iscritti */}
          <div className="flex items-center gap-3 px-2 pb-2 border-b border-default-200 text-xs font-medium text-default-400 uppercase tracking-wide">
            <Checkbox
              aria-label="Spunta tutti i profili in pagina"
              isIndeterminate={someOnPageSelected}
              isSelected={allOnPageSelected}
              onChange={toggleSelectAllOnPage}
            >
              <CheckboxContent>
                <CheckboxControl>
                  <CheckboxIndicator />
                </CheckboxControl>
              </CheckboxContent>
            </Checkbox>
            <span className="flex-1">Profilo</span>
          </div>

          <div className="flex flex-col">
            {pageItems.map((u) => {
              const isMarked = marked.has(u);

              // Stesso pattern della lista newsletter: la riga gestisce il
              // click (checkbox solo visiva), il nome è un link che apre il
              // profilo. Il click/tasto su username e tendina categoria NON deve
              // togglare la spunta: lo escludiamo controllando il target.
              const fromControl = (target: EventTarget) =>
                (target as HTMLElement).closest("[data-no-row-toggle]") != null;

              return (
                <div
                  key={u}
                  aria-pressed={isMarked}
                  className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl border-b border-default-100 text-sm hover:bg-default-50 transition-colors cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if (!fromControl(e.target)) onToggle(u, !isMarked);
                  }}
                  onKeyDown={(e) => {
                    if (fromControl(e.target)) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(u, !isMarked);
                    }
                  }}
                >
                  <Checkbox
                    aria-label={`Segna ${u} come tolto`}
                    className="pointer-events-none"
                    isSelected={isMarked}
                  >
                    <CheckboxControl>
                      <CheckboxIndicator />
                    </CheckboxControl>
                  </Checkbox>
                  <a
                    data-no-row-toggle
                    className={clsx(
                      "flex-1 min-w-0 truncate font-medium hover:underline",
                      isMarked && "line-through text-default-400",
                    )}
                    href={`https://instagram.com/${u}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    @{u}
                  </a>
                  <div data-no-row-toggle>
                    <AdminSelect
                      aria-label={`Categoria di ${u}`}
                      className="w-28 shrink-0"
                      options={[
                        { key: "none", label: "Categoria" },
                        ...TAG_OPTIONS.map((t) => ({
                          key: t.key,
                          label: t.label,
                        })),
                      ]}
                      selectedKey={tags[u] ?? "none"}
                      triggerClassName={
                        tags[u] ? TAG_TRIGGER_CLASS[tags[u]] : undefined
                      }
                      onSelectionChange={(key) =>
                        onSetTag(
                          u,
                          key && key !== "none"
                            ? (String(key) as InstagramAccountTag)
                            : null,
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              isIconOnly
              aria-label="Pagina precedente"
              className="rounded-xl"
              isDisabled={current <= 1}
              size="sm"
              variant="secondary"
              onPress={() => setPage(current - 1)}
            >
              ←
            </Button>
            <span className="text-sm text-default-500 whitespace-nowrap px-1">
              {current} / {totalPages}
            </span>
            <Button
              isIconOnly
              aria-label="Pagina successiva"
              className="rounded-xl"
              isDisabled={current >= totalPages}
              size="sm"
              variant="secondary"
              onPress={() => setPage(current + 1)}
            >
              →
            </Button>
            <AdminSelect
              aria-label="Profili per pagina"
              className="w-16 sm:w-20 ml-1"
              options={PAGE_SIZE_OPTIONS.map((n) => ({
                key: String(n),
                label: String(n),
              }))}
              selectedKey={String(pageSize)}
              onSelectionChange={(key) => {
                if (key != null) {
                  setPageSize(Number(key));
                  setPage(1);
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function UserList({
  title,
  users,
  emptyLabel,
  note,
}: {
  title: string;
  users: string[];
  emptyLabel: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-default-100 bg-default-50 p-4 flex flex-col gap-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      {note && <p className="text-[10px] text-default-400 mb-1">{note}</p>}
      {users.length === 0 ? (
        <p className="text-xs text-default-400">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col max-h-72 overflow-y-auto">
          {users.slice(0, 100).map((u) => (
            <UserRow key={u} username={u} />
          ))}
          {users.length > 100 && (
            <p className="text-xs text-default-400 pt-1">
              …e altri {users.length - 100}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function UserRow({ username, sub }: { username: string; sub?: string }) {
  return (
    <a
      className="flex items-center justify-between gap-3 py-2 px-2 border-b border-default-100 text-sm hover:bg-default-100 rounded-lg transition-colors"
      href={`https://instagram.com/${username}`}
      rel="noreferrer"
      target="_blank"
    >
      <span className="font-medium truncate">@{username}</span>
      {sub && <span className="text-xs text-default-400 shrink-0">{sub}</span>}
    </a>
  );
}
