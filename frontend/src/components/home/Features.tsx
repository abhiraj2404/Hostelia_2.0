import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Sparkles, Users2, Workflow } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const features = [
  {
    title: "Student Experience",
    description: "Comprehensive tools for hostel life management.",
    icon: Users2,
    bullets: [
      "Submit complaints with photo evidence and track status",
      "Upload fee receipts for hostel and mess fees",
      "View mess menu and provide feedback",
    ],
  },
  {
    title: "Warden Control Room",
    description: "Manage your hostel operations efficiently.",
    icon: Workflow,
    bullets: [
      "Complaint management and status updates by hostel",
      "Mess menu management and feedback review",
      "Transit entry approval and student oversight",
    ],
  },
  {
    title: "Admin Command",
    description: "Complete oversight over all hostels and students.",
    icon: ShieldCheck,
    bullets: [
      "Role-based access control and comprehensive digital audit trails",
      "Fee verification processes and centralized user management",
      "Cross-hostel analytics dashboard and detailed reporting",
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
        <div key={bullet} className="flex gap-2 min-h-10">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="leading-relaxed">{bullet}</p>
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
        <div className="mb-12 max-w-3xl space-y-4">
          <Badge
            variant="outline"
            className="w-max border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em] text-muted-foreground"
          >
            Platform pillars
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            Purpose-built journeys for every hostel role
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Hostelia aligns every stakeholder around the same operational truth.
            Students get clarity, wardens get focus, and admins get
            governance—without the ping-pong of calls or spreadsheets.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
