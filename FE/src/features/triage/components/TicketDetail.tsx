import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge, PriorityBadge } from "./badges";
import type { Ticket } from "../types";

const FIELD_LABELS: Record<string, string> = {
  transaction_code: "Transaction",
  email: "Email",
  phone: "Phone",
  student_id: "Student ID",
};

export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const [copied, setCopied] = useState(false);

  const fields = Object.entries(ticket.key_fields ?? {}).filter(
    ([, v]) => v != null && v !== "",
  );

  async function copyReply() {
    await navigator.clipboard.writeText(ticket.suggested_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={ticket.category} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div>
        <h3 className="font-semibold">{ticket.issue_summary}</h3>
        {ticket.customer_name && (
          <p className="text-sm text-muted-foreground">
            from {ticket.customer_name}
          </p>
        )}
      </div>

      {fields.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
          {fields.map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {FIELD_LABELS[key] ?? key}
              </dt>
              <dd className="text-sm">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="rounded-lg border border-border p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested reply
          </span>
          <Button variant="ghost" size="sm" onClick={copyReply}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </Button>
        </div>
        <p className="text-sm">{ticket.suggested_reply}</p>
      </div>

      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Original message
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {ticket.original_text}
        </p>
      </details>
    </div>
  );
}
