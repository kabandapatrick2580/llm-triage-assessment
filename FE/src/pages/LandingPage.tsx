import { Link } from "react-router-dom";
import { ArrowRight, Play, ServerCog, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { APPS } from "@/lib/brand";

export function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      {/* Hero */}
      <section className="text-center">
        <div className="mb-5 flex justify-center">
          <Badge
            variant="warning"
            className="gap-1.5 px-3 py-1 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Self-hosted open-source LLM · no hosted APIs · $0
          </Badge>
        </div>

        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
          Two applied-AI apps on one{" "}
          <span className="bg-gradient-to-r from-brand-rust to-brand-amber bg-clip-text text-transparent">
            self-hosted model
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          A single Flask backend serves both use cases over one local model
          (Ollama · Qwen2.5). Pick an app to see what was required, what we
          built, and run it live.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ServerCog className="h-4 w-4 text-primary" /> One self-hosted model
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Validated, grounded
            output
          </span>
        </div>
      </section>

      {/* App cards */}
      <section className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2">
        {APPS.map((app) => (
          <article
            key={app.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8"
          >
            <div
              className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient} text-white shadow-sm`}
            >
              <app.icon className="h-6 w-6" />
            </div>

            <Badge variant="muted" className="mb-2 w-fit">
              {app.badge}
            </Badge>
            <h2 className="text-xl font-bold tracking-tight">{app.name}</h2>
            <p className="text-sm font-medium text-primary">{app.tagline}</p>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">
              {app.blurb}
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {app.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link to={`/case/${app.id}`}>
                  View case study
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={app.runPath}>
                  <Play className="h-4 w-4" />
                  Run app
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </section>

      {/* Foot note */}
      <section className="mt-14 flex flex-col items-center gap-3 text-center">
        <BrandLogo />
        <p className="max-w-xl text-sm text-muted-foreground">
          Built for the Senior Full Stack Developer assessment — full-stack +
          applied AI, with deliberate, defensible trade-offs where the spec was
          left open.
        </p>
      </section>
    </div>
  );
}
