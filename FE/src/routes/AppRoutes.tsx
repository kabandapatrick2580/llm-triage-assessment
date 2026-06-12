import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { TriageLayout } from "@/components/layout/TriageLayout";
import { KnowledgeLayout } from "@/components/layout/KnowledgeLayout";
import { LandingPage } from "@/pages/LandingPage";
import { CaseStudyPage } from "@/pages/CaseStudyPage";
import { OverviewPage } from "@/features/triage/pages/OverviewPage";
import { IntakeQueuePage } from "@/features/triage/pages/IntakeQueuePage";
import { InboxPage } from "@/features/triage/pages/InboxPage";

// UC2 pages carry heavy deps (recharts, syntax highlighter); load them lazily.
const ChatPage = lazy(() =>
  import("@/pages/ChatPage").then((m) => ({ default: m.ChatPage })),
);
const DocumentsPage = lazy(() =>
  import("@/pages/DocumentsPage").then((m) => ({ default: m.DocumentsPage })),
);
const AdminPage = lazy(() =>
  import("@/pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);
const KnowledgeAnalytics = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function RouteFallback() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const lazyRoute = (el: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{el}</Suspense>
);

export function AppRoutes() {
  return (
    <Routes>
      {/* Landing + case studies */}
      <Route element={<MarketingLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="case/:appId" element={<CaseStudyPage />} />
      </Route>

      {/* UC1 — Smart Intake Triage */}
      <Route path="triage" element={<TriageLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="queue" element={<IntakeQueuePage />} />
        <Route path="inbox" element={<InboxPage />} />
      </Route>

      {/* UC2 — Grounded Knowledge Assistant */}
      <Route path="knowledge" element={<KnowledgeLayout />}>
        <Route index element={lazyRoute(<ChatPage />)} />
        <Route path="documents" element={lazyRoute(<DocumentsPage />)} />
        <Route path="admin" element={lazyRoute(<AdminPage />)} />
        <Route path="analytics" element={lazyRoute(<KnowledgeAnalytics />)} />
      </Route>

      <Route path="*" element={lazyRoute(<NotFoundPage />)} />
    </Routes>
  );
}
