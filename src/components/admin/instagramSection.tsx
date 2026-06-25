import type { Session } from "@supabase/supabase-js";
import type {
  InstagramExportBody,
  InstagramExportResponse,
  InstagramSnapshotResponse,
  InstagramStatsResponse,
  InstagramTopPost,
} from "@/types/api";

import { useCallback, useEffect, useState } from "react";
import { Button, Chip, Spinner, toast } from "@heroui/react";
import JSZip from "jszip";
import clsx from "clsx";

import { EF_BASE } from "@/lib/supabase";
import { GrowthChart, PostsChart } from "@/components/admin/instagramCharts";

type SubTab = "dashboard" | "unfollower" | "settings";

const dateFmt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("it-IT") : "–";

// Estrae { username, followedYouAt } da uno ZIP export di Instagram, parsando i
// file connections/followers_and_following/followers_N.json lato client (JSZip).
async function parseFollowersZip(
  file: File,
): Promise<{ username: string; followedYouAt: string | null }[]> {
  const zip = await JSZip.loadAsync(file);
  const paths = Object.keys(zip.files).filter((p) =>
    /(^|\/)followers(_\d+)?\.json$/i.test(p),
  );

  if (paths.length === 0) {
    throw new Error(
      'Nessun file followers nel pacchetto. Assicurati di esportare "Follower e seguiti" in JSON.',
    );
  }

  const map = new Map<string, string | null>();

  for (const path of paths) {
    const raw = await zip.files[path].async("string");
    const json = JSON.parse(raw);
    const arr: unknown[] = Array.isArray(json)
      ? json
      : ((Object.values(json).find(Array.isArray) as unknown[]) ?? []);

    for (const item of arr) {
      const sld = (
        item as { string_list_data?: { value?: string; timestamp?: number }[] }
      )?.string_list_data?.[0];

      if (sld?.value) {
        map.set(
          sld.value,
          sld.timestamp ? new Date(sld.timestamp * 1000).toISOString() : null,
        );
      }
    }
  }

  return [...map.entries()].map(([username, followedYouAt]) => ({
    username,
    followedYouAt,
  }));
}

