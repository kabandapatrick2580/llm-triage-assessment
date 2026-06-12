import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BackendStatus } from "@/components/common/BackendStatus";
import type { NavItem } from "./navigation";

interface HeaderProps {
  nav: NavItem[];
  onMenuClick: () => void;
}

function useCurrentTitle(nav: NavItem[]) {
  const { pathname } = useLocation();
  // Longest matching path wins so an index route doesn't shadow its children.
  const match = [...nav]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to),
    );
  return match ?? nav[0];
}

export function Header({ nav, onMenuClick }: HeaderProps) {
  const current = useCurrentTitle(nav);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold md:text-lg">
          {current.label}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {current.description}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <BackendStatus />
        <ThemeToggle />
      </div>
    </header>
  );
}
