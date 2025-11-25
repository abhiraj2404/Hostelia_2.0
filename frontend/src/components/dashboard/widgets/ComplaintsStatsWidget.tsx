import { metricIcons } from "@/components/dashboard/utils/dashboardConstants";
import { MetricCard } from "@/components/dashboard/metrics/MetricCard";
import type { DashboardMetrics } from "@/types/dashboard";

interface ComplaintsStatsWidgetProps {
  metrics: DashboardMetrics["complaints"];
}

export function ComplaintsStatsWidget({ metrics }: ComplaintsStatsWidgetProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Complaints */}
      <MetricCard
        label="Total"
        value={metrics.total}
        description="Complaints"
        icon={metricIcons.complaints}
        tone="bg-blue-50 dark:bg-blue-950/20 text-blue-600"
      />

      {/* Under Review (Pending) */}
      <MetricCard
        label="Under Review"
        value={metrics.pending}
        description="Pending"
        icon={metricIcons.complaints}
        tone="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600"
      />

      {/* Student Verification (ToBeConfirmed) */}
      <MetricCard
        label="Verification"
        value={metrics.total - metrics.pending - metrics.resolved - metrics.rejected}
        description="Student Action"
        icon={metricIcons.complaints}
        tone="bg-orange-50 dark:bg-orange-950/20 text-orange-600"
      />

      {/* Completed (Resolved) */}
      <MetricCard
        label="Completed"
        value={metrics.resolved}
        description="Resolved"
        icon={metricIcons.complaints}
        tone="bg-green-50 dark:bg-green-950/20 text-green-600"
      />
    </div>
  );
}
