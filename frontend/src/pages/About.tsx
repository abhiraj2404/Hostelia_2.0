import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/hooks";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Code2,
  Database,
  Heart,
  Mail,
  Palette,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const coreFeatures = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Authentication",
    description:
      "OTP-based login with college email integration for verified access.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Role-Based Access",
    description:
      "Tailored dashboards for students, wardens, and administrators.",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-Time Updates",
    description:
      "Instant notifications and live status tracking for all operations.",
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email Integration",
    description: "Automated notifications via Gmail API for important updates.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Facility Management",
    description:
      "Track maintenance, complaints, and facility updates seamlessly.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Problem Tracking",
    description:
      "Submit, upvote, and track resolution of hostel issues efficiently.",
    color: "bg-pink-500/10 text-pink-500",
  },
];

const techStack = {
  frontend: [
    { name: "React 19", icon: Code2 },
    { name: "TypeScript", icon: Code2 },
    { name: "Tailwind CSS", icon: Palette },
    { name: "Vite", icon: Zap },
  ],
  backend: [
    { name: "Node.js", icon: Database },
    { name: "Express.js", icon: Database },
    { name: "MongoDB", icon: Database },
    { name: "JWT Auth", icon: Shield },
  ],
};

const userRoles = [
  {
    title: "Students",
    icon: CheckCircle2,
    description:
      "Submit complaints, track issues, upload fee receipts, and access hostel policies.",
    features: [
      "Report maintenance issues with photos",
      "Upvote existing problems",
      "Track complaint resolution status",
      "Submit mess feedback and ratings",
      "Request transit gate passes",
      "Upload fee payment receipts for verification",
    ],
    gradient: "from-blue-500/10 via-purple-500/10 to-pink-500/10",
  },
  {
    title: "Hostel Wardens",
    icon: Shield,
    description:
      "Manage complaints, send announcements, and oversee day-to-day operations.",
    features: [
      "Review and assign complaints",
      "Send hostel-wide announcements",
      "Update mess menu and timings",
      "Approve/reject transit requests",
      "Monitor student attendance",
      "Generate hostel reports",
    ],
    gradient: "from-green-500/10 via-emerald-500/10 to-teal-500/10",
  },
  {
    title: "Hostel Office (Admin)",
    icon: Users,
    description:
      "Oversee all operations, manage wardens, and track fee verifications.",
    features: [
      "Verify and approve fee payment receipts",
      "Appoint and manage wardens",
      "View cross-hostel analytics",
      "Generate audit reports",
      "System-wide configuration control",
      "Manage announcements and policies",
    ],
    gradient: "from-orange-500/10 via-amber-500/10 to-yellow-500/10",
  },
];

const missionValues = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To simplify hostel management through technology, improving communication, security, and administration for everyone.",
  },
  {
    icon: Heart,
    title: "Our Vision",
    description:
      "A connected campus where students, wardens, and admins work seamlessly together for a better living experience.",
  },
  {
    icon: Sparkles,
    title: "Our Values",
    description:
      "Transparency, accountability, and continuous improvement through data-driven insights and user feedback.",
  },
];

function About() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="container mx-auto px-6 py-20 text-center lg:px-12">
          <Badge
            variant="outline"
            className="mb-6 border-dashed px-4 py-2 text-xs uppercase tracking-[0.4em]"
          >
            About Us
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            HOSTELIA
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground md:text-2xl">
            Revolutionizing hostel management with a modern, unified platform
            for students, wardens, and administrators.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-20 lg:px-12">
          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {missionValues.map((item) => (
              <Card
                key={item.title}
                className="border-border/70 bg-card/80 shadow-sm"
              >
                <CardHeader className="space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Transforming Campus Living
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Hostelia is a comprehensive hostel management platform designed
              specifically for educational institutions. Built with modern web
              technologies, it provides a seamless experience for managing
              everything from maintenance requests to fee payments, all in one
              unified system.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-6 py-20 lg:px-12">
          <div className="mb-12 space-y-4 text-center">
            <Badge
              variant="outline"
              className="border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em]"
            >
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Everything You Need in One Place
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              Comprehensive features designed to streamline hostel operations
              and enhance the student living experience.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="h-full border-border/70 bg-card/80 shadow-sm transition-shadow hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-20 lg:px-12">
          <div className="mb-12 space-y-4 text-center">
            <Badge
              variant="outline"
              className="border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em]"
            >
              User Roles
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Tailored Experiences for Every Role
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              Customized dashboards and features designed for each user type's
              specific needs.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {userRoles.map((role) => (
              <Card
                key={role.title}
                className="relative h-full overflow-hidden border-border/70 bg-card/80 shadow-lg"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${role.gradient}`}
                />
                <CardHeader className="space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <role.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {role.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {role.features.map((feature) => (
                    <div key={feature} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-6 py-20 lg:px-12">
          <div className="mb-12 space-y-4 text-center">
            <Badge
              variant="outline"
              className="border-dashed px-3 py-1 text-xs uppercase tracking-[0.4em]"
            >
              Technology Stack
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Built with Modern Technologies
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              Leveraging cutting-edge tools and frameworks for performance,
              scalability, and maintainability.
            </p>
          </div>
          <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Code2 className="h-6 w-6 text-blue-500" />
                  Frontend
                </CardTitle>
                <CardDescription>
                  Modern UI built with React and TypeScript
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {techStack.frontend.map((tech) => (
                    <Badge
                      key={tech.name}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5 text-sm"
                    >
                      <tech.icon className="h-3.5 w-3.5" />
                      {tech.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Database className="h-6 w-6 text-green-500" />
                  Backend
                </CardTitle>
                <CardDescription>
                  Robust server with Node.js and MongoDB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {techStack.backend.map((tech) => (
                    <Badge
                      key={tech.name}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5 text-sm"
                    >
                      <tech.icon className="h-3.5 w-3.5" />
                      {tech.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="container mx-auto px-6 py-20 text-center lg:px-12">
          <div className="mx-auto max-w-3xl space-y-8">
            <Badge className="bg-white/20 text-primary-foreground hover:bg-white/30">
              Get Started
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Ready to Transform Your Hostel Management?
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Join hundreds of students, wardens, and administrators already
              using Hostelia to streamline their hostel operations.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="sm:w-auto"
              >
                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                  {isAuthenticated ? "Go to Dashboard" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
