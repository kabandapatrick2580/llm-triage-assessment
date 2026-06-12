/**
 * Admin / knowledge-gap types — mirror the backend UnansweredQuestion
 * model `to_dict()`.
 */

export type QuestionStatus = "pending" | "resolved" | "ignored";

/** Filter value used by the admin table (adds an "all" pseudo-status). */
export type QuestionStatusFilter = "all" | QuestionStatus;

export interface UnansweredQuestion {
  id: number;
  question: string;
  attempted_answer: string | null;
  retrieved_context_summary: string;
  /** Best similarity score from retrieval, 0..1. */
  similarity_score: number;
  status: QuestionStatus;
  /** ISO8601 UTC string, or null. */
  created_at: string | null;
  /** ISO8601 UTC string, or null. */
  resolved_at: string | null;
  resolved_by_document_name: string | null;
}

/** `GET /api/admin/unanswered-questions` response. */
export interface UnansweredQuestionListResponse {
  count: number;
  unanswered_questions: UnansweredQuestion[];
}

/** Request body for `PATCH /api/admin/unanswered-questions/:id/resolve`. */
export interface ResolveQuestionRequest {
  resolved_by_document_name: string;
}

/**
 * The resolve/ignore endpoints return a flattened object: the question fields
 * plus a `message`. We model that as the question plus an optional message.
 */
export type MutateQuestionResponse = UnansweredQuestion & { message: string };
