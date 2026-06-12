import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDocuments } from "@/hooks/useDocuments";
import { useResolveQuestion } from "@/hooks/useUnansweredQuestions";
import type { UnansweredQuestion } from "@/types/admin";

interface ResolveQuestionDialogProps {
  question: UnansweredQuestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Dialog: pick the document that now answers the question, then PATCH resolve. */
export function ResolveQuestionDialog({
  question,
  open,
  onOpenChange,
}: ResolveQuestionDialogProps) {
  const [documentName, setDocumentName] = useState<string>("");
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const resolve = useResolveQuestion();

  // Reset selection whenever a new question is opened.
  useEffect(() => {
    if (open) setDocumentName("");
  }, [open, question?.id]);

  const indexedDocs =
    documents?.filter((d) => d.status === "indexed") ?? [];

  const handleSubmit = () => {
    if (!question || !documentName) return;
    resolve.mutate(
      { id: question.id, documentName },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve question</DialogTitle>
          <DialogDescription>
            Attach the document that now answers this question. Its name is
            recorded as the resolving source.
          </DialogDescription>
        </DialogHeader>

        {question && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Question #{question.id}
            </p>
            <p className="mt-1 text-foreground">{question.question}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="resolve-document">Resolving document</Label>
          <Select
            value={documentName}
            onValueChange={setDocumentName}
            disabled={docsLoading || resolve.isPending}
          >
            <SelectTrigger id="resolve-document">
              <SelectValue
                placeholder={
                  docsLoading ? "Loading documents…" : "Select a document"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {indexedDocs.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No indexed documents available.
                </div>
              ) : (
                indexedDocs.map((doc) => (
                  <SelectItem key={doc.id} value={doc.document_name}>
                    {doc.document_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Don't see the right document? Upload it on the Documents page first.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resolve.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!documentName || resolve.isPending}
          >
            {resolve.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resolving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Mark resolved
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
