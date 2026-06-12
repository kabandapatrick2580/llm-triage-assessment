import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { HOME_NAV, type NavItem } from "./navigation";

interface SidebarProps {
  nav: NavItem[];
  brandTitle: string;
  brandSubtitle: string;
  /** Mobile drawer open state. */
  open: boolean;
  onClose: () => void;
}

function NavRow({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground group-hover:text-accent-foreground",
            )}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({
  nav,
  brandTitle,
  brandSubtitle,
  onNavigate,
}: {
  nav: NavItem[];
  brandTitle: string;
  brandSubtitle: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="px-4 py-5">
        <BrandLogo />
        <p className="mt-3 text-sm font-semibold leading-tight">{brandTitle}</p>
        <p className="text-xs text-muted-foreground">{brandSubtitle}</p>
      </div>

      <nav className="flex-1 space-y-1 px-2" aria-label="Primary">
        {nav.map((item) => (
          <NavRow key={item.to} item={item} onNavigate={onNavigate} />
        ))}

        <div className="my-2 border-t border-border" />
        <NavRow item={HOME_NAV} onNavigate={onNavigate} />
      </nav>

      <div className="px-4 py-4">
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Runs on a single self-hosted open model — no hosted or commercial LLM
          APIs.
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  nav,
  brandTitle,
  brandSubtitle,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 lg:block">
        <SidebarContent
          nav={nav}
          brandTitle={brandTitle}
          brandSubtitle={brandSubtitle}
        />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-72 border-r border-border bg-card shadow-xl transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-label="Navigation menu"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-3"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
          <SidebarContent
            nav={nav}
            brandTitle={brandTitle}
            brandSubtitle={brandSubtitle}
            onNavigate={onClose}
          />
        </aside>
      </div>
    </>
  );
}
