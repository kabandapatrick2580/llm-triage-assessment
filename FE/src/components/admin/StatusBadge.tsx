import { CircleDot, CheckCircle2, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { QuestionStatus } from "@/types/admin";

const CONFIG: Record<
  QuestionStatus,
  { label: string; variant: "warning" | "success" | "muted"; icon: typeof CircleDot }
> = {
  pending: { label: "Pending", variant: "warning", icon: CircleDot },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
  ignored: { label: "Ignored", variant: "muted", icon: MinusCircle },
};

export function StatusBadge({ status }: { status: QuestionStatus }) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
