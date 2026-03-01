import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FeesFilters } from "@/types/dashboard";
import { useHostels } from "@/hooks/useHostels";

interface FeeFiltersBarProps {
  filters: FeesFilters;
  userRole: "collegeAdmin" | "warden";
  userHostel?: string;
  onFiltersChange: (filters: FeesFilters) => void;
}

export function FeeFiltersBar({
  filters,
  userRole,
  userHostel,
  onFiltersChange,
}: FeeFiltersBarProps) {
  const { hostels } = useHostels();
  const hasActiveFilters =
    filters.hostel || filters.feeType || filters.status;

  const handleClearFilters = () => {
    onFiltersChange({
      hostel: userRole === "collegeAdmin" ? undefined : userHostel,
      feeType: undefined,
      status: undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {userRole === "collegeAdmin" && (
        <Select
          value={filters.hostel || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              hostel: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Hostel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {hostels.map((h) => (
              <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={filters.feeType || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            feeType: value === "all" ? undefined : value,
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Fee Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="hostel">Hostel Fee</SelectItem>
          <SelectItem value="mess">Mess Fee</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            status: value === "all" ? undefined : value,
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="documentNotSubmitted">Not Submitted</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClearFilters}>
          Clear
        </Button>
      )}
    </div>
  );
}

