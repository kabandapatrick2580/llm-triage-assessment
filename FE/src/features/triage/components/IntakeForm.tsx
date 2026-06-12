import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ApiError } from "../api";
import { useTickets } from "../TicketsContext";

const SAMPLE =
  "Hi, I was charged twice for my tuition payment last week (transaction TX-48213) " +
  "and the second charge hasn't been refunded. My student ID is S-99102. " +
  "This is really urgent — please help. Thanks, Ada (ada@example.com)";

/** Single-message triage form used by the Inbox "New triage" dialog. */
export function IntakeForm({ onDone }: { onDone?: () => void }) {
  const { submit } = useTickets();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      await submit(text);
      toast.success("Message triaged and added to the inbox.");
      setText("");
      onDone?.();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Triage failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="intake" className="text-sm font-medium">
          Inbound message
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setText(SAMPLE)}
          disabled={loading}
        >
          Use sample
        </Button>
      </div>
      <Textarea
        id="intake"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a support ticket or customer message…"
        disabled={loading}
      />
      <Button type="submit" disabled={!text.trim() || loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Triaging…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Triage message
          </>
        )}
      </Button>
    </form>
  );
}
