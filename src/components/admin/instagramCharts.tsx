import type { InstagramGrowthPoint, InstagramTopPost } from "@/types/api";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Brand danger del sito (coerente con header email / bottoni).
const BRAND = "#F31260";

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

export function GrowthChart({ data }: { data: InstagramGrowthPoint[] }) {
  const points = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

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

export function PostsChart({ data }: { data: InstagramTopPost[] }) {
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
