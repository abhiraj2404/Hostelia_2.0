import { FeesAnalytics } from "@/components/dashboard/detailed-views/FeesDetailedView/FeesAnalytics";
import type { FeesFilters, FeeSubmission } from "@/types/dashboard";

interface FeeAnalyticsContainerProps {
  fees: FeeSubmission[];
  filters: FeesFilters;
}

export function FeeAnalyticsContainer({
  fees,
  filters,
}: FeeAnalyticsContainerProps) {
  return <FeesAnalytics fees={fees} filters={filters} />;
}

