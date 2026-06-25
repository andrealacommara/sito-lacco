import type {
  InstagramFlowPoint,
  InstagramGrowthPoint,
  InstagramPost,
  InstagramVelocity,
} from "@/types/api";
import type { TypeStat } from "@/lib/instagramAnalytics";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { mediaTypeLabel } from "@/lib/instagramAnalytics";

// Brand danger del sito (coerente con header email / bottoni).
const BRAND = "#F31260";
const POSITIVE = "#17c964";

// Palette per i tipi di contenuto (riusata da chrono + velocity legend).
export const TYPE_COLORS: Record<string, string> = {
  IMAGE: "#F31260",
  CAROUSEL_ALBUM: "#f5a524",
  VIDEO: "#7828c8",
  REEL: "#006FEE",
  STORY: "#17c964",
};

const colorOf = (type: string | null) =>
  (type && TYPE_COLORS[type]) || "#a1a1aa";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; name?: string; value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-default-200 bg-default-50 px-3 py-2 text-xs shadow-md">
      {label && <p className="font-medium text-default-600 mb-0.5">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} className="text-default-500">
          {p.name}:{" "}
          <span className="font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

const axisProps = {
  stroke: "currentColor",
  tick: { fontSize: 11, fill: "currentColor" },
  tickLine: false,
} as const;

const itDate = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
  });

// ── Crescita follower (area) ──────────────────────────────────────────────────

export function GrowthChart({ data }: { data: InstagramGrowthPoint[] }) {
  const points = data.map((d) => ({ ...d, label: itDate(d.date) }));

  return (
    <div className="text-default-300">
      <ResponsiveContainer height={240} width="100%">
        <AreaChart
          data={points}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="ig-growth" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
          />
          <XAxis dataKey="label" minTickGap={28} {...axisProps} />
          <YAxis domain={["auto", "auto"]} width={44} {...axisProps} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: BRAND, strokeOpacity: 0.3 }}
          />
          <Area
            dataKey="followers"
            fill="url(#ig-growth)"
            name="Follower"
            stroke={BRAND}
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Engagement top post (bar, indice) ─────────────────────────────────────────

