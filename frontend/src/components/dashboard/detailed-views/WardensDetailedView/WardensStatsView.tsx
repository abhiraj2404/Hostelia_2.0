import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Warden, WardenFilters } from "@/types/dashboard";
import { WardensList } from "./WardensList";

interface WardensStatsViewProps {
  wardens: Warden[];
  filters: WardenFilters;
  onFiltersChange: (filters: WardenFilters) => void;
  loading?: boolean;
  pagination?: { page: number; total: number; limit: number };
  onPageChange?: (page: number) => void;
}

export function WardensStatsView({
  wardens,
  filters,
  onFiltersChange,
  loading = false,
  pagination,
  onPageChange,
}: WardensStatsViewProps) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className="space-y-4 flex flex-col min-h-[550px]">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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

        <Input
          placeholder="Search by name or email..."
          value={filters.query || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, query: e.target.value || undefined })
          }
          className="w-[300px]"
        />

        {(filters.hostel || filters.query) && (
          <Button
            variant="ghost"
            onClick={() => onFiltersChange({})}
          >
            Clear
          </Button>
        )}
      </div>

      {/* List */}
      <div className="flex-1">
        <WardensList wardens={wardens} loading={loading} />
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between px-2 pt-4 mt-auto">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * (pagination?.limit || 10)) + 1} to {Math.min(currentPage * (pagination?.limit || 10), pagination?.total || 0)} of {pagination?.total || 0} wardens
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
