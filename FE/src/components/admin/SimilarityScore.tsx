import { cn } from "@/lib/utils";

interface SimilarityScoreProps {
  /** 0..1 similarity. */
  score: number;
  className?: string;
}

/**
 * Compact similarity meter. Color scales from red (low) to green (high). The
 * backend threshold is ~0.45, below which answers are treated as "not found".
 */
export function SimilarityScore({ score, className }: SimilarityScoreProps) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  const color =
    score >= 0.6
      ? "bg-success"
      : score >= 0.45
        ? "bg-warning"
        : "bg-destructive";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-foreground">
        {score.toFixed(3)}
      </span>
    </div>
  );
}
