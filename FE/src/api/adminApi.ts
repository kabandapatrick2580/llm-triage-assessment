import { apiClient } from "./axios";
import type {
  MutateQuestionResponse,
  QuestionStatusFilter,
  ResolveQuestionRequest,
  UnansweredQuestion,
  UnansweredQuestionListResponse,
} from "@/types/admin";

/**
 * `GET /api/admin/unanswered-questions` — optionally filtered by status.
 * The "all" filter omits the query param.
 */
export async function getUnansweredQuestions(
  status: QuestionStatusFilter = "all",
): Promise<UnansweredQuestionListResponse> {
  const params = status !== "all" ? { status } : undefined;
  const { data } = await apiClient.get<UnansweredQuestionListResponse>(
    "/api/admin/unanswered-questions",
    { params },
  );
  return data;
}

/** `GET /api/admin/unanswered-questions/:id`. */
export async function getUnansweredQuestion(
  id: number,
): Promise<UnansweredQuestion> {
  const { data } = await apiClient.get<UnansweredQuestion>(
    `/api/admin/unanswered-questions/${id}`,
  );
  return data;
}

/** `PATCH /api/admin/unanswered-questions/:id/resolve`. */
export async function resolveUnansweredQuestion(
  id: number,
  payload: ResolveQuestionRequest,
): Promise<MutateQuestionResponse> {
  const { data } = await apiClient.patch<MutateQuestionResponse>(
    `/api/admin/unanswered-questions/${id}/resolve`,
    payload,
  );
  return data;
}

/** `PATCH /api/admin/unanswered-questions/:id/ignore`. */
export async function ignoreUnansweredQuestion(
  id: number,
): Promise<MutateQuestionResponse> {
  const { data } = await apiClient.patch<MutateQuestionResponse>(
    `/api/admin/unanswered-questions/${id}/ignore`,
  );
  return data;
}
