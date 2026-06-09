import { useNavigate } from "react-router-dom";
import type { Priority, Ticket } from "../../types";
import styles from "./TicketMiniList.module.css";

const PRIORITY_COLOR: Record<Priority, string> = {
  Low: "var(--priority-low)",
  Medium: "var(--priority-medium)",
  High: "var(--priority-high)",
  Urgent: "var(--priority-urgent)",
};

export function TicketMiniList({
  tickets,
  emptyText,
}: {
  tickets: Ticket[];
  emptyText: string;
}) {
  const navigate = useNavigate();

  if (tickets.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <ul className={styles.list}>
      {tickets.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            className={styles.row}
            onClick={() => navigate(`/inbox?ticket=${t.id}`)}
          >
            <span
              className={styles.dot}
              style={{ background: PRIORITY_COLOR[t.priority] }}
              title={t.priority}
            />
            <span className={styles.text}>
              <span className={styles.summary}>{t.issue_summary}</span>
              <span className={styles.meta}>
                {t.category} · {relativeTime(t.created_at)}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
