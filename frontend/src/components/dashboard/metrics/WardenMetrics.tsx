import { metricIcons } from "@/components/dashboard/utils/dashboardConstants";
import { MetricCard } from "./MetricCard";
import type { DashboardMetrics } from "@/types/dashboard";
import type { DetailedTab } from "@/types/dashboard";

interface WardenMetricsProps {
  metrics: DashboardMetrics;
  activeTab: DetailedTab;
  onMetricClick: (tab: DetailedTab) => void;
}

export function WardenMetrics({ metrics, activeTab, onMetricClick }: WardenMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Students Metric */}
      <MetricCard
        label="Students"
        value={metrics.students || 0}
        description="In My Hostel"
        icon={metricIcons.students}
        tone="bg-blue-50 dark:bg-blue-950/20 text-blue-600"
        onClick={() => onMetricClick('students')}
        isActive={activeTab === 'students'}
      />

      {/* Complaints Metric */}
      <MetricCard
        label="Complaints"
        value={metrics.complaints.total}
        description={`${metrics.complaints.pending} Pending`}
        icon={metricIcons.complaints}
        tone="bg-orange-50 dark:bg-orange-950/20 text-orange-600"
        onClick={() => onMetricClick('complaints')}
        isActive={activeTab === 'complaints'}
      />

      {/* Fees Metric */}
      <MetricCard
        label="Fees"
        value={metrics.fees ?  `${(metrics.fees as any).pending || 0}` : "0"}
        description="Pending Review"
        icon={metricIcons.fees}
        tone="bg-green-50 dark:bg-green-950/20 text-green-600"
        onClick={() => onMetricClick('fees')}
        isActive={activeTab === 'fees'}
      />

      {/* Mess Feedback Metric */}
      <MetricCard
        label="Mess Feedback"
        value={metrics.messFeedback?.total || 0}
        description={`Avg: ${metrics.messFeedback?.avgRating.toFixed(1) || 0}⭐`}
        icon={metricIcons.mess}
        tone="bg-purple-50 dark:bg-purple-950/20 text-purple-600"
        onClick={() => onMetricClick('mess')}
        isActive={activeTab === 'mess'}
      />
    </div>
  );
}
