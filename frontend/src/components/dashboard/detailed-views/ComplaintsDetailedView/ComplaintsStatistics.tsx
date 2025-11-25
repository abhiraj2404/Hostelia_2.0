import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Complaint } from "@/features/complaints/complaintsSlice";

interface ComplaintsStatisticsProps {
  complaints: Complaint[];
}

export function ComplaintsStatistics({ complaints }: ComplaintsStatisticsProps) {
  // Calculate stats
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const rejected = complaints.filter(c => c.status === 'Rejected').length;

  // Calculate average resolution time (mock logic for now as we might need resolvedAt date)
  // Assuming if resolved, we use updatedAt as resolved date
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  const totalResolutionTime = resolvedComplaints.reduce((acc, curr) => {
    const created = new Date(curr.createdAt).getTime();
    const resolved = new Date(curr.updatedAt).getTime();
    return acc + (resolved - created);
  }, 0);
  
  const avgResolutionTime = resolvedComplaints.length > 0 
    ? (totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)).toFixed(1)
    : "0";

  const stats = [
    {
      title: "Total Complaints",
      value: total,
      icon: FileText,
      description: "All time complaints",
      color: "text-blue-500",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock,
      description: "Requires attention",
      color: "text-yellow-500",
    },
    {
      title: "Resolved",
      value: resolved,
      icon: CheckCircle,
      description: "Successfully fixed",
      color: "text-green-500",
    },
    {
      title: "Avg. Resolution Time",
      value: `${avgResolutionTime} Days`,
      icon: AlertCircle,
      description: "Time to fix issues",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
  );
}
