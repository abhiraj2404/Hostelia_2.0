import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Gauge,
  ShieldCheck,
  Sparkles,
  Users2,
  Workflow,
} from "lucide-react";

const metrics = [
  {
    label: "Resolution compliance",
    value: "98%",
    detail: "SLA hits across multi-campus deployments",
  },
  {
    label: "Time saved weekly",
    value: "40h",
    detail: "Per hostel team with automated routing",
  },
  {
    label: "Stakeholder satisfaction",
    value: "4.9/5",
    detail: "Average rating from students & wardens",
  },
];

const lifecycle = [
  {
    title: "Students submit rich requests",
    description: "Mobile-first forms with photo evidence and smart categories.",
  },
  {
    title: "Wardens orchestrate fixes",
    description: "Auto-assigned tasks, SLA timers, and threaded updates.",
  },
  {
    title: "Admins audit in real time",
    description: "Compliance dashboards and campus-wide performance insights.",
  },
];

const queueSnapshot = [
  {
    label: "New complaints",
    value: "08",
    tone: "bg-primary/15 text-primary",
  },
  {
    label: "In progress",
    value: "15",
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
  },
  {
    label: "Awaiting confirmation",
    value: "04",
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  },
];

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:radial-gradient(800px_260px_at_50%_-40%,hsl(var(--primary)/0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-linear-to-l from-primary/10 to-transparent lg:block" />
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="w-max border-dashed px-4 py-1 text-xs uppercase tracking-[0.4em] text-muted-foreground"
            >
              Hostel ops reimagined
            </Badge>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                Deliver a world-class hostel experience with enterprise-grade
                clarity.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Hostelia replaces fragmented tools with a modern workspace that
                anticipates issues, aligns wardens and admins, and keeps
                students informed without manual follow-ups.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/login">
                  Launch command center
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/student/complaints">See complaints portal</Link>
              </Button>
            </div>
            <div className="grid gap-4 pt-6 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm"
                >
                  <p className="text-3xl font-semibold text-foreground">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-assisted triage
              </span>
              <span className="inline-flex items-center gap-2">
                <Users2 className="h-4 w-4 text-primary" />
                Role-aware access
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Audit-ready history
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-linear-to-br from-primary/15 to-transparent blur-3xl" />
            <Card className="relative overflow-hidden rounded-3xl border-border/70 bg-card/80 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <Badge className="gap-2 bg-primary text-primary-foreground">
                  <Workflow className="h-4 w-4" />
                  Live dashboard
                </Badge>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Refreshes every 60s
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                {queueSnapshot.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${item.tone}`}
                  >
                    <span>{item.label}</span>
                    <span className="text-2xl font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
              <CardContent className="mt-6 space-y-4 rounded-2xl border border-dashed border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Resolution lifecycle
                </p>
                <ol className="space-y-4 text-sm text-muted-foreground">
                  {lifecycle.map((stage, index) => (
                    <li key={stage.title} className="flex gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{stage.title}</p>
                        <p>{stage.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
              <div className="mt-6 grid gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  SLA alerts lock in under 5 minutes
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Evidence trail signed and timestamped
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
