import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, DollarSign, MessageSquare } from "lucide-react";
import type { DashboardMetrics, DetailedTab } from "@/types/dashboard";

interface AdminMetricsProps {
  metrics: DashboardMetrics;
  activeTab: DetailedTab;
  onMetricClick: (tab: DetailedTab) => void;
}

export function AdminMetrics({
  metrics,
  activeTab,
  onMetricClick,
}: AdminMetricsProps) {
  const metricsConfig = [
    {
      tab: "students" as DetailedTab,
      label: "Total Students",
      value: metrics.students || 0,
      description: "Across all hostels",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      tab: "complaints" as DetailedTab,
      label: "Complaints",
      value: metrics.complaints?.total || 0,
      description: `${metrics.complaints?.pending || 0} pending`,
      icon: FileText,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      tab: "fees" as DetailedTab,
      label: "Fee Submissions",
      value: metrics.fees?.hostelFee?.total + metrics.fees?.messFee?.total || 0,
      description: `${(metrics.fees?.hostelFee?.pending || 0) + (metrics.fees?.messFee?.pending || 0)} pending`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      tab: "mess" as DetailedTab,
      label: "Mess Feedback",
      value: metrics.messFeedback?.total || 0,
      description: `Avg: ${metrics.messFeedback?.avgRating?.toFixed(1) || 0}/5`,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricsConfig.map((metric) => (
        <Card
          key={metric.tab}
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeTab === metric.tab ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onMetricClick(metric.tab)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.label}
            </CardTitle>
            <div className={`rounded-full p-2 ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
