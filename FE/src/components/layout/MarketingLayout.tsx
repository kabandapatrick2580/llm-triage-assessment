import { Link, Outlet } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BRAND } from "@/lib/brand";

/** Centered marketing chrome for the landing + case-study pages. */
export function MarketingLayout() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/" aria-label="Home">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {BRAND.product}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row md:px-6">
          <span>
            © {BRAND.year} {BRAND.name}. {BRAND.tagline}
          </span>
          <span>{BRAND.address}</span>
        </div>
      </footer>
    </div>
  );
}