export function PostsChart({ data }: { data: InstagramPost[] }) {
  const bars = data.map((p, i) => ({
    label: `#${i + 1}`,
    engagement: p.engagement,
    reach: p.reach ?? 0,
  }));

  return (
    <div className="text-default-300">
      <ResponsiveContainer height={240} width="100%">
        <BarChart
          data={bars}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis width={44} {...axisProps} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: BRAND, fillOpacity: 0.08 }}
          />
          <Bar dataKey="engagement" name="Engagement" radius={[6, 6, 0, 0]}>
            {bars.map((_, i) => (
              <Cell key={i} fill={BRAND} fillOpacity={1 - i * 0.07} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Crescita scomposta: guadagnati vs persi ───────────────────────────────────

export function FlowChart({ data }: { data: InstagramFlowPoint[] }) {
  const bars = data.map((d) => ({
    label: itDate(d.date),
    gained: d.gained,
    lost: -d.lost, // verso il basso
  }));

  return (
    <div className="text-default-300">
      <ResponsiveContainer height={220} width="100%">
        <BarChart
          data={bars}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="label" minTickGap={24} {...axisProps} />
          <YAxis width={44} {...axisProps} />
          <ReferenceLine stroke="currentColor" strokeOpacity={0.3} y={0} />
          <Tooltip content={<ChartTooltip />} cursor={{ fillOpacity: 0.06 }} />
          <Bar
            dataKey="gained"
            fill={POSITIVE}
            name="Nuovi"
            radius={[4, 4, 0, 0]}
            stackId="f"
          />
          <Bar
            dataKey="lost"
            fill={BRAND}
            name="Persi"
            radius={[0, 0, 4, 4]}
            stackId="f"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Unfollow nel tempo (solo persi) ───────────────────────────────────────────

export function UnfollowTimelineChart({
  data,
}: {
  data: InstagramFlowPoint[];
}) {
  const bars = data
    .filter((d) => d.lost > 0)
    .map((d) => ({ label: itDate(d.date), lost: d.lost }));

  return (
    <div className="text-default-300">
      <ResponsiveContainer height={200} width="100%">
        <BarChart
          data={bars}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="label" minTickGap={24} {...axisProps} />
          <YAxis allowDecimals={false} width={44} {...axisProps} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: BRAND, fillOpacity: 0.08 }}
          />
          <Bar
            dataKey="lost"
            fill={BRAND}
            name="Unfollower"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Engagement cronologico, colore per tipo ───────────────────────────────────

export function ChronoEngagementChart({ data }: { data: InstagramPost[] }) {
  const bars = [...data]
    .filter((p) => p.postedAt)
    .sort(
      (a, b) =>
        new Date(a.postedAt!).getTime() - new Date(b.postedAt!).getTime(),
    )
    .map((p) => ({
      label: itDate(p.postedAt!),
      engagement: p.engagement,
      type: p.mediaType,
    }));

  return (
    <div className="text-default-300">
      <ResponsiveContainer height={240} width="100%">
        <BarChart
          data={bars}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="label" minTickGap={20} {...axisProps} />
          <YAxis width={44} {...axisProps} />
          <Tooltip content={<ChartTooltip />} cursor={{ fillOpacity: 0.06 }} />
          <Bar dataKey="engagement" name="Engagement" radius={[4, 4, 0, 0]}>
            {bars.map((b, i) => (
              <Cell key={i} fill={colorOf(b.type)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Engagement medio per tipo ─────────────────────────────────────────────────

export function TypeBreakdownChart({ data }: { data: TypeStat[] }) {
  const bars = data.map((d) => ({
    label: d.label,
    engagement: d.avgEngagement,
    type: d.type,
  }));

  return (
    <div className="text-default-300">
      <ResponsiveContainer height={220} width="100%">
        <BarChart
          data={bars}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis width={44} {...axisProps} />
          <Tooltip content={<ChartTooltip />} cursor={{ fillOpacity: 0.06 }} />
          <Bar
            dataKey="engagement"
            name="Engagement medio"
            radius={[6, 6, 0, 0]}
          >
            {bars.map((b, i) => (
              <Cell key={i} fill={colorOf(b.type)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Velocity: accumulo engagement nei giorni dopo la pubblicazione ────────────

export function VelocityChart({
  data,
  posts,
}: {
  data: InstagramVelocity[];
  posts: InstagramPost[];
}) {
  // Allineo le serie su un asse "giorni dallo snapshot iniziale" comune.
  const maxLen = Math.max(0, ...data.map((d) => d.series.length));
  const rows = Array.from({ length: maxLen }, (_, i) => {
    const row: Record<string, number | string> = { label: `g${i + 1}` };

    for (const v of data) {
      const pt = v.series[i];

      if (pt) row[v.id] = pt.likes + pt.comments + pt.saves;
    }

    return row;
  });

  const labelFor = (id: string) => {
    const p = posts.find((x) => x.id === id);

    return p
      ? `${mediaTypeLabel(p.mediaType)} ${itDate(p.postedAt ?? "")}`
      : id;
  };

  return (
    <div className="text-default-300">
      <ResponsiveContainer height={240} width="100%">
        <LineChart
          data={rows}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
          />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis width={44} {...axisProps} />
          <Tooltip content={<ChartTooltip />} />
          {data.map((v, i) => (
            <Line
              key={v.id}
              connectNulls
              dataKey={v.id}
              dot={false}
              name={labelFor(v.id)}
              stroke={Object.values(TYPE_COLORS)[i % 5]}
              strokeWidth={2}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Engagement medio per categoria (giorno / fascia oraria) ───────────────────

export function AvgBarChart({
  data,
  color = BRAND,
}: {
  data: { label: string; avg: number; count: number }[];
  color?: string;
}) {
  return (
    <div className="text-default-300">
      <ResponsiveContainer height={180} width="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis width={44} {...axisProps} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: color, fillOpacity: 0.08 }}
          />
          <Bar dataKey="avg" name="Engagement medio" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={color}
                fillOpacity={d.count ? 1 : 0.18}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Istogramma fedeltà (tenure unfollower) ────────────────────────────────────

export function TenureHistogram({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  return (
    <div className="text-default-300">
      <ResponsiveContainer height={200} width="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            opacity={0.12}
            stroke="currentColor"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis allowDecimals={false} width={44} {...axisProps} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: BRAND, fillOpacity: 0.08 }}
          />
          <Bar
            dataKey="count"
            fill={BRAND}
            name="Unfollower"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
