import type { Priority } from "../types";
import styles from "./Badge.module.css";

const PRIORITY_VARS: Record<Priority, { fg: string; bg: string }> = {
  Low: { fg: "var(--priority-low)", bg: "var(--priority-low-soft)" },
  Medium: { fg: "var(--priority-medium)", bg: "var(--priority-medium-soft)" },
  High: { fg: "var(--priority-high)", bg: "var(--priority-high-soft)" },
  Urgent: { fg: "var(--priority-urgent)", bg: "var(--priority-urgent-soft)" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_VARS[priority] ?? PRIORITY_VARS.Low;
  return (
    <span
      className={styles.badge}
      style={{ color: c.fg, background: c.bg }}
    >
      <span className={styles.dot} style={{ background: c.fg }} />
      {priority}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return <span className={`${styles.badge} ${styles.category}`}>{category}</span>;
}
