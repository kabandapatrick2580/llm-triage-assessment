import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import type { MessageStatus, Priority } from "../types";

const PRIORITY_VARIANT: Record<Priority, BadgeProps["variant"]> = {
  Low: "muted",
  Medium: "secondary",
  High: "warning",
  Urgent: "destructive",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={PRIORITY_VARIANT[priority] ?? "muted"}>{priority}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge variant="outline">{category}</Badge>;
}

const STATUS: Record<
  MessageStatus,
  { variant: BadgeProps["variant"]; label: string }
> = {
  pending: { variant: "muted", label: "Pending" },
  triaging: { variant: "warning", label: "Triaging…" },
  triaged: { variant: "success", label: "Triaged" },
  failed: { variant: "destructive", label: "Failed" },
};

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const s = STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
