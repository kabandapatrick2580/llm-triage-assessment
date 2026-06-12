import { AlertTriangle } from "lucide-react";
import { useHealth } from "@/hooks/useHealth";

/**
 * Shown on the Knowledge (UC2) pages when the backend is up but the RAG routes
 * aren't registered — i.e. chromadb / PyMuPDF aren't installed in the running
 * environment. Turns a silent 404-on-upload into an actionable message.
 */
export function KnowledgeOfflineBanner() {
  const { online, knowledgeEnabled } = useHealth();

  // Only warn when the backend is reachable AND explicitly reports UC2 off.
  if (!online || knowledgeEnabled !== false) return null;

  return (
    <div className="border-b border-warning/30 bg-warning/10 px-4 py-2.5 md:px-6">
      <div className="mx-auto flex max-w-5xl items-start gap-2.5 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-foreground">
          <span className="font-semibold">RAG backend offline.</span>{" "}
          The Knowledge Assistant isn't available because the server is missing
          its retrieval dependencies. Install them and restart the backend:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            pip install -r requirements.txt
          </code>{" "}
          (chromadb, PyMuPDF), then run with Ollama serving{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            nomic-embed-text
          </code>
          .
        </p>
      </div>
    </div>
  );
}
