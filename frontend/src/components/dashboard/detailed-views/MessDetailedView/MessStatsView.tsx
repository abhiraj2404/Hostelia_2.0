import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { MessFeedback, MessFilters } from "@/types/dashboard";
import { MessAnalytics } from "./MessAnalytics";

interface MessStatsViewProps {
  feedback: MessFeedback[];
  filters: MessFilters;
  onFiltersChange: (filters: MessFilters) => void;
  loading?: boolean;
  isWarden?: boolean;
}

export function MessStatsView({
  feedback,
  filters,
  onFiltersChange,
  loading = false,
  isWarden = false,
}: MessStatsViewProps) {
  // Client-side filtering
  const filteredFeedback = useMemo(() => {
    let result = [...feedback];

    // Filter by hostel (for admin)
    if (filters.hostel && filters.hostel !== 'all') {
      result = result.filter(f => f.studentId?.hostel === filters.hostel);
    }

    if (filters.day && filters.day !== 'all') {
      result = result.filter(f => f.day === filters.day);
    }

    if (filters.mealType && filters.mealType !== 'all') {
      result = result.filter(f => f.mealType === filters.mealType);
    }

    return result;
  }, [feedback, filters]);

  return (
    <div className="space-y-6">
      {/* Controls Header: Filters Only */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {!isWarden && (
            <Select
              value={filters.hostel || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, hostel: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Hostel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hostels</SelectItem>
                <SelectItem value="BH-1">BH-1</SelectItem>
                <SelectItem value="BH-2">BH-2</SelectItem>
                <SelectItem value="BH-3">BH-3</SelectItem>
                <SelectItem value="BH-4">BH-4</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.day || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, day: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              <SelectItem value="Sunday">Sunday</SelectItem>
              <SelectItem value="Monday">Monday</SelectItem>
              <SelectItem value="Tuesday">Tuesday</SelectItem>
              <SelectItem value="Wednesday">Wednesday</SelectItem>
              <SelectItem value="Thursday">Thursday</SelectItem>
              <SelectItem value="Friday">Friday</SelectItem>
              <SelectItem value="Saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.mealType || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, mealType: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Meal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meals</SelectItem>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Snacks">Snacks</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>

          {(filters.hostel || filters.mealType || filters.day) && (
            <Button
              variant="ghost"
              onClick={() => onFiltersChange({})}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content - Always show Analytics */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <MessAnalytics feedback={filteredFeedback} filters={filters} />
        )}
      </div>
    </div>
  );
}
