import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  onPick: (question: string) => void;
}

const SUGGESTIONS = [
  "What is the annual leave policy?",
  "How do I submit an expense reimbursement?",
  "What are the working hours and remote work rules?",
  "What is the process for reporting a security incident?",
];

/** Welcome / zero-state for the chat, with example prompts. */
export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">
        Ask your knowledge base
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Get answers grounded strictly in your uploaded documents — every answer
        comes with citations so you can verify the source.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="group rounded-xl border border-border bg-card p-4 text-left text-sm shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-medium text-foreground group-hover:text-primary">
              {q}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
