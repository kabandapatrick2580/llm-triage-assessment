/** Three bouncing dots shown while the assistant is generating an answer. */
export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 py-1"
      role="status"
      aria-label="Assistant is thinking"
    >
      <span className="text-xs text-muted-foreground">Searching documents</span>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-typing-bounce"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </span>
    </div>
  );
}
