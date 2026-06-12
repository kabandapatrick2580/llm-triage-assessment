import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  /** Whether the underlying dataset is empty. */
  empty?: boolean;
  emptyHint?: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  loading,
  empty,
  emptyHint,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : empty ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 opacity-50" />
            <p className="text-sm">{emptyHint || "No data yet"}</p>
          </div>
        ) : (
          <div className="h-64 w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
