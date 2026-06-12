import { apiClient } from "./axios";
import type {
  DeleteDocumentResponse,
  DocumentListResponse,
  KnowledgeDocument,
  UploadDocumentResponse,
} from "@/types/document";

/** `GET /api/documents` — list all documents (newest first). */
export async function getDocuments(): Promise<KnowledgeDocument[]> {
  const { data } = await apiClient.get<DocumentListResponse>("/api/documents");
  return data.documents;
}

/**
 * `POST /api/documents/upload` — multipart upload of a single PDF.
 * `onProgress` receives a 0..100 percentage for the upload phase.
 */
export async function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<UploadDocumentResponse>(
    "/api/documents/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    },
  );
  return data;
}

/** `DELETE /api/documents/:name` — note the backend deletes by document name. */
export async function deleteDocument(
  documentName: string,
): Promise<DeleteDocumentResponse> {
  const { data } = await apiClient.delete<DeleteDocumentResponse>(
    `/api/documents/${encodeURIComponent(documentName)}`,
  );
  return data;
}
