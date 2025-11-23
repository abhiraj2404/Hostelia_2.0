import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  Building2,
  Check,
  Layers3,
  Sparkles,
  Timer,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";

const transformationPillars = [
  {
    title: "Unified command",
    description:
      "A single operating picture across facilities, wardens, and leadership.",
    icon: Layers3,
    bullets: [
      "Automated routing by hostel, priority, and SLA",
      "Notice board, inventory, and room allocation in sync",
      "Escalations surfaced before they become crises",
    ],
  },
  {
    title: "Resident experience",
    description: "Consumer-grade transparency for every student interaction.",
    icon: Users2,
    bullets: [
      "Mobile-first submissions with instant acknowledgements",
      "Two-way updates with photos, notes, and verification",
      "Feedback loops and pulse surveys after resolution",
    ],
  },
  {
    title: "Smart facilities",
    description: "Predictable maintenance and vendor accountability.",
    icon: Building2,
    bullets: [
      "Preventive maintenance calendars with reminders",
      "Vendor performance insights and contract tracking",
      "Energy, water, and mess analytics in one view",
    ],
  },
];

const workflowStages = [
  {
    title: "Capture",
    subtitle: "Students raise issues with guided forms and media.",
    metric: "45% faster submissions",
  },
  {
    title: "Coordinate",
    subtitle: "Wardens assign, collaborate, and document progress.",
    metric: "12 fewer calls per ticket",
  },
  {
    title: "Resolve",
    subtitle: "Vendors and internal teams close the loop with evidence.",
    metric: "SLA adherence at 98%",
  },
  {
    title: "Learn",
    subtitle: "Admins review analytics, generate audits, and optimise budgets.",
    metric: "30% reduction in repeat issues",
  },
];

const intelligenceMetrics = [
  {
    label: "Cross-campus visibility",
    value: "Realtime",
    description: "Dashboards refresh automatically as wardens update status.",
  },
  {
    label: "Average acknowledgement",
    value: "11 min",
    description: "Students receive confirmations without manual follow-ups.",
  },
  {
    label: "Audit readiness",
    value: "100%",
    description:
      "Immutable trails for every note, attachment, and status change.",
  },
];

function TransformationGrid() {
  return (
    <section className="border-b border-border bg-linear-to-b from-muted/40 to-background">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
        <div className="mb-12 max-w-3xl space-y-4">
          <Badge
            variant="outline"
            className="w-max border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em] text-muted-foreground"
          >
            Operational blueprint
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            Replace paper trails with proactive, data-backed coordination
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Hostelia stitches together maintenance, communications, finance, and
            compliance. Every role gets a tailored cockpit while leadership
            retains full control.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {transformationPillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="h-full border-border/70 bg-card/80 shadow-sm"
            >
              <CardHeader className="space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl">{pillar.title}</CardTitle>
                <CardDescription className="text-base">
                  {pillar.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {pillar.bullets.map((bullet) => (
                  <div key={bullet} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p>{bullet}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowShowcase() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
        <div className="space-y-4">
          <Badge
            variant="outline"
            className="w-max border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em] text-muted-foreground"
          >
            Workflow intelligence
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            A guided journey from submission to resolution
          </h2>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Orchestrate consistent service quality across every hostel block
            with structured handoffs, contextual collaboration, and instant
            feedback loops.
          </p>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2">
          {workflowStages.map((stage, index) => (
            <Card
              key={stage.title}
              className="relative h-full overflow-hidden border-border/70 bg-card/80 shadow-sm"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary to-primary/40" />
              <CardHeader className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {index + 1}
                </div>
                <CardTitle className="text-xl text-foreground">
                  {stage.title}
                </CardTitle>
                <CardDescription>{stage.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                  <Timer className="h-3.5 w-3.5" />
                  {stage.metric}
                </div>
              </CardContent>
            </Card>
          ))}
        </ol>
      </div>
    </section>
  );
}

function OperatingIntelligence() {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="w-max border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em] text-muted-foreground"
            >
              Operating intelligence
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                Every stakeholder knows what matters now, next, and later
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Monitor occupancy, facility health, and student sentiment with a
                single glance. Deep dive into any hostel or time period without
                manual data pulls.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {intelligenceMetrics.map((metric) => (
                <Card
                  key={metric.label}
                  className="border-border/70 bg-card/80 shadow-sm"
                >
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      {metric.value}
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest">
                      {metric.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className="h-full border-border/70 bg-card/80 shadow-lg">
            <CardHeader className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
                <Sparkles className="h-4 w-4" />
                Predictive insights
              </div>
              <CardTitle className="text-2xl">
                Command center highlights
              </CardTitle>
              <CardDescription>
                Daily summary prepared automatically for wardens and admins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    Escalation watch
                  </p>
                  <p>Wardens BH-2 & BH-3 have SLA breaches approaching.</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  3 alerts
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Recurring issue</p>
                  <p>Water-leak complaints trending for Block C, level 4.</p>
                </div>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-200">
                  Investigate
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Budget impact</p>
                  <p>Mess maintenance projected 12% under cap this quarter.</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                  Healthy
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    Top satisfaction driver
                  </p>
                  <p>
                    Rapid response to electrical issues increased student NPS by
                    11 points.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Share
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function MomentumCTA() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_55%)]" />
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
        <div className="flex flex-col gap-8 text-center md:text-left">
          <Badge className="self-center md:self-start">Deployment ready</Badge>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Launch Hostelia in days, not months.
            </h2>
            <p className="text-base text-primary-foreground/80 md:text-lg">
              Map your wards, import residents, and activate digitised workflows
              with concierge onboarding. Our team co-pilots the first rollout so
              you can focus on culture, not configuration.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="secondary" className="sm:w-auto">
              <a href="mailto:team@hostelia.dev">Book a walkthrough</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="sm:w-auto border-primary-foreground/60 text-primary-foreground bg-white/10 hover:bg-white/20"
            >
              <Link to="/complaints">
                Explore live portal
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <TransformationGrid />
      <WorkflowShowcase />
      <OperatingIntelligence />
      <MomentumCTA />
    </div>
  );
}

export default Home;
