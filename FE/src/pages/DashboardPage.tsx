import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Layers,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  MessageSquareText,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  DocumentGrowthChart,
  QuestionsOverTimeChart,
  ResolutionChart,
} from "@/components/dashboard/DashboardCharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocuments } from "@/hooks/useDocuments";
import { useUnansweredQuestions } from "@/hooks/useUnansweredQuestions";
import {
  documentGrowth,
  questionsOverTime,
  statusBreakdown,
  totalChunks,
} from "@/utils/analytics";

export function DashboardPage() {
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: questionsData, isLoading: qLoading } =
    useUnansweredQuestions("all");

  const docs = useMemo(
    () => (documents ?? []).filter((d) => d.status === "indexed"),
    [documents],
  );
  const questions = useMemo(
    () => questionsData?.unanswered_questions ?? [],
    [questionsData],
  );

  const breakdown = useMemo(() => statusBreakdown(questions), [questions]);
  const chunks = useMemo(() => totalChunks(documents ?? []), [documents]);
  const questionSeries = useMemo(
    () => questionsOverTime(questions),
    [questions],
  );
  const growthSeries = useMemo(
    () => documentGrowth(docs),
    [docs],
  );

  const loading = docsLoading || qLoading;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Knowledge base health and assistant activity at a glance."
        actions={
          <Button asChild>
            <Link to="/knowledge">
              <MessageSquareText className="h-4 w-4" />
              Open assistant
            </Link>
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Documents"
          value={docs.length}
          icon={FileText}
          accent="bg-primary/10 text-primary"
          loading={loading}
        />
        <StatCard
          label="Total Chunks"
          value={chunks.toLocaleString()}
          icon={Layers}
          accent="bg-indigo-500/10 text-indigo-500"
          loading={loading}
        />
        <StatCard
          label="Knowledge Gaps"
          value={breakdown.total}
          icon={HelpCircle}
          accent="bg-sky-500/10 text-sky-500"
          hint="Questions logged as unanswered"
          loading={loading}
        />
        <StatCard
          label="Pending Gaps"
          value={breakdown.pending}
          icon={AlertTriangle}
          accent="bg-warning/15 text-warning"
          loading={loading}
        />
        <StatCard
          label="Resolved Gaps"
          value={breakdown.resolved}
          icon={CheckCircle2}
          accent="bg-success/15 text-success"
          hint={`${breakdown.resolutionRate}% resolution rate`}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Questions Over Time"
          description="Knowledge gaps logged per day"
          loading={loading}
          empty={questionSeries.length === 0}
          emptyHint="No questions logged yet"
        >
          <QuestionsOverTimeChart data={questionSeries} />
        </ChartCard>

        <ChartCard
          title="Knowledge Gap Resolution"
          description={`${breakdown.resolutionRate}% resolved · ${breakdown.pending} pending`}
          loading={loading}
          empty={breakdown.total === 0}
          emptyHint="No knowledge gaps recorded"
        >
          <ResolutionChart data={breakdown} />
        </ChartCard>

        <ChartCard
          title="Document Growth"
          description="Cumulative indexed documents"
          loading={loading}
          empty={growthSeries.length === 0}
          emptyHint="Upload documents to see growth"
          className="lg:col-span-2"
        >
          <DocumentGrowthChart data={growthSeries} />
        </ChartCard>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickAction
          to="/knowledge/documents"
          icon={FileText}
          title="Manage documents"
          description="Upload PDFs and grow your knowledge base."
        />
        <QuickAction
          to="/knowledge/admin"
          icon={HelpCircle}
          title="Review knowledge gaps"
          description={`${breakdown.pending} pending question${
            breakdown.pending === 1 ? "" : "s"
          } awaiting review.`}
        />
      </div>
    </PageContainer>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="group">
      <Card className="flex items-center gap-4 p-5 transition-all hover:border-primary/50 hover:shadow-md">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{title}</p>
          <p className="truncate text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </Card>
    </Link>
  );
}
