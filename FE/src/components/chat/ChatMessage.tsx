import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  RotateCw,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TypingIndicator } from "./TypingIndicator";
import { CitationCard } from "./CitationCard";
import { formatTime } from "@/utils/formatDate";
import { CONFIDENCE_LABEL } from "@/utils/confidence";
import { notify } from "@/utils/notifications";
import type { ChatMessage as ChatMessageType, Confidence } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isLast: boolean;
  onRegenerate: () => void;
  canRegenerate: boolean;
}

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const variant =
    confidence === "high"
      ? "success"
      : confidence === "medium"
        ? "default"
        : confidence === "low"
          ? "warning"
          : "muted";
  return (
    <Badge variant={variant} className="gap-1">
      <ShieldCheck className="h-3 w-3" />
      Confidence: {CONFIDENCE_LABEL[confidence]}
    </Badge>
  );
}

/** Warning card shown when the answer wasn't found in the knowledge base. */
function NotFoundCard({ questionId }: { questionId?: number }) {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">Information Not Found</p>
          <p className="text-sm text-muted-foreground">
            This information could not be located in the current knowledge base.
            Your question has been recorded and will be reviewed by
            administrators.
          </p>
          {questionId != null && (
            <p className="pt-1 text-sm">
              <span className="text-muted-foreground">Question ID: </span>
              <span className="font-mono font-semibold text-foreground">
                #{questionId}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatMessage({
  message,
  isLast,
  onRegenerate,
  canRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      notify.success("Answer copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error("Could not copy to clipboard");
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 animate-fade-in">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <p className="mt-1 text-right text-[10px] text-primary-foreground/70">
            {formatTime(message.createdAt)}
          </p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // Assistant message
  const notFound = message.foundInKnowledgeBase === false;
  const hasCitations = (message.citations?.length ?? 0) > 0;

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="rounded-2xl rounded-tl-sm border border-border bg-card p-4 shadow-sm">
          {message.pending ? (
            <TypingIndicator />
          ) : message.error ? (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message.error}</span>
            </div>
          ) : notFound ? (
            <NotFoundCard questionId={message.unansweredQuestionId} />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {/* Sources */}
          {!message.pending && !message.error && hasCitations && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sources
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {message.citations!.map((c, i) => (
                  <CitationCard key={c.chunk_id + i} citation={c} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Meta row: confidence + timestamp */}
          {!message.pending && !message.error && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3">
              {message.confidence && (
                <ConfidenceBadge confidence={message.confidence} />
              )}
              <span className="text-xs text-muted-foreground">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Action row */}
        {!message.pending && !message.error && message.content && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  aria-label="Copy answer"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy answer</TooltipContent>
            </Tooltip>

            {isLast && canRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onRegenerate}
                    aria-label="Regenerate answer"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate answer</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Retry on error */}
        {message.error && isLast && canRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RotateCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
