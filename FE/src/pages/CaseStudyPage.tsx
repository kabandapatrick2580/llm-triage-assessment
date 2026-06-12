import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleDashed,
  Lightbulb,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApp } from "@/lib/brand";

export function CaseStudyPage() {
  const { appId } = useParams();
  const app = appId ? getApp(appId) : undefined;

  if (!app) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Unknown app.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All apps
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.gradient} text-white shadow-sm`}
          >
            <app.icon className="h-7 w-7" />
          </div>
          <div>
            <Badge variant="muted" className="mb-1">
              {app.badge}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {app.name}
            </h1>
            <p className="text-sm font-medium text-primary">{app.tagline}</p>
          </div>
        </div>

        <Button asChild size="lg" className="shrink-0">
          <Link to={app.runPath}>
            <Play className="h-4 w-4" />
            Run the app
          </Link>
        </Button>
      </div>

      <p className="mt-6 max-w-3xl text-pretty text-muted-foreground">
        {app.blurb}
      </p>

      {/* Required vs Built */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What was required</CardTitle>
            <CardDescription>From the assessment brief</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {app.required.map((r) => (
                <li key={r} className="flex gap-2.5 text-sm">
                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">What we built</CardTitle>
            <CardDescription>Shipped in this repo</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {app.built.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Under-specified decision */}
      <Card className="mt-5 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-warning" />
            The deliberately under-specified point
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{app.underspecified.point}</p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Our call: </span>
            {app.underspecified.decision}
          </p>
        </CardContent>
      </Card>

      {/* Tech + run */}
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-border bg-muted/30 p-6 text-center">
        <div className="flex flex-wrap justify-center gap-1.5">
          {app.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <Button asChild size="lg">
          <Link to={app.runPath}>
            <Play className="h-4 w-4" />
            Run {app.name}
          </Link>
        </Button>
      </div>
    </div>
  );
}
