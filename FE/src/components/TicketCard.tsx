import { useState } from "react";
import type { Ticket } from "../types";
import { CategoryBadge, PriorityBadge } from "./Badge";
import styles from "./TicketCard.module.css";

const FIELD_LABELS: Record<string, string> = {
  transaction_code: "Transaction",
  email: "Email",
  phone: "Phone",
  student_id: "Student ID",
};

export function TicketCard({ ticket, highlight }: { ticket: Ticket; highlight?: boolean }) {
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
    <article className={`${styles.card} ${highlight ? styles.highlight : ""}`}>
      <header className={styles.header}>
        <div className={styles.badges}>
          <CategoryBadge category={ticket.category} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <time className={styles.time} dateTime={ticket.created_at}>
          {formatTime(ticket.created_at)}
        </time>
      </header>

      <h3 className={styles.summary}>{ticket.issue_summary}</h3>
      {ticket.customer_name && (
        <p className={styles.customer}>from {ticket.customer_name}</p>
      )}

      {fields.length > 0 && (
        <dl className={styles.fields}>
          {fields.map(([key, value]) => (
            <div key={key} className={styles.field}>
              <dt>{FIELD_LABELS[key] ?? key}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      <details className={styles.reply}>
        <summary>
          Suggested reply
          <button
            type="button"
            className={styles.copy}
            onClick={(e) => {
              e.preventDefault();
              copyReply();
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </summary>
        <p>{ticket.suggested_reply}</p>
      </details>

      <details className={styles.original}>
        <summary>Original message</summary>
        <p>{ticket.original_text}</p>
      </details>
    </article>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
