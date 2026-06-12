import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  MinusCircle,
  Inbox,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { SimilarityScore } from "./SimilarityScore";
import { formatRelative } from "@/utils/formatDate";
import type { UnansweredQuestion } from "@/types/admin";

interface UnansweredQuestionTableProps {
  questions: UnansweredQuestion[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onView: (q: UnansweredQuestion) => void;
  onResolve: (q: UnansweredQuestion) => void;
  onIgnore: (q: UnansweredQuestion) => void;
}

function RowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function UnansweredQuestionTable({
  questions,
  isLoading,
  isError,
  errorMessage,
  onView,
  onResolve,
  onIgnore,
}: UnansweredQuestionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14">ID</TableHead>
            <TableHead className="min-w-[240px]">Question</TableHead>
            <TableHead className="w-32">Created</TableHead>
            <TableHead className="w-36">Similarity</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-40">Resolved By</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}

          {isError && !isLoading && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7}>
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="font-medium">Could not load questions</p>
                  <p className="text-sm text-muted-foreground">
                    {errorMessage || "Please check the backend connection."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && questions.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7}>
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <p className="font-medium">No questions here</p>
                  <p className="text-sm text-muted-foreground">
                    When users ask something the knowledge base can't answer,
                    it'll show up here.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            questions.map((q) => (
              <TableRow
                key={q.id}
                className="cursor-pointer"
                onClick={() => onView(q)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{q.id}
                </TableCell>
                <TableCell className="max-w-[360px]">
                  <p className="truncate font-medium" title={q.question}>
                    {q.question}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatRelative(q.created_at)}
                </TableCell>
                <TableCell>
                  <SimilarityScore score={q.similarity_score} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={q.status} />
                </TableCell>
                <TableCell className="text-xs">
                  {q.resolved_by_document_name ? (
                    <span
                      className="block max-w-[160px] truncate"
                      title={q.resolved_by_document_name}
                    >
                      {q.resolved_by_document_name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for question ${q.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(q)}>
                        <Eye className="h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      {q.status === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onResolve(q)}>
                            <CheckCircle2 className="h-4 w-4" />
                            Resolve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onIgnore(q)}>
                            <MinusCircle className="h-4 w-4" />
                            Ignore
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
