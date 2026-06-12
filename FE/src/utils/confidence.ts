import type { ChatApiResponse, Confidence } from "@/types/chat";

/**
 * Derive a coarse confidence label from a chat response.
 *
 * The backend returns a strictly grounded answer but no numeric confidence, so
 * we infer it from grounding strength:
 *   - not found            -> "none"
 *   - found, 3+ citations  -> "high"   (well corroborated)
 *   - found, 1-2 citations -> "medium"
 *   - found, 0 citations   -> "low"    (grounded but thin / unusual)
 */
export function deriveConfidence(response: ChatApiResponse): Confidence {
  if (!response.found_in_knowledge_base) return "none";
  const count = response.citations?.length ?? 0;
  if (count >= 3) return "high";
  if (count >= 1) return "medium";
  return "low";
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "Not found",
};
