import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

/**
 * The backend emits naive UTC ISO strings (no trailing "Z"). Normalize so the
 * browser parses them as UTC rather than local time.
 */
function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  // Append "Z" if there's no timezone designator, so it's treated as UTC.
  const hasTz = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const normalized = hasTz ? value : `${value}Z`;
  const date = parseISO(normalized);
  return isValid(date) ? date : null;
}

/** Absolute date, e.g. "Jun 11, 2026". */
export function formatDate(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "MMM d, yyyy") : "—";
}

/** Absolute date + time, e.g. "Jun 11, 2026, 2:45 PM". */
export function formatDateTime(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "MMM d, yyyy, h:mm a") : "—";
}

/** Time only, e.g. "2:45 PM". */
export function formatTime(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "h:mm a") : "";
}

/** Relative time, e.g. "3 hours ago". */
export function formatRelative(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

/** "yyyy-MM-dd" day key, useful for grouping/charts. Falls back to "unknown". */
export function toDayKey(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd") : "unknown";
}
