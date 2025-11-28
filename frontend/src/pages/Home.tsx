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
import { fetchComplaints } from "@/features/complaints/complaintsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import {
  ArrowUpRight,
  Building2,
  Check,
  Layers3,
  Sparkles,
  Timer,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const transformationPillars = [
  {
    title: "Unified command",
    description:
      "A single operating picture across hostels, wardens, and administrators.",
    icon: Layers3,
    bullets: [
      "Complaint routing by hostel (BH-1, BH-2, BH-3, BH-4) and category",
      "Announcements, mess menu, and fee tracking in sync",
      "Real-time status updates and progress tracking",
    ],
  },
  {
    title: "Student experience",
    description:
      "Transparent complaint tracking and hostel services for every student.",
    icon: Users2,
    bullets: [
      "Submit complaints with photo evidence and category selection",
      "Track complaint status: Pending, Under Review, Resolved, or Rejected",
      "Verify resolution and provide feedback on mess quality",
    ],
  },
  {
    title: "Hostel management",
    description: "Comprehensive oversight of complaints, fees, and services.",
    icon: Building2,
    bullets: [
      "Manage mess menu and receive student feedback",
      "Track fee submissions (hostel fee and mess fee) with document verification",
      "Monitor transit entries and manage announcements across hostels",
    ],
  },
];

const workflowStages = [
  {
    title: "Submit",
    subtitle:
      "Students submit complaints, upload fee receipts, and provide mess feedback.",
    metric: "Multiple channels",
  },
  {
    title: "Manage",
    subtitle:
      "Wardens update mess menu, review complaints, and manage announcements.",
    metric: "Centralized control",
  },
  {
    title: "Track",
    subtitle: "Monitor transit entries, fee status, and complaint resolutions.",
    metric: "Real-time updates",
  },
  {
    title: "Monitor",
    subtitle:
      "Admins oversee all activities across hostels with complete visibility.",
    metric: "Full oversight",
  },
];

const intelligenceMetrics = [
  {
    label: "Real-time updates",
    value: "Live",
    description:
      "Status updates across complaints, fees, and services update instantly.",
  },
  {
    label: "Multi-feature",
    value: "5 modules",
    description:
      "Complaints, Fees, Mess, Transit, and Announcements all in one platform.",
  },
  {
    label: "Complete tracking",
    value: "Full",
    description:
      "Every action, status change, and update is recorded with timestamps.",
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
            System workflow
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            A complete hostel management system
          </h2>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            From submitting complaints and fees to managing mess menus and
            tracking transit, Hostelia provides all the tools needed for
            efficient hostel operations.
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
  const dispatch = useAppDispatch();
  const { items: complaints } = useAppSelector((state) => state.complaints);
  const [feeCount, setFeeCount] = useState(0);
  const [messFeedbackCount, setMessFeedbackCount] = useState(0);
  const [messAvgRating, setMessAvgRating] = useState(0);
  const [transitCount, setTransitCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch complaints for overview
    dispatch(fetchComplaints(undefined));
  }, [dispatch]);

  useEffect(() => {
    // Fetch all metrics for overview
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [feesRes, messRes, transitRes, announcementRes] =
          await Promise.all([
            apiClient.get("/fee").catch(() => ({ data: { data: [] } })),
            apiClient
              .get("/mess/feedback")
              .catch(() => ({ data: { feedbacks: [] } })),
            apiClient
              .get("/transit")
              .catch(() => ({ data: { transitEntries: [] } })),
            apiClient
              .get("/announcement")
              .catch(() => ({ data: { data: [] } })),
          ]);

        // Calculate fee count
        const fees = feesRes.data?.data || [];
        setFeeCount(fees.length);

        // Calculate mess feedback count and average rating
        const feedbacks = messRes.data?.feedbacks || [];
        setMessFeedbackCount(feedbacks.length);
        if (feedbacks.length > 0) {
          const avgRating =
            feedbacks.reduce(
              (sum: number, f: { rating: number }) => sum + f.rating,
              0
            ) / feedbacks.length;
          setMessAvgRating(avgRating);
        }

        // Calculate transit count
        const transitEntries = transitRes.data?.transitEntries || [];
        setTransitCount(transitEntries.length);

        // Calculate announcement count
        const announcements = announcementRes.data?.data || [];
        setAnnouncementCount(announcements.length);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(
    (c) => c.status === "Pending"
  ).length;

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
                Complete visibility across all hostel operations
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Monitor complaints, fee submissions, mess feedback, transit
                entries, and announcements across all hostels. Track status
                updates and student verifications in real-time.
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
                System overview
              </div>
              <CardTitle className="text-2xl">
                Platform features at a glance
              </CardTitle>
              <CardDescription>
                Real-time statistics across all system modules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Complaints</p>
                  <p>
                    {totalComplaints} total complaint
                    {totalComplaints !== 1 ? "s" : ""} tracked.
                    {pendingComplaints > 0 &&
                      ` ${pendingComplaints} pending review.`}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {totalComplaints}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Fee Management</p>
                  <p>
                    {loading
                      ? "Loading..."
                      : feeCount > 0
                      ? `${feeCount} fee submission${
                          feeCount !== 1 ? "s" : ""
                        } tracked.`
                      : "Submit and track hostel fee and mess fee receipts."}
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-200">
                  {loading ? "..." : feeCount}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Mess Services</p>
                  <p>
                    {loading
                      ? "Loading..."
                      : messFeedbackCount > 0
                      ? `${messFeedbackCount} feedback${
                          messFeedbackCount !== 1 ? "s" : ""
                        } submitted. ${
                          messAvgRating > 0
                            ? `Avg: ${messAvgRating.toFixed(1)}⭐`
                            : ""
                        }`
                      : "View weekly menu and submit feedback."}
                  </p>
                </div>
                <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-200">
                  {loading ? "..." : messFeedbackCount}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    Transit & Announcements
                  </p>
                  <p>
                    {loading
                      ? "Loading..."
                      : `${transitCount} transit entr${
                          transitCount !== 1 ? "ies" : "y"
                        }, ${announcementCount} announcement${
                          announcementCount !== 1 ? "s" : ""
                        }.`}
                  </p>
                </div>
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-200">
                  {loading ? "..." : `${transitCount}/${announcementCount}`}
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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_55%)]" />
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
        <div className="flex flex-col gap-8 text-center md:text-left">
          <Badge className="self-center md:self-start">Ready to use</Badge>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Get started with Hostelia today.
            </h2>
            <p className="text-base text-primary-foreground/80 md:text-lg">
              Submit complaints, track fees, view mess menu, and manage transit
              requests. Everything you need for hostel management in one place.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="secondary" className="sm:w-auto">
              <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="sm:w-auto border-primary-foreground/60 text-primary-foreground bg-white/10 hover:bg-white/20"
            >
              <Link to="/complaints">
                View complaints
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
