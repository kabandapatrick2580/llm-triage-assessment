import { apiClient } from "./axios";
import type { ChatApiResponse, ChatRequest } from "@/types/chat";

/**
 * Ask a grounded question. Maps to `POST /api/chat`.
 *
 * Returns either a grounded answer with citations, or a "not found" payload
 * carrying an `unanswered_question_id` recorded for admin review.
 */
export async function postChat(payload: ChatRequest): Promise<ChatApiResponse> {
  const { data } = await apiClient.post<ChatApiResponse>("/api/chat", payload);
  return data;
}
