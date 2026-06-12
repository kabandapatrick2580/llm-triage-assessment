import { useMemo, useState } from "react";
import { Search, Upload, RefreshCw } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentList } from "@/components/documents/DocumentList";
import { UploadDialog } from "@/components/documents/UploadDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { getErrorMessage } from "@/api/axios";

export function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data, isLoading, isError, error, isFetching, refetch } =
    useDocuments();

  const filtered = useMemo(() => {
    const docs = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.document_name.toLowerCase().includes(q));
  }, [data, search]);

  const indexedCount = (data ?? []).filter(
    (d) => d.status === "indexed",
  ).length;

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge Base"
        description={
          isLoading
            ? "Loading documents…"
            : `${indexedCount} indexed document${indexedCount === 1 ? "" : "s"}`
        }
        actions={
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh documents"
            >
              <RefreshCw
                className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
          </>
        }
      />

      <div className="mb-5 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search documents"
          />
        </div>
      </div>

      <DocumentList
        documents={filtered}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        searchActive={search.trim().length > 0}
      />

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </PageContainer>
  );
}
