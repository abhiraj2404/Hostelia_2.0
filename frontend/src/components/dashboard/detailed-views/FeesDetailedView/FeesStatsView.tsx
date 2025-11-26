import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutList, BarChart3 } from "lucide-react";
import type { FeeSubmission, FeesFilters, Student } from "@/types/dashboard";
import { FeesList } from "./FeesList";
import { FeesAnalytics } from "./FeesAnalytics";
import { apiClient } from "@/lib/api-client";

interface FeesStatsViewProps {
  fees: FeeSubmission[];
  filters: FeesFilters;
  onFiltersChange: (filters: FeesFilters) => void;
  loading?: boolean;
  isWarden?: boolean;
  students?: Student[];
}

type TabType = 'list' | 'analytics';

export function FeesStatsView({
  fees,
  filters,
  onFiltersChange,
  loading = false,
  isWarden = false,
  students = [],
}: FeesStatsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [emailToHostel, setEmailToHostel] = useState<Record<string, string>>({});

  // Fetch students to create email-to-hostel mapping
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient.get('/user/students/all');
        const students: Student[] = res.data.students || [];
        
        // Create mapping from email to hostel
        const mapping: Record<string, string> = {};
        students.forEach(student => {
          if (student.email && student.hostel) {
            mapping[student.email] = student.hostel;
          }
        });
        
        setEmailToHostel(mapping);
      } catch (error) {
        console.error('Failed to fetch students for hostel mapping:', error);
      }
    };

    fetchStudents();
  }, []);

  // Reset fee type and status filters when switching to analytics view
  useEffect(() => {
    if (activeTab === 'analytics') {
      const needsReset = filters.feeType || filters.status;
      if (needsReset) {
        onFiltersChange({ 
          ...filters, 
          feeType: undefined,
          status: undefined 
        });
      }
    }
  }, [activeTab]); // Only depend on activeTab to avoid infinite loops

  // Client-side filtering - Fixed to handle both filters properly
  const filteredFees = useMemo(() => {
    let result = [...fees];

    // For wardens: Filter by student emails from their hostel
    if (isWarden && students.length > 0) {
      const hostelStudentEmails = new Set(students.map(s => s.email));
      result = result.filter(f => hostelStudentEmails.has(f.studentEmail));
    }

    // For admins: Filter by hostel using emailToHostel mapping
    if (!isWarden && filters.hostel && filters.hostel !== 'all') {
      result = result.filter(f => emailToHostel[f.studentEmail] === filters.hostel);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter(f => 
        f.hostelFee.status === filters.status || f.messFee.status === filters.status
      );
    }

    // Apply fee type filter
    if (filters.feeType && filters.feeType !== 'all') {
      result = result.filter(f => {
        if (filters.feeType === 'hostel') {
          // Show only if hostel fee matches the status filter (or no status filter)
          if (filters.status && filters.status !== 'all') {
            return f.hostelFee.status === filters.status;
          }
          return f.hostelFee.status !== 'documentNotSubmitted';
        } else if (filters.feeType === 'mess') {
          // Show only if mess fee matches the status filter (or no status filter)
          if (filters.status && filters.status !== 'all') {
            return f.messFee.status === filters.status;
          }
          return f.messFee.status !== 'documentNotSubmitted';
        }
        return true;
      });
    }

    return result;
  }, [fees, filters, isWarden, students, emailToHostel]);

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

          {/* Fee Type Filter - Only show in list view */}
          {activeTab === 'list' && (
            <Select
              value={filters.feeType || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, feeType: value === 'all' ? undefined : value })
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
          )}

          {/* Status Filter - Only show in list view */}
          {activeTab === 'list' && (
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="documentNotSubmitted">Not Submitted</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Clear Filters Button */}
          {(() => {
            const hasListFilters = activeTab === 'list' && (filters.feeType || filters.status);
            const hasHostelFilter = filters.hostel;
            return (hasListFilters || hasHostelFilter) && (
              <Button
                variant="ghost"
                onClick={() => onFiltersChange({})}
              >
                Clear
              </Button>
            );
          })()}
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
          <FeesList 
            fees={filteredFees} 
            loading={loading}
            emailToHostel={emailToHostel}
            isWarden={isWarden}
          />
        )}

        {activeTab === 'analytics' && (
          <FeesAnalytics fees={filteredFees} filters={filters} />
        )}
      </div>
    </div>
  );
}
