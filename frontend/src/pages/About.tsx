import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Shield, Zap, Mail } from "lucide-react";

const features = [
  {
    icon: <Shield className="h-5 w-5 text-blue-500" />,
    title: "Secure Authentication",
    description: "OTP-based login with college email integration.",
  },
  {
    icon: <Users className="h-5 w-5 text-green-500" />,
    title: "Role-Based Dashboards",
    description: "Custom views for students, wardens, and admins.",
  },
  {
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    title: "Problem Tracking",
    description: "Report issues, upvote problems, and track status.",
  },
  {
    icon: <Mail className="h-5 w-5 text-purple-500" />,
    title: "Email Integration",
    description: "Automated notifications via Gmail API.",
  },
];

const techStack = [
  "Node.js",
  "Express",
  "MongoDB",
  "React",
  "Redux Toolkit",
  "Tailwind CSS",
  "Shadcn UI",
  "Socket.io",
];

function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="py-20 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            HOSTELIA
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Revolutionizing Hostel Management with Innovation
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        {/* Mission & About Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At <strong className="text-primary font-semibold">Hostelia</strong>, we
              simplify hostel management to improve communication, security, and
              administration for students, wardens, and admins.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">About The Project</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A user-friendly hostel management app where students can report
              issues, pay fees, and access policies; wardens manage attendance
              and complaints; admins oversee room allocation and fee tracking.
            </p>
          </div>
        </div>

        {/* Core Features */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Core Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Technology Stack</CardTitle>
              <CardDescription>
                Built with modern web technologies for performance and
                scalability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Users & Roles */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Users & Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Hostel Office (Admin)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Oversee operations, room allocation, and fee tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Hostel Wardens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage complaints, announcements, and mess updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Report issues, upvote problems, and pay fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;