export default function InstagramSection({ session }: { session: Session }) {
  const [subTab, setSubTab] = useState<SubTab>("dashboard");
  const [stats, setStats] = useState<InstagramStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [exportResult, setExportResult] =
    useState<InstagramExportResponse | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${EF_BASE}/admin-instagram-stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await res.json()) as InstagramStatsResponse;

      setStats(data);
    } catch {
      toast.danger("Errore nel caricamento delle statistiche IG");
    } finally {
      setLoading(false);
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
      const followers = await parseFollowersZip(file);

      if (followers.length === 0) {
        toast.danger("Nessun follower trovato nel file");

        return;
      }

      const body: InstagramExportBody = { followers };
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
      <div className="flex gap-1 sm:gap-2 flex-wrap justify-center lg:justify-start">
        {(
          [
            ["dashboard", "Dashboard"],
            ["unfollower", "Unfollower"],
            ["settings", "Impostazioni"],
          ] as [SubTab, string][]
        ).map(([key, label]) => (
          <Button
            key={key}
            className="rounded-xl font-semibold shrink-0"
            size="sm"
            variant={subTab === key ? "danger" : "outline"}
            onPress={() => setSubTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {subTab === "dashboard" && (
        <DashboardView
          fetchStats={fetchStats}
          loading={loading}
          stats={stats}
        />
      )}

      {subTab === "unfollower" && (
        <UnfollowerView
          dragOver={dragOver}
          exportResult={exportResult}
          parsing={parsing}
          recentUnfollowers={stats?.recentUnfollowers ?? []}
          setDragOver={setDragOver}
          onDrop={onDrop}
          onPick={handleZip}
        />
      )}

      {subTab === "settings" && (
        <SettingsView
          snapshotLoading={snapshotLoading}
          tokenExpiresAt={stats?.tokenExpiresAt ?? null}
          onSnapshot={handleManualSnapshot}
        />
      )}
    </div>
  );
}

// ── Stat card (stile coerente con la dashboard newsletter) ────────────────────

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
}: {
  label: string;
  value: number | string | null | undefined;
  color?: "success" | "danger" | "default" | "primary";
}) {
  return (
    <div className="rounded-xl border border-default-100 bg-default-50 p-3 flex flex-col gap-1">
      <span className="text-xs text-default-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold ${STAT_TEXT[color]}`}>
        {value ?? "–"}
      </span>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function DashboardView({
  stats,
  loading,
  fetchStats,
}: {
  stats: InstagramStatsResponse | null;
  loading: boolean;
  fetchStats: () => void;
}) {
  const hasGrowth = (stats?.growth?.length ?? 0) > 0;
  const delta = stats?.delta7d;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          color="danger"
          label="Follower"
          value={stats?.followers ?? undefined}
        />
        <StatCard
          color={delta == null ? "default" : delta >= 0 ? "success" : "danger"}
          label="Δ 7gg"
          value={delta == null ? undefined : delta > 0 ? `+${delta}` : delta}
        />
        <StatCard
          color="default"
          label="Seguiti"
          value={stats?.follows ?? undefined}
        />
        <StatCard
          color="primary"
          label="Unfollower (30gg)"
          value={stats?.unfollowersLast30}
        />
      </div>

      <div className="rounded-xl border border-default-100 bg-default-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Crescita follower</h3>
          <Button
            isIconOnly
            aria-label="Ricarica"
            className="rounded-xl"
            isDisabled={loading}
            size="sm"
            variant="secondary"
            onPress={fetchStats}
          >
            {loading ? <Spinner size="sm" /> : "↻"}
          </Button>
        </div>
        {hasGrowth ? (
          <GrowthChart data={stats!.growth!} />
        ) : (
          <p className="text-default-400 text-sm py-10 text-center">
            Ancora nessuno snapshot. Il cron giornaliero popolerà il grafico,
            oppure lancia uno snapshot manuale da Impostazioni.
          </p>
        )}
      </div>

      {(stats?.topPosts?.length ?? 0) > 0 && (
        <>
          <div className="rounded-xl border border-default-100 bg-default-50 p-4">
            <h3 className="text-sm font-semibold mb-3">
              Engagement post recenti
            </h3>
            <PostsChart data={stats!.topPosts!} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Top post</h3>
            {stats!.topPosts!.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PostRow({ post }: { post: InstagramTopPost }) {
  const stat = (n: number | null) => (n == null ? "–" : n);

  return (
    <a
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-default-100 bg-default-50 text-sm hover:bg-default-100 transition-colors"
      href={post.permalink ?? "#"}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {post.caption?.trim() || "(senza didascalia)"}
        </p>
        <p className="text-xs text-default-400">
          {post.mediaType ?? "—"} · {dateFmt(post.postedAt)}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-xs text-default-500 shrink-0">
        <span>❤ {stat(post.likes)}</span>
        <span>💬 {stat(post.comments)}</span>
        <span>🔖 {stat(post.saves)}</span>
        <span>📈 {stat(post.reach)}</span>
      </div>
      <Chip color="danger" size="sm" variant="soft">
        {post.engagement}
      </Chip>
    </a>
  );
}

// ── Unfollower ────────────────────────────────────────────────────────────────

function UnfollowerView({
  parsing,
  dragOver,
  setDragOver,
  onDrop,
  onPick,
  exportResult,
  recentUnfollowers,
}: {
  parsing: boolean;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onPick: (file: File) => void;
  exportResult: InstagramExportResponse | null;
  recentUnfollowers: NonNullable<InstagramStatsResponse["recentUnfollowers"]>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-default-500 leading-relaxed">
        Richiedi l&apos;export <strong>&quot;Follower e seguiti&quot;</strong>{" "}
        (formato JSON) da Instagram, poi trascina qui lo ZIP. Il parsing avviene
        nel tuo browser: al server arrivano solo username e date, mai il file.
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
              <span className="text-default-400 text-3xl leading-none">+</span>
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
                    <UnfollowerRow
                      key={u.username}
                      since={u.since}
                      username={u.username}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!exportResult && recentUnfollowers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Ultimi unfollower rilevati</h3>
          <div className="flex flex-col">
            {recentUnfollowers.map((u) => (
              <UnfollowerRow
                key={`${u.username}-${u.detectedAt}`}
                since={u.since}
                username={u.username}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UnfollowerRow({
  username,
  since,
}: {
  username: string;
  since: string | null;
}) {
  return (
    <a
      className="flex items-center justify-between gap-3 py-2.5 px-2 border-b border-default-100 text-sm hover:bg-default-100 rounded-lg transition-colors"
      href={`https://instagram.com/${username}`}
      rel="noreferrer"
      target="_blank"
    >
      <span className="font-medium truncate">@{username}</span>
      <span className="text-xs text-default-400 shrink-0">
        {since ? `seguiva dal ${dateFmt(since)}` : "—"}
      </span>
    </a>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────

function SettingsView({
  tokenExpiresAt,
  onSnapshot,
  snapshotLoading,
}: {
  tokenExpiresAt: string | null;
  onSnapshot: () => void;
  snapshotLoading: boolean;
}) {
  const daysLeft =
    tokenExpiresAt != null
      ? Math.round(
          // eslint-disable-next-line react-hooks/purity
          (new Date(tokenExpiresAt).getTime() - Date.now()) / 86_400_000,
        )
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-default-100 bg-default-50 p-4 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Token Graph API</h3>
        <div className="flex items-center gap-2 text-sm text-default-600">
          <Chip
            color={
              daysLeft == null
                ? "default"
                : daysLeft > 10
                  ? "success"
                  : "warning"
            }
            size="sm"
            variant="soft"
          >
            {daysLeft == null ? "non inizializzato" : `scade tra ${daysLeft}gg`}
          </Chip>
          <span className="text-default-400">{dateFmt(tokenExpiresAt)}</span>
        </div>
        <p className="text-xs text-default-400 leading-relaxed">
          Il token si auto-rinnova nel cron giornaliero quando mancano meno di
          10 giorni alla scadenza. Nessuna azione manuale necessaria.
        </p>
      </div>

      <div className="rounded-xl border border-default-100 bg-default-50 p-4 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Notifiche</h3>
        <p className="text-xs text-default-400 leading-relaxed">
          Alert email a ogni <strong>calo netto</strong> di follower
          (giornaliero) + promemoria <strong>settimanale</strong> per caricare
          l&apos;export. Prefisso
          <span className="font-mono"> [IG]</span> in oggetto.
        </p>
      </div>

      <div className="rounded-xl border border-default-100 bg-default-50 p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Snapshot manuale</h3>
        <p className="text-xs text-default-400 leading-relaxed">
          Forza ora una lettura della Graph API (follower + insight post), utile
          per popolare subito la dashboard senza aspettare il cron.
        </p>
        <Button
          className="rounded-xl font-semibold self-center"
          isDisabled={snapshotLoading}
          size="sm"
          variant="danger"
          onPress={onSnapshot}
        >
          {snapshotLoading ? <Spinner size="sm" /> : "Esegui snapshot ora"}
        </Button>
      </div>
    </div>
  );
}
