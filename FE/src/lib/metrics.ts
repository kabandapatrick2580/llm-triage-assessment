import { CATEGORIES, PRIORITIES, type Priority, type Ticket } from "../types";

export const PRIORITY_RANK: Record<Priority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export interface Metrics {
  total: number;
  urgent: number;
  needsAttention: number; // High + Urgent
  today: number;
  byPriority: { key: Priority; count: number }[];
  byCategory: { key: string; count: number }[];
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function computeMetrics(tickets: Ticket[]): Metrics {
  const byPriority = PRIORITIES.map((key) => ({
    key,
    count: tickets.filter((t) => t.priority === key).length,
  }));
  const byCategory = CATEGORIES.map((key) => ({
    key,
    count: tickets.filter((t) => t.category === key).length,
  })).sort((a, b) => b.count - a.count);

  const urgent = tickets.filter((t) => t.priority === "Urgent").length;
  const high = tickets.filter((t) => t.priority === "High").length;

  return {
    total: tickets.length,
    urgent,
    needsAttention: urgent + high,
    today: tickets.filter((t) => isToday(t.created_at)).length,
    byPriority,
    byCategory,
  };
}
