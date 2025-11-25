import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { Complaint } from "@/features/complaints/complaintsSlice";

interface ComplaintsAnalyticsProps {
  complaints: Complaint[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ComplaintsAnalytics({ complaints }: ComplaintsAnalyticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const rejected = complaints.filter(c => c.status === 'Rejected').length;

    // Calculate average resolution time
    const resolvedComplaints = complaints.filter(c => c.resolvedAt);
    const avgResolutionTime = resolvedComplaints.length > 0
      ? resolvedComplaints.reduce((sum, c) => {
          const created = new Date(c.createdAt).getTime();
          const resolved = new Date(c.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedComplaints.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      total,
      pending,
      resolved,
      rejected,
      avgResolutionTime: avgResolutionTime.toFixed(1),
    };
  }, [complaints]);

  // Category data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [complaints]);

  // Status data
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const statCards = [
    {
      title: "Total Complaints",
      value: stats.total,
      icon: AlertCircle,
      description: "All time",
      color: "text-blue-500",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      description: "Awaiting resolution",
      color: "text-yellow-500",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      description: "Successfully fixed",
      color: "text-green-500",
    },
    {
      title: "Avg Resolution Time",
      value: `${stats.avgResolutionTime} days`,
      icon: CheckCircle,
      description: "Time to resolve",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
