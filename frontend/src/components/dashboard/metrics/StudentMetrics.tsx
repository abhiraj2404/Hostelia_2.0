import { MetricCard } from "./MetricCard";
import { metricIcons } from "@/components/dashboard/utils/dashboardConstants";
import type { DashboardMetrics } from "@/types/dashboard";

interface StudentMetricsProps {
  metrics: DashboardMetrics;
}

export function StudentMetrics({ metrics }: StudentMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {/* Total Complaints Metric */}
      <MetricCard
        label="Total"
        value={metrics.complaints.total}
        description="Complaints"
        icon={metricIcons.complaints}
        tone="bg-blue-50 dark:bg-blue-950/20 text-blue-600"
      />

      {/* Fee Status Metric */}
      <MetricCard
        label="Fees"
        value={`${metrics.fees.hostelFee.status === "accepted" && metrics.fees.messFee.status === "accepted" ? "Complete" : "Pending"}`}
        description="Fee Submission"
        icon={metricIcons.fees}
        tone={
          metrics.fees.hostelFee.status === "accepted" && metrics.fees.messFee.status === "accepted"
            ? "bg-green-50 dark:bg-green-950/20 text-green-600"
            : "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600"
        }
      />

      {/* Complaint Status Breakdown */}
      <MetricCard
        label="Status"
        value={`${metrics.complaints.pending}/${metrics.complaints.resolved}/${metrics.complaints.rejected}`}
        description="Pending/Resolved/Rejected"
        icon={metricIcons.complaints}
        tone="bg-purple-50 dark:bg-purple-950/20 text-purple-600"
      />
    </div>
  );
}
