import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import type { NavItem } from "./navigation";

interface AppShellProps {
  nav: NavItem[];
  brandTitle: string;
  brandSubtitle: string;
  /** Optional notice rendered above the routed content (e.g. an offline banner). */
  banner?: React.ReactNode;
}

/** Persistent sidebar + header shell, parameterized per use-case section. */
export function AppShell({ nav, brandTitle, brandSubtitle, banner }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        nav={nav}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header nav={nav} onMenuClick={() => setMobileNavOpen(true)} />
        {banner}
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
