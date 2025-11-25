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
import type { Student, StudentsFilters } from "@/types/dashboard";
import { StudentsList } from "./StudentsList";

interface StudentsStatsViewProps {
  students: Student[];
  filters: StudentsFilters;
  onFiltersChange: (filters: StudentsFilters) => void;
  loading?: boolean;
  pagination?: { page: number; total: number; limit: number };
  onPageChange?: (page: number) => void;
  isWarden?: boolean;
}

export function StudentsStatsView({
  students,
  filters,
  onFiltersChange,
  loading = false,
  pagination,
  onPageChange,
  isWarden = false,
}: StudentsStatsViewProps) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className="space-y-4">
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

        <Input
          placeholder="Search by name, email, or roll number..."
          value={filters.query || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, query: e.target.value || undefined })
          }
          className="w-[300px]"
        />

        <Select
          value={filters.year || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, year: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="UG-1">UG-1</SelectItem>
            <SelectItem value="UG-2">UG-2</SelectItem>
            <SelectItem value="UG-3">UG-3</SelectItem>
            <SelectItem value="UG-4">UG-4</SelectItem>
          </SelectContent>
        </Select>

        {(filters.hostel || filters.query || filters.year) && (
          <Button
            variant="ghost"
            onClick={() => onFiltersChange({})}
          >
            Clear
          </Button>
        )}
      </div>

      {/* List */}
      <StudentsList students={students} loading={loading} isWarden={isWarden} />

      {/* Pagination Controls */}
      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} students
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


