import axios, { AxiosError } from "axios";

/**
 * Central Axios instance.
 *
 * Base URL resolution:
 *   - If VITE_API_BASE_URL is set, use it (e.g. "https://api.example.com").
 *   - Otherwise fall back to "" (same-origin). In dev, Vite proxies /api and
 *     /health to the Flask backend (see vite.config.ts).
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // Long timeout: RAG generation via local Ollama can be slow.
  timeout: 300_000,
});

/** Shape of the backend's error responses: `{ "error": "..." }`. */
interface BackendErrorBody {
  error?: string;
  message?: string;
}

/**
 * Extract a human-friendly error message from any thrown error, preferring the
 * backend's `error` field.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorBody>;
    const data = axiosError.response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (axiosError.code === "ECONNABORTED") {
      return "The request timed out. The model may still be processing — please try again.";
    }
    if (axiosError.message === "Network Error") {
      return "Could not reach the server. Is the backend running?";
    }
    return axiosError.message || "An unexpected network error occurred.";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
