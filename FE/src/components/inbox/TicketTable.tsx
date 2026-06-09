import { useMemo, useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { Ticket } from "../../types";
import { PRIORITY_RANK } from "../../lib/metrics";
import { PriorityBadge, CategoryBadge } from "../Badge";
import styles from "./TicketTable.module.css";

type SortKey = "priority" | "category" | "customer" | "created_at";
type Dir = "asc" | "desc";

const COLUMNS: { key: SortKey | "summary"; label: string; sortable: boolean }[] = [
  { key: "priority", label: "Priority", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "summary", label: "Summary", sortable: false },
  { key: "customer", label: "Customer", sortable: true },
  { key: "created_at", label: "Created", sortable: true },
];

function compare(a: Ticket, b: Ticket, key: SortKey): number {
  switch (key) {
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "category":
      return a.category.localeCompare(b.category);
    case "customer":
      return (a.customer_name ?? "").localeCompare(b.customer_name ?? "");
    case "created_at":
      return +new Date(a.created_at) - +new Date(b.created_at);
  }
}

export function TicketTable({
  tickets,
  onSelect,
}: {
  tickets: Ticket[];
  onSelect: (t: Ticket) => void;
}) {
  const [sort, setSort] = useState<SortKey>("created_at");
  const [dir, setDir] = useState<Dir>("desc");

  const sorted = useMemo(() => {
    const out = [...tickets].sort((a, b) => compare(a, b, sort));
    return dir === "asc" ? out : out.reverse();
  }, [tickets, sort, dir]);

  function toggle(key: SortKey) {
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(key === "created_at" || key === "priority" ? "desc" : "asc");
    }
  }

  if (tickets.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No tickets match your filters.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? styles.sortable : ""}
                onClick={col.sortable ? () => toggle(col.key as SortKey) : undefined}
                aria-sort={
                  col.sortable && col.key === sort
                    ? dir === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                <span className={styles.th}>
                  {col.label}
                  {col.sortable && <SortIcon active={col.key === sort} dir={dir} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={t.id} className={styles.row} onClick={() => onSelect(t)}>
              <td><PriorityBadge priority={t.priority} /></td>
              <td><CategoryBadge category={t.category} /></td>
              <td className={styles.summary}>{t.issue_summary}</td>
              <td className={styles.customer}>{t.customer_name ?? "—"}</td>
              <td className={styles.created}>{formatDate(t.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: Dir }) {
  if (!active) return <ChevronsUpDown size={14} className={styles.iconIdle} />;
  return dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
