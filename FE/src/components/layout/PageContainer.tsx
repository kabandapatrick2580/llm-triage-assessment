import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Remove the default max-width/padding (e.g. for the full-height chat). */
  fluid?: boolean;
}

/** Standard page wrapper providing consistent max width + padding. */
export function PageContainer({
  children,
  className,
  fluid = false,
}: PageContainerProps) {
  if (fluid) {
    return <div className={cn("h-full", className)}>{children}</div>;
  }
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/** Reusable page title block with optional right-aligned actions. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
