import type { QuestionStatusFilter } from "@/types/admin";

/** Centralized React Query cache keys to avoid string drift. */
export const queryKeys = {
  health: ["health"] as const,
  documents: ["documents"] as const,
  unansweredQuestions: (status: QuestionStatusFilter) =>
    ["unanswered-questions", status] as const,
  unansweredQuestion: (id: number) =>
    ["unanswered-questions", "detail", id] as const,
};
