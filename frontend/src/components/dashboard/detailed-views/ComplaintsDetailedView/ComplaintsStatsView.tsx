import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutList, BarChart3 } from "lucide-react";
import type { Complaint } from "@/features/complaints/complaintsSlice";
import type { ComplaintsFilters } from "@/types/dashboard";
import { ComplaintsList } from "./ComplaintsList";
import { ComplaintsAnalytics } from "./ComplaintsAnalytics";

interface ComplaintsStatsViewProps {
  complaints: Complaint[];
  filters: ComplaintsFilters;
  onFiltersChange: (filters: ComplaintsFilters) => void;
  loading?: boolean;
  isWarden?: boolean;
}

type TabType = 'list' | 'analytics';

export function ComplaintsStatsView({
  complaints,
  filters,
  onFiltersChange,
  loading = false,
  isWarden = false,
}: ComplaintsStatsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  // Client-side filtering
  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    // Filter by hostel (for admin)
    if (filters.hostel && filters.hostel !== 'all') {
      result = result.filter(c => c.hostel === filters.hostel);
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(c => c.category === filters.category);
    }

    return result;
  }, [complaints, filters]);

  return (
    <div className="space-y-6">
      {/* Controls Header: Filters & Tabs */}
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
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="ToBeConfirmed">To Be Confirmed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Plumbing">Plumbing</SelectItem>
              <SelectItem value="Painting">Painting</SelectItem>
              <SelectItem value="Carpentry">Carpentry</SelectItem>
              <SelectItem value="Cleaning">Cleaning</SelectItem>
              <SelectItem value="Internet">Internet</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Pest Control">Pest Control</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          {(filters.hostel || filters.status || filters.category) && (
            <Button
              variant="ghost"
              onClick={() => onFiltersChange({})}
            >
              Clear
            </Button>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex items-center rounded-lg border bg-muted p-1">
          <Button
            variant={activeTab === 'list' ? 'default' : 'ghost'}
            size="sm"
            className={`gap-2 ${activeTab === 'list' ? 'bg-black hover:bg-black text-white' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <LayoutList className="h-4 w-4" />
            List
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            className={`gap-2 ${activeTab === 'analytics' ? 'bg-black hover:bg-black text-white' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px] flex flex-col">
        {activeTab === 'list' && (
          <ComplaintsList 
            complaints={filteredComplaints} 
            loading={loading}
            isWarden={isWarden}
          />
        )}

        {activeTab === 'analytics' && (
          <ComplaintsAnalytics complaints={filteredComplaints} />
        )}
      </div>
    </div>
  );
}

