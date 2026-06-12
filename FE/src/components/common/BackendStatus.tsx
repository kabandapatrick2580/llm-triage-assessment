import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHealth } from "@/hooks/useHealth";

/** Small live indicator of backend reachability (polls /health). */
export function BackendStatus() {
  const { online, isLoading } = useHealth();

  const label = isLoading
    ? "Checking backend…"
    : online
      ? "Backend online"
      : "Backend offline";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="hidden items-center gap-2 rounded-full border border-border px-2.5 py-1 sm:flex"
          aria-label={label}
        >
          <span className="relative flex h-2 w-2">
            {online && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                isLoading
                  ? "bg-muted-foreground"
                  : online
                    ? "bg-success"
                    : "bg-destructive",
              )}
            />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {online ? "Online" : isLoading ? "…" : "Offline"}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
