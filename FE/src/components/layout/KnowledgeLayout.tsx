import { AppShell } from "./AppShell";
import { KNOWLEDGE_NAV } from "./navigation";
import { KnowledgeOfflineBanner } from "@/components/common/KnowledgeOfflineBanner";

/** Shell for UC2 — the Grounded Knowledge Assistant. */
export function KnowledgeLayout() {
  return (
    <AppShell
      nav={KNOWLEDGE_NAV}
      brandTitle="Knowledge Assistant"
      brandSubtitle="Grounded RAG · UC2"
      banner={<KnowledgeOfflineBanner />}
    />
  );
}
