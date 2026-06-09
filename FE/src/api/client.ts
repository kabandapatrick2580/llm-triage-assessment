import type { Ticket, TicketPage } from "../types";

/**
 * Base URL for the API. Empty in local dev so the Vite proxy handles `/api`;
 * set VITE_API_BASE_URL (e.g. https://your-backend.onrender.com) in production.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Thrown for any non-2xx response. `kind` lets the UI tailor its message
 * to the backend's failure modes (validation / model-unavailable / etc.).
 */
export class ApiError extends Error {
  kind: "validation" | "model" | "client" | "server" | "network";
  details?: unknown;

  constructor(
    message: string,
    kind: ApiError["kind"],
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.details = details;
  }
}

interface ErrorBody {
  error?: string;
  details?: unknown;
}

function classify(status: number): ApiError["kind"] {
  if (status === 422) return "validation";
  if (status === 502) return "model";
  if (status >= 500) return "server";
  return "client";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError("Cannot reach the server.", "network");
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* empty / non-JSON body */
  }

  if (!res.ok) {
    const err = (body ?? {}) as ErrorBody;
    throw new ApiError(
      err.error ?? `Request failed (${res.status})`,
      classify(res.status),
      err.details,
    );
  }

  return body as T;
}

export function triage(text: string): Promise<{ success: true; data: Ticket }> {
  return request("/api/triage", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function listTickets(params: {
  category?: string;
  priority?: string;
}): Promise<TicketPage> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.priority) qs.set("priority", params.priority);
  const suffix = qs.toString() ? `?${qs}` : "";
  return request(`/api/tickets${suffix}`);
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
