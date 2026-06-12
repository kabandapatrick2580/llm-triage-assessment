import { FileText, FolderOpen, AlertCircle } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { KnowledgeDocument } from "@/types/document";

interface DocumentListProps {
  documents: KnowledgeDocument[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  /** True when a search filter is active but yields nothing. */
  searchActive: boolean;
}

function CardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-4 border-t border-border pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  );
}

export function DocumentList({
  documents,
  isLoading,
  isError,
  errorMessage,
  searchActive,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="font-medium">Could not load documents</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {errorMessage || "Please check that the backend is running."}
        </p>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {searchActive ? (
            <FileText className="h-6 w-6" />
          ) : (
            <FolderOpen className="h-6 w-6" />
          )}
        </div>
        <p className="font-medium">
          {searchActive ? "No matching documents" : "No documents yet"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {searchActive
            ? "Try a different search term."
            : "Upload your first PDF to start building the knowledge base."}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
