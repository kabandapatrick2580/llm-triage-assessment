import { useState } from "react";
import { ChevronDown, FileText, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Citation } from "@/types/chat";

interface CitationCardProps {
  citation: Citation;
  /** 1-based index used as a compact reference marker, e.g. [1]. */
  index: number;
}

/**
 * Expandable citation card. Collapsed it shows the document + page; expanded it
 * reveals the chunk id (format "<document>::<chunk_index>").
 */
export function CitationCard({ citation, index }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const chunkIndex = citation.chunk_id.includes("::")
    ? citation.chunk_id.split("::").pop()
    : citation.chunk_id;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
          {index}
        </span>
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {citation.document}
          </span>
          <span className="block text-xs text-muted-foreground">
            Page {citation.page}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="animate-fade-in space-y-1.5 border-t border-border bg-muted/40 px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            <span>
              Chunk{" "}
              <span className="font-mono font-medium text-foreground">
                #{chunkIndex}
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="break-all font-mono text-foreground">
              {citation.chunk_id}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
