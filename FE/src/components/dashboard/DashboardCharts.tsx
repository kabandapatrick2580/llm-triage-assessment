import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { TimeSeriesPoint, StatusBreakdown } from "@/utils/analytics";

const AXIS = "hsl(var(--muted-foreground))";
const GRID = "hsl(var(--border))";

/** Themed tooltip used by all charts. */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function QuestionsOverTimeChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
        <Bar
          dataKey="count"
          name="Questions"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DocumentGrowthChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="docGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="Documents"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#docGrowth)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Resolved: "hsl(var(--success))",
  Pending: "hsl(var(--warning))",
  Ignored: "hsl(var(--muted-foreground))",
};

export function ResolutionChart({ data }: { data: StatusBreakdown }) {
  const pieData = [
    { name: "Resolved", value: data.resolved },
    { name: "Pending", value: data.pending },
    { name: "Ignored", value: data.ignored },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          strokeWidth={0}
        >
          {pieData.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={28}
          iconType="circle"
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
