/**
 * Document types — mirror the backend Document model `to_dict()`.
 */

export type DocumentStatus = "indexed" | "removed";

export interface KnowledgeDocument {
  id: number;
  document_name: string;
  file_path: string;
  total_pages: number;
  total_chunks: number;
  /** ISO8601 UTC string, or null. */
  uploaded_at: string | null;
  status: DocumentStatus;
}

/** `GET /api/documents` response. */
export interface DocumentListResponse {
  documents: KnowledgeDocument[];
}

/** `POST /api/documents/upload` success response (201). */
export interface UploadDocumentResponse {
  message: string;
  document_name: string;
  total_pages: number;
  total_chunks: number;
}

/** `DELETE /api/documents/:name` success response. */
export interface DeleteDocumentResponse {
  message: string;
  document_name: string;
  chunks_removed: number;
}
