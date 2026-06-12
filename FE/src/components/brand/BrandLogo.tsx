import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

/** Buhangano wordmark — a brain mark in a brand-gradient tile + the name. */
export function BrandLogo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-rust to-brand-amber text-white shadow-sm">
        <Brain className="h-5 w-5" />
      </span>
      {showText && (
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-primary">BUHA</span>
          <span className="text-brand-amber">NGANO</span>
        </span>
      )}
    </span>
  );
}
