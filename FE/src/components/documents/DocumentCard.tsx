import { useState } from "react";
import {
  FileText,
  Trash2,
  Loader2,
  Calendar,
  Layers,
  FileStack,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/formatDate";
import { useDeleteDocument } from "@/hooks/useDocuments";
import type { KnowledgeDocument } from "@/types/document";

interface DocumentCardProps {
  document: KnowledgeDocument;
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

export function DocumentCard({ document }: DocumentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteDocument();
  const isRemoved = document.status === "removed";

  const handleDelete = () => {
    deleteMutation.mutate(document.document_name, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  return (
    <>
      <Card className="group flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-sm font-semibold"
                title={document.document_name}
              >
                {document.document_name}
              </p>
              <Badge
                variant={isRemoved ? "muted" : "success"}
                className="mt-1"
              >
                {isRemoved ? "Removed" : "Indexed"}
              </Badge>
            </div>
          </div>

          {!isRemoved && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfirmOpen(true)}
              aria-label={`Delete ${document.document_name}`}
              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3">
          <Stat icon={FileStack} label="pages" value={document.total_pages} />
          <Stat icon={Layers} label="chunks" value={document.total_chunks} />
          <Stat
            icon={Calendar}
            label=""
            value={formatDate(document.uploaded_at)}
          />
        </div>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              This removes{" "}
              <span className="font-medium text-foreground">
                {document.document_name}
              </span>{" "}
              and its {document.total_chunks} indexed chunks from the knowledge
              base. Answers will no longer cite this document.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
