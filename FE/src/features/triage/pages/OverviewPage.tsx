import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Inbox,
  Ticket as TicketIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTickets } from "../TicketsContext";
import { computeMetrics, PRIORITY_RANK } from "../metrics";
import { PriorityBadge } from "../components/badges";
import type { Ticket } from "../types";

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  tone: "brand" | "warning" | "danger" | "neutral";
}) {
  const toneClass = {
    brand: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/10 text-destructive",
    neutral: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">
            {label}
            {hint ? ` · ${hint}` : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Bars({ rows }: { rows: { key: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 truncate text-muted-foreground">
            {r.key}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
            {r.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

function MiniList({
  tickets,
  empty,
}: {
  tickets: Ticket[];
  empty: string;
}) {
  if (tickets.length === 0)
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {tickets.map((t) => (
        <li key={t.id} className="flex items-center gap-2">
          <PriorityBadge priority={t.priority} />
          <span className="min-w-0 flex-1 truncate text-sm">
            {t.issue_summary}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function OverviewPage() {
  const { tickets, error } = useTickets();
  const metrics = useMemo(() => computeMetrics(tickets), [tickets]);

  const recent = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        .slice(0, 5),
    [tickets],
  );
  const needsAttention = useMemo(
    () =>
      [...tickets]
        .filter((t) => t.priority === "Urgent" || t.priority === "High")
        .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
        .slice(0, 5),
    [tickets],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tickets" value={metrics.total} icon={TicketIcon} tone="brand" />
        <StatCard label="Needs attention" value={metrics.needsAttention} icon={AlertTriangle} hint="High + Urgent" tone="warning" />
        <StatCard label="Urgent" value={metrics.urgent} icon={Inbox} tone="danger" />
        <StatCard label="Today" value={metrics.today} icon={Clock} tone="neutral" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By category</CardTitle>
            </CardHeader>
            <CardContent>
              <Bars rows={metrics.byCategory} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By priority</CardTitle>
            </CardHeader>
            <CardContent>
              <Bars rows={metrics.byPriority} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Recent tickets</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/triage/inbox">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <MiniList tickets={recent} empty="No tickets yet." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Needs attention</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniList
                tickets={needsAttention}
                empty="Nothing urgent right now."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
