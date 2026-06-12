import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUnansweredQuestion,
  getUnansweredQuestions,
  ignoreUnansweredQuestion,
  resolveUnansweredQuestion,
} from "@/api/adminApi";
import { getErrorMessage } from "@/api/axios";
import { notify } from "@/utils/notifications";
import { queryKeys } from "./queryKeys";
import type { QuestionStatusFilter } from "@/types/admin";

/** Query: list unanswered questions, optionally filtered by status. */
export function useUnansweredQuestions(status: QuestionStatusFilter = "all") {
  return useQuery({
    queryKey: queryKeys.unansweredQuestions(status),
    queryFn: () => getUnansweredQuestions(status),
    staleTime: 15_000,
  });
}

/** Query: a single unanswered question's full detail. */
export function useUnansweredQuestion(id: number | null) {
  return useQuery({
    queryKey: queryKeys.unansweredQuestion(id ?? -1),
    queryFn: () => getUnansweredQuestion(id as number),
    enabled: id != null,
  });
}

function useInvalidateQuestions() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ["unanswered-questions"] });
}

/** Mutation: resolve a question by attaching the document that answers it. */
export function useResolveQuestion() {
  const invalidate = useInvalidateQuestions();
  return useMutation({
    mutationFn: ({
      id,
      documentName,
    }: {
      id: number;
      documentName: string;
    }) =>
      resolveUnansweredQuestion(id, {
        resolved_by_document_name: documentName,
      }),
    onSuccess: (data) => {
      notify.success(
        "Question resolved",
        `Marked as resolved via ${data.resolved_by_document_name}.`,
      );
      invalidate();
    },
    onError: (error) => {
      notify.error("Could not resolve", getErrorMessage(error));
    },
  });
}

/** Mutation: ignore a question (dismiss as non-actionable). */
export function useIgnoreQuestion() {
  const invalidate = useInvalidateQuestions();
  return useMutation({
    mutationFn: (id: number) => ignoreUnansweredQuestion(id),
    onSuccess: () => {
      notify.info("Question ignored");
      invalidate();
    },
    onError: (error) => {
      notify.error("Could not ignore", getErrorMessage(error));
    },
  });
}
