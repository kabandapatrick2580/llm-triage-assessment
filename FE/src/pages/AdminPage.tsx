import { useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnansweredQuestionTable } from "@/components/admin/UnansweredQuestionTable";
import { QuestionDetailsDialog } from "@/components/admin/QuestionDetailsDialog";
import { ResolveQuestionDialog } from "@/components/admin/ResolveQuestionDialog";
import {
  useIgnoreQuestion,
  useUnansweredQuestions,
} from "@/hooks/useUnansweredQuestions";
import { getErrorMessage } from "@/api/axios";
import type {
  QuestionStatusFilter,
  UnansweredQuestion,
} from "@/types/admin";

const FILTERS: { value: QuestionStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "ignored", label: "Ignored" },
];

export function AdminPage() {
  const [filter, setFilter] = useState<QuestionStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UnansweredQuestion | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useUnansweredQuestions(filter);
  const ignore = useIgnoreQuestion();

  const questions = useMemo(() => {
    const list = data?.unanswered_questions ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || String(item.id) === q,
    );
  }, [data, search]);

  const handleView = (q: UnansweredQuestion) => {
    setSelected(q);
    setDetailsOpen(true);
  };

  const handleResolve = (q: UnansweredQuestion) => {
    setSelected(q);
    setDetailsOpen(false);
    setResolveOpen(true);
  };

  const handleIgnore = (q: UnansweredQuestion) => {
    ignore.mutate(q.id, { onSuccess: () => setDetailsOpen(false) });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge Gaps"
        description="Review questions the knowledge base couldn't answer, and resolve them by adding source documents."
        actions={
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh questions"
          >
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as QuestionStatusFilter)}
        >
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative max-w-xs sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search questions"
          />
        </div>
      </div>

      <UnansweredQuestionTable
        questions={questions}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        onView={handleView}
        onResolve={handleResolve}
        onIgnore={handleIgnore}
      />

      <QuestionDetailsDialog
        question={selected}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onResolve={handleResolve}
        onIgnore={handleIgnore}
        ignoring={ignore.isPending}
      />

      <ResolveQuestionDialog
        question={selected}
        open={resolveOpen}
        onOpenChange={setResolveOpen}
      />
    </PageContainer>
  );
}
