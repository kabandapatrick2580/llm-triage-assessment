import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Inbox, Ticket as TicketIcon } from "lucide-react";
import { useTickets } from "../context/TicketsContext";
import { computeMetrics, PRIORITY_RANK } from "../lib/metrics";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/dashboard/StatCard";
import { BreakdownList } from "../components/dashboard/BreakdownList";
import { TicketMiniList } from "../components/dashboard/TicketMiniList";
import type { Priority } from "../types";
import styles from "./DashboardPage.module.css";

const PRIORITY_COLOR: Record<Priority, string> = {
  Low: "var(--priority-low)",
  Medium: "var(--priority-medium)",
  High: "var(--priority-high)",
  Urgent: "var(--priority-urgent)",
};

export function DashboardPage() {
  const { tickets, loading, error } = useTickets();
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
    <div className={styles.page}>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of triaged intake across categories and priority."
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.stats}>
        <StatCard label="Total tickets" value={metrics.total} icon={TicketIcon} tone="brand" />
        <StatCard label="Needs attention" value={metrics.needsAttention} icon={AlertTriangle} tone="warning" hint="High + Urgent" />
        <StatCard label="Urgent" value={metrics.urgent} icon={Inbox} tone="danger" />
        <StatCard label="Today" value={metrics.today} icon={Clock} tone="neutral" />
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <Card title="By category">
            <BreakdownList rows={metrics.byCategory} />
          </Card>
          <Card title="By priority">
            <BreakdownList
              rows={metrics.byPriority.map((r) => ({
                ...r,
                color: PRIORITY_COLOR[r.key],
              }))}
            />
          </Card>
        </div>

        <aside className={styles.rail}>
          <Card
            title="Recent tickets"
            action={<Link to="/inbox" className={styles.viewAll}>View all</Link>}
          >
            <TicketMiniList
              tickets={recent}
              emptyText={loading ? "Loading…" : "No tickets yet."}
            />
          </Card>
          <Card title="Needs attention">
            <TicketMiniList
              tickets={needsAttention}
              emptyText="Nothing urgent right now."
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
