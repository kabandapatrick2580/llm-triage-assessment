import { useState } from "react";
import { ApiError } from "../api/client";
import { useTickets } from "../context/TicketsContext";
import { TriagingLoader } from "./TriagingLoader";
import type { Ticket } from "../types";
import styles from "./IntakeForm.module.css";

const SAMPLE =
  "Hi, I was charged twice for my tuition payment last week (transaction TX-48213) " +
  "and the second charge hasn't been refunded. My student ID is S-99102. " +
  "This is really urgent — please help. Thanks, Ada (ada@example.com)";

interface Props {
  onTriaged?: (ticket: Ticket) => void;
}

export function IntakeForm({ onTriaged }: Props) {
  const { submit } = useTickets();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(
    null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const ticket = await submit(text);
      onTriaged?.(ticket);
      setText("");
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <TriagingLoader />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.head}>
        <label htmlFor="intake" className={styles.label}>
          Inbound message
        </label>
        <button
          type="button"
          className={styles.sample}
          onClick={() => setText(SAMPLE)}
          disabled={loading}
        >
          Use sample
        </button>
      </div>

      <textarea
        id="intake"
        className={styles.textarea}
        placeholder="Paste a support ticket or customer message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        disabled={loading}
      />

      {error && (
        <div className={styles.error} role="alert">
          <strong>{error.message}</strong>
          {error.hint && <span>{error.hint}</span>}
        </div>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={!text.trim() || loading}
      >
        Triage message
      </button>
    </form>
  );
}

function toMessage(err: unknown): { message: string; hint?: string } {
  if (err instanceof ApiError) {
    switch (err.kind) {
      case "validation":
        return {
          message: "The model returned output we couldn't validate.",
          hint: "It produced an unexpected category, priority, or shape. Try again.",
        };
      case "model":
        return {
          message: "The triage model is unavailable.",
          hint: "Please try again later, if the problem persists contact the support team.",
        };
      case "network":
        return { message: "Can't reach the server.", hint: "Contact the support team" };
      default:
        return { message: err.message };
    }
  }
  return { message: "Something went wrong." };
}
