import styles from "./BreakdownList.module.css";

interface Row {
  key: string;
  count: number;
  color?: string;
}

export function BreakdownList({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  if (total === 0) {
    return <p className={styles.empty}>No data yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {rows.map((row) => (
        <li key={row.key} className={styles.row}>
          <div className={styles.meta}>
            <span className={styles.name}>{row.key}</span>
            <span className={styles.count}>{row.count}</span>
          </div>
          <div className={styles.track}>
            <span
              className={styles.fill}
              style={{
                width: `${(row.count / max) * 100}%`,
                background: row.color ?? "var(--brand)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
