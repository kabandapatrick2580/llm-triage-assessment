import {
  CheckCircle2,
  MinusCircle,
  MessageSquare,
  FileSearch,
  Gauge,
  Calendar,
  CalendarCheck,
  FileCheck2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { SimilarityScore } from "./SimilarityScore";
import { formatDateTime } from "@/utils/formatDate";
import type { UnansweredQuestion } from "@/types/admin";

interface QuestionDetailsDialogProps {
  question: UnansweredQuestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (question: UnansweredQuestion) => void;
  onIgnore: (question: UnansweredQuestion) => void;
  ignoring?: boolean;
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MessageSquare;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function QuestionDetailsDialog({
  question,
  open,
  onOpenChange,
  onResolve,
  onIgnore,
  ignoring,
}: QuestionDetailsDialogProps) {
  if (!question) return null;
  const isPending = question.status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle>Question #{question.id}</DialogTitle>
            <StatusBadge status={question.status} />
          </div>
          <DialogDescription>
            Knowledge gap details and retrieval diagnostics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <Field icon={MessageSquare} label="Question">
            <p className="rounded-lg bg-muted/50 p-3">{question.question}</p>
          </Field>

          <Field icon={MessageSquare} label="Attempted Answer">
            {question.attempted_answer ? (
              <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
                {question.attempted_answer}
              </p>
            ) : (
              <p className="italic text-muted-foreground">
                No answer was attempted.
              </p>
            )}
          </Field>

          <Field icon={FileSearch} label="Retrieved Context Summary">
            {question.retrieved_context_summary ? (
              <p className="rounded-lg bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {question.retrieved_context_summary}
              </p>
            ) : (
              <p className="italic text-muted-foreground">
                No context was retrieved above the similarity threshold.
              </p>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field icon={Gauge} label="Similarity Score">
              <SimilarityScore score={question.similarity_score} />
            </Field>

            <Field icon={Calendar} label="Created">
              {formatDateTime(question.created_at)}
            </Field>

            {question.resolved_at && (
              <Field icon={CalendarCheck} label="Resolved">
                {formatDateTime(question.resolved_at)}
              </Field>
            )}

            {question.resolved_by_document_name && (
              <Field icon={FileCheck2} label="Resolved Document">
                <span className="font-medium">
                  {question.resolved_by_document_name}
                </span>
              </Field>
            )}
          </div>
        </div>

        {isPending && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onIgnore(question)}
              disabled={ignoring}
            >
              <MinusCircle className="h-4 w-4" />
              Ignore
            </Button>
            <Button onClick={() => onResolve(question)}>
              <CheckCircle2 className="h-4 w-4" />
              Resolve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
