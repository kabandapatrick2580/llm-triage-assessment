import type { LucideIcon } from "lucide-react";
import styles from "./StatCard.module.css";

type Tone = "brand" | "danger" | "warning" | "neutral";

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, tone = "neutral", hint }: Props) {
  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${styles[tone]}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    </div>
  );
}
