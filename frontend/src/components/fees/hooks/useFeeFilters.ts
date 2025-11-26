import { useMemo } from "react";
import type { FeeSubmission, FeesFilters } from "@/types/dashboard";

interface UseFeeFiltersProps {
  fees: FeeSubmission[];
  filters: FeesFilters;
  userRole: "admin" | "warden";
  userHostel?: string;
  emailToHostel: Record<string, string>;
}

export function useFeeFilters({
  fees,
  filters,
  userRole,
  userHostel,
  emailToHostel,
}: UseFeeFiltersProps) {
  const filteredFees = useMemo(() => {
    let result = [...fees];

    // Warden: Filter by their hostel (client-side)
    if (userRole === "warden" && userHostel) {
      result = result.filter((fee) => {
        const studentHostel = emailToHostel[fee.studentEmail];
        return studentHostel === userHostel;
      });
    }

    // Apply hostel filter
    if (filters.hostel && filters.hostel !== "all") {
      result = result.filter((fee) => {
        const studentHostel = emailToHostel[fee.studentEmail];
        return studentHostel === filters.hostel;
      });
    }

    // Apply fee type filter first
    if (filters.feeType && filters.feeType !== "all") {
      result = result.filter((f) => {
        if (filters.feeType === "hostel") {
          // Show all hostel fees (regardless of status) when status filter is "all"
          // Only filter by status if a specific status is selected
          if (filters.status && filters.status !== "all") {
            return f.hostelFee.status === filters.status;
          }
          // When status is "all", show all hostel fees (including documentNotSubmitted)
          return true;
        } else if (filters.feeType === "mess") {
          // Show all mess fees (regardless of status) when status filter is "all"
          // Only filter by status if a specific status is selected
          if (filters.status && filters.status !== "all") {
            return f.messFee.status === filters.status;
          }
          // When status is "all", show all mess fees (including documentNotSubmitted)
          return true;
        }
        return true;
      });
    } else {
      // No fee type filter - apply status filter to both hostel and mess fees
      if (filters.status && filters.status !== "all") {
        result = result.filter(
          (f) =>
            f.hostelFee.status === filters.status ||
            f.messFee.status === filters.status
        );
      }
    }

    return result;
  }, [fees, userRole, userHostel, filters, emailToHostel]);

  return filteredFees;
}
