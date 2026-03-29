import { useEffect, useState } from "react";
import { Loader2, Building2, Users, Home, UtensilsCrossed, Clock, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

interface Stats {
  totalColleges: number;
  approvedColleges: number;
  pendingColleges: number;
  rejectedColleges: number;
  totalUsers: number;
  totalHostels: number;
  totalMesses: number;
}

interface TrendItem {
  month: string;
  colleges?: number;
  users?: number;
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [collegeTrend, setCollegeTrend] = useState<TrendItem[]>([]);
  const [userTrend, setUserTrend] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/manager/stats");
        if (res.data?.success) {
          setStats(res.data.stats);
          setCollegeTrend(res.data.collegeTrend);
          setUserTrend(res.data.userTrend);
        }
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Colleges", value: stats?.totalColleges ?? 0, icon: Building2, color: "text-blue-600" },
    { label: "Approved", value: stats?.approvedColleges ?? 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: stats?.pendingColleges ?? 0, icon: Clock, color: "text-yellow-600" },
    { label: "Rejected", value: stats?.rejectedColleges ?? 0, icon: XCircle, color: "text-red-500" },
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-purple-600" },
    { label: "Total Hostels", value: stats?.totalHostels ?? 0, icon: Home, color: "text-indigo-600" },
    { label: "Total Messes", value: stats?.totalMesses ?? 0, icon: UtensilsCrossed, color: "text-orange-600" },
  ];

  const collegeChartConfig = {
    colleges: { label: "College Signups", color: "var(--chart-1)" },
  };

  const userChartConfig = {
    users: { label: "User Signups", color: "var(--chart-2)" },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground">Overview of all platform activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>College Signups (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={collegeChartConfig} className="h-[250px] w-full">
              <LineChart data={collegeTrend} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="colleges"
                  stroke="var(--color-colleges)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Signups (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userChartConfig} className="h-[250px] w-full">
              <LineChart data={userTrend} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
