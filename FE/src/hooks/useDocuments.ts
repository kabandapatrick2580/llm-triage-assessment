import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "@/api/documentApi";
import { getErrorMessage } from "@/api/axios";
import { notify } from "@/utils/notifications";
import { queryKeys } from "./queryKeys";

/** Query: list of all documents. */
export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: getDocuments,
    staleTime: 30_000,
  });
}

/** Mutation: upload a PDF with progress reporting. */
export function useUploadDocument(
  onProgress?: (percent: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadDocument(file, onProgress),
    onSuccess: (data) => {
      notify.success(
        "Document indexed",
        `${data.document_name} — ${data.total_pages} pages, ${data.total_chunks} chunks.`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    },
    onError: (error) => {
      notify.error("Upload failed", getErrorMessage(error));
    },
  });
}

/** Mutation: delete a document by name. */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentName: string) => deleteDocument(documentName),
    onSuccess: (data) => {
      notify.success(
        "Document deleted",
        `${data.document_name} — ${data.chunks_removed} chunks removed.`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    },
    onError: (error) => {
      notify.error("Delete failed", getErrorMessage(error));
    },
  });
}
