import { format } from "date-fns";
import { toDayKey } from "./formatDate";
import type { UnansweredQuestion } from "@/types/admin";
import type { KnowledgeDocument } from "@/types/document";

export interface TimeSeriesPoint {
  date: string; // yyyy-MM-dd
  label: string; // "Jun 11"
  count: number;
  cumulative: number;
}

function prettyDay(key: string): string {
  if (key === "unknown") return "Unknown";
  // key is yyyy-MM-dd; build a local Date for display only.
  const [y, m, d] = key.split("-").map(Number);
  return format(new Date(y, (m ?? 1) - 1, d ?? 1), "MMM d");
}

/**
 * Bucket items by their (UTC) day and produce a sorted per-day + cumulative
 * series. `getDate` extracts the ISO date string from each item.
 */
function buildSeries<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
): TimeSeriesPoint[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = toDayKey(getDate(item));
    if (key === "unknown") continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const sortedKeys = [...counts.keys()].sort();
  let cumulative = 0;
  return sortedKeys.map((key) => {
    const count = counts.get(key) ?? 0;
    cumulative += count;
    return { date: key, label: prettyDay(key), count, cumulative };
  });
}

/** Per-day count of logged knowledge gaps (questions). */
export function questionsOverTime(
  questions: UnansweredQuestion[],
): TimeSeriesPoint[] {
  return buildSeries(questions, (q) => q.created_at);
}

/** Cumulative document count over time. */
export function documentGrowth(
  documents: KnowledgeDocument[],
): TimeSeriesPoint[] {
  return buildSeries(documents, (d) => d.uploaded_at);
}

export interface StatusBreakdown {
  pending: number;
  resolved: number;
  ignored: number;
  total: number;
  /** Resolved / (resolved + ignored + pending) as a percentage. */
  resolutionRate: number;
}

export function statusBreakdown(
  questions: UnansweredQuestion[],
): StatusBreakdown {
  const pending = questions.filter((q) => q.status === "pending").length;
  const resolved = questions.filter((q) => q.status === "resolved").length;
  const ignored = questions.filter((q) => q.status === "ignored").length;
  const total = questions.length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  return { pending, resolved, ignored, total, resolutionRate };
}

export function totalChunks(documents: KnowledgeDocument[]): number {
  return documents
    .filter((d) => d.status === "indexed")
    .reduce((sum, d) => sum + (d.total_chunks || 0), 0);
}
