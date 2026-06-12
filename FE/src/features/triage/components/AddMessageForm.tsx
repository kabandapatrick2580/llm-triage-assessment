import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "../MessagesContext";

// Deliberately messy, varied student messages — they exercise different
// categories/priorities so the queue is a meaningful demo.
const SAMPLES: { from: string; text: string }[] = [
  {
    from: "S-20455",
    text: "hello i cant log into the student portal since yesterday it keeps saying invalid password but i didnt change anything my id is S-20455 can you reset it",
  },
  {
    from: "Grace M.",
    text: "Good morning, I submitted my admission documents two weeks ago but the status still shows pending. Could you tell me when I'll hear back? Thank you.",
  },
  {
    from: "",
    text: "URGENT!! my tuition receipt says i paid 1200 but the system still shows i owe 1200, i think i was double charged, ref TX-77310. please fix this asap, fees deadline is friday",
  },
  {
    from: "daniel@example.com",
    text: "Hi team, the lecture video for module 3 won't play, it just buffers forever even on a fast connection. I'm on Chrome. Thanks, Daniel",
  },
  {
    from: "Aisha",
    text: "do you offer a payment plan for next semester? not sure who to ask about this, just exploring options",
  },
];

/** Add a raw student message (or a sample batch) to the Intake Queue. */
export function AddMessageForm({ onDone }: { onDone?: () => void }) {
  const { add, addMany } = useMessages();
  const [from, setFrom] = useState("");
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    add(text, from);
    setText("");
    setFrom("");
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="from" className="text-sm font-medium">
          From{" "}
          <span className="font-normal text-muted-foreground">
            (optional — name, email, or student ID)
          </span>
        </label>
        <Input
          id="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="e.g. Grace M. / S-20455"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="raw" className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id="raw"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a student's unstructured message…"
        />
      </div>
      <div className="flex flex-wrap justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            addMany(SAMPLES);
            onDone?.();
          }}
        >
          <Sparkles className="h-4 w-4" /> Load sample batch
        </Button>
        <Button type="submit" disabled={!text.trim()}>
          Add to queue
        </Button>
      </div>
    </form>
  );
}
