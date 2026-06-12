/**
 * Chat / RAG types.
 *
 * These mirror the Flask backend's `POST /api/chat` contract:
 *   - found:   { answer, citations[], found_in_knowledge_base: true }
 *   - notfound:{ answer, citations: [], found_in_knowledge_base: false, unanswered_question_id }
 */

/** A single grounding citation returned by the backend. */
export interface Citation {
  /** Source document name, e.g. "Employee_Handbook.pdf". */
  document: string;
  /** 1-based page number the chunk came from. */
  page: number;
  /** Chunk identifier, format "<document_name>::<chunk_index>". */
  chunk_id: string;
}

/** Raw response body from `POST /api/chat`. */
export interface ChatApiResponse {
  answer: string;
  citations: Citation[];
  found_in_knowledge_base: boolean;
  /** Present only when found_in_knowledge_base === false. */
  unanswered_question_id?: number;
}

/** Request body for `POST /api/chat`. */
export interface ChatRequest {
  question: string;
}

/**
 * Derived confidence level. The backend does not return a numeric confidence,
 * so we derive a coarse label client-side from grounding strength
 * (whether the answer was found and how many distinct sources support it).
 */
export type Confidence = "high" | "medium" | "low" | "none";

export type ChatRole = "user" | "assistant";

/** A normalized chat message persisted in localStorage and rendered in the UI. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** ISO timestamp string. */
  createdAt: string;
  /** Assistant-only fields below. */
  citations?: Citation[];
  foundInKnowledgeBase?: boolean;
  confidence?: Confidence;
  unansweredQuestionId?: number;
  /** True while an assistant message is still being generated. */
  pending?: boolean;
  /** Set if the request errored, so the UI can show a retry/error state. */
  error?: string;
}

/** A persisted conversation thread. */
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
