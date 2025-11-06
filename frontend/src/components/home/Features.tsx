import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ComponentType, SVGProps } from "react";
import {
  Brain,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Users2,
  Workflow,
} from "lucide-react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const features = [
  {
    title: "Student Experience",
    description: "Consumer-grade support desk tuned for campus life.",
    icon: Users2,
    bullets: [
      "One-tap submissions with photo & video evidence",
      "Live timelines with escalation nudges",
      "Feedback loops that close the loop after resolution",
    ],
  },
  {
    title: "Warden Control Room",
    description: "Every shift starts with a focused execution plan.",
    icon: Workflow,
    bullets: [
      "Smart routing powered by hostel, block, and priority",
      "Kanban, calendar, and SLA timers in one workspace",
      "Template responses and bulk actions for recurring tasks",
    ],
  },
  {
    title: "Admin Command",
    description: "Governance, finance, and compliance—simplified.",
    icon: ShieldCheck,
    bullets: [
      "Role-based guardrails and digital audit trails",
      "Invoice, penalty, and inventory workflows in sync",
      "Analytics API for council and parent reporting",
    ],
  },
  {
    title: "Insights & Automation",
    description: "Predictive operations with zero guesswork.",
    icon: Brain,
    bullets: [
      "AI-assisted categorisation and summarised updates",
      "Trend alerts for recurring issues and peak hours",
      "Playbooks that auto-trigger follow-up tasks",
    ],
  },
];

const FeatureCard = ({
  title,
  description,
  bullets,
  icon: Icon,
}: {
  title: string;
  description: string;
  bullets: string[];
  icon: Icon;
}) => (
  <Card className="h-full border-border/70 bg-card/80 shadow-sm">
    <CardHeader className="space-y-3">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <CardTitle className="text-2xl">{title}</CardTitle>
      <CardDescription className="text-base">{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3 text-sm text-muted-foreground">
      {bullets.map((bullet) => (
        <div key={bullet} className="flex gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p>{bullet}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);

function Features() {
  return (
    <section className="relative border-b border-border bg-muted/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-primary/10 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="w-max border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em] text-muted-foreground"
            >
              Platform pillars
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                Purpose-built journeys for every hostel role
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                Hostelia aligns every stakeholder around the same operational
                truth. Students get clarity, wardens get focus, and admins get
                governance—without the ping-pong of calls or spreadsheets.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <LifeBuoy className="h-5 w-5 text-primary" />
                <span>Launch in under 10 days with concierge onboarding.</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                <div className="rounded-xl border border-dashed border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Integrations
                  </p>
                  <p className="mt-2 text-sm">
                    Connect student directories, ID cards, and incident helplines
                    with ready-made connectors.
                  </p>
                </div>
                <div className="rounded-xl border border-dashed border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Controls
                  </p>
                  <p className="mt-2 text-sm">
                    Fine-grained permissions, approval workflows, and immutable
                    audit histories out of the box.
                  </p>
                </div>
              </div>
          </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;