import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  fetchAdminDashboardData,
  fetchDetailedComplaints,
  fetchDetailedStudents,
  fetchDetailedFees,
  fetchDetailedMessFeedback,
  selectDashboardState,
  selectDashboardMetrics,
  selectDetailedView,
  selectDetailedComplaints,
  selectDetailedStudents,
  selectDetailedFees,
  selectDetailedMessFeedback,
  setActiveTab,
  setComplaintsFilters,
  setStudentsFilters,
  setFeesFilters,
  setMessFilters,
  setStudentsPage,
  toggleDetailedView,
  setDetailedViewExpanded,
} from "@/features/dashboard/dashboardSlice";
import { UserProfileCard } from "@/components/dashboard/profile/UserProfileCard";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { AdminMetrics } from "@/components/dashboard/metrics/AdminMetrics";
import { DetailedViewPanel } from "@/components/dashboard/detailed-views/DetailedViewPanel";
import { ComplaintsStatsView } from "@/components/dashboard/detailed-views/ComplaintsDetailedView/ComplaintsStatsView";
import { StudentsStatsView } from "@/components/dashboard/detailed-views/StudentsDetailedView/StudentsStatsView";
import { FeesStatsView } from "@/components/dashboard/detailed-views/FeesDetailedView/FeesStatsView";
import { MessStatsView } from "@/components/dashboard/detailed-views/MessDetailedView/MessStatsView";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bell, FileText, MessageSquare, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetailedTab } from "@/types/dashboard";

// Admin quick actions
const adminQuickActions = [
  {
    label: "Create Announcement",
    path: "/announcements",
    icon: Bell,
  },
  {
    label: "Review Complaints",
    path: "/complaints",
    icon: FileText,
  },
  {
    label: "Fee Management",
    path: "/fees",
    icon: DollarSign,
  },
  {
    label: "Check Feedback",
    path: "/mess",
    icon: MessageSquare,
  },
];

export function AdminDashboardLayout() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectDashboardState);
  const metrics = useAppSelector(selectDashboardMetrics);
  const detailedView = useAppSelector(selectDetailedView);
  const complaintsState = useAppSelector(selectDetailedComplaints);
  const studentsState = useAppSelector(selectDetailedStudents);
  const feesState = useAppSelector(selectDetailedFees);
  const messState = useAppSelector(selectDetailedMessFeedback);

  // Fetch initial dashboard data (all hostels)
  useEffect(() => {
    dispatch(fetchAdminDashboardData());
    // Fetch first tab data (students) and set as default
    dispatch(fetchDetailedStudents({ page: 1 }));
    dispatch(setActiveTab('students'));
    dispatch(setDetailedViewExpanded(true));
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (tab: DetailedTab) => {
    dispatch(setActiveTab(tab));
    
    // Fetch data for the selected tab if not already expanded
    if (!detailedView.isExpanded) {
      dispatch(toggleDetailedView());
    }
    
    // Fetch data based on tab
    switch (tab) {
      case 'complaints':
        dispatch(fetchDetailedComplaints({ 
          page: complaintsState.pagination.page,
          filters: complaintsState.filters
        }));
        break;
      case 'students':
        dispatch(fetchDetailedStudents({ 
          page: studentsState.pagination.page,
          filters: studentsState.filters
        }));
        break;
      case 'fees':
        dispatch(fetchDetailedFees({ 
          page: feesState.pagination.page,
          filters: feesState.filters
        }));
        break;
      case 'mess':
        dispatch(fetchDetailedMessFeedback({ 
          page: messState.pagination.page,
          filters: messState.filters
        }));
        break;
    }
  };

  // Handle metric click
  const handleMetricClick = (tab: DetailedTab) => {
    handleTabChange(tab);
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchAdminDashboardData());
    
    // Refresh current tab data
    switch (detailedView.activeTab) {
      case 'complaints':
        dispatch(fetchDetailedComplaints({ page: complaintsState.pagination.page, filters: complaintsState.filters }));
        break;
      case 'students':
        dispatch(fetchDetailedStudents({ page: studentsState.pagination.page, filters: studentsState.filters }));
        break;
      case 'fees':
        dispatch(fetchDetailedFees({ page: feesState.pagination.page, filters: feesState.filters }));
        break;
      case 'mess':
        dispatch(fetchDetailedMessFeedback({ page: messState.pagination.page, filters: messState.filters }));
        break;
    }
  };

  // Client-side filtering and pagination for students
  const filteredStudents = useMemo(() => {
    let result = [...studentsState.items];
    
    // 1. Filter by Hostel
    if (studentsState.filters.hostel && studentsState.filters.hostel !== 'all') {
      result = result.filter(s => s.hostel === studentsState.filters.hostel);
    }
    
    // 2. Filter by Search
    if (studentsState.filters.query) {
      const query = studentsState.filters.query.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.email.toLowerCase().includes(query) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(query))
      );
    }
    
    // 3. Filter by Year
    if (studentsState.filters.year && studentsState.filters.year !== 'all') {
      result = result.filter(s => s.year === studentsState.filters.year);
    }
    
    return result;
  }, [studentsState.items, studentsState.filters]);

  const paginatedStudents = useMemo(() => {
    const page = studentsState.pagination.page;
    const limit = studentsState.pagination.limit;
    const startIndex = (page - 1) * limit;
    return filteredStudents.slice(startIndex, startIndex + limit);
  }, [filteredStudents, studentsState.pagination]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all hostel operations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !metrics ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-2xl border border-border/60 bg-muted/20"
            />
          ))}
        </div>
      ) : metrics ? (
        <>
          {/* Profile Card */}
          <UserProfileCard />

          {/* Quick Actions */}
          <QuickActionsWidget actions={adminQuickActions} />

          {/* Metrics */}
          <AdminMetrics
            metrics={metrics}
            activeTab={detailedView.activeTab}
            onMetricClick={handleMetricClick}
          />

          {/* Detailed View Panel */}
          {detailedView.isExpanded && (
            <DetailedViewPanel
              activeTab={detailedView.activeTab}
              onTabChange={handleTabChange}
              onRefresh={handleRefresh}
              loading={loading}
            >
              {detailedView.activeTab === 'complaints' && (
                <ComplaintsStatsView
                  complaints={complaintsState.items}
                  filters={complaintsState.filters}
                  onFiltersChange={(filters) => {
                    dispatch(setComplaintsFilters(filters));
                    dispatch(fetchDetailedComplaints({ page: 1, filters }));
                  }}
                  loading={complaintsState.loading}
                  isWarden={false}
                />
              )}

              {detailedView.activeTab === 'students' && (
                <StudentsStatsView
                  students={paginatedStudents}
                  filters={studentsState.filters}
                  onFiltersChange={(filters) => {
                    dispatch(setStudentsFilters(filters));
                  }}
                  loading={studentsState.loading}
                  pagination={{
                    ...studentsState.pagination,
                    total: filteredStudents.length
                  }}
                  onPageChange={(page) => {
                    dispatch(setStudentsPage(page));
                  }}
                  isWarden={false}
                />
              )}

              {detailedView.activeTab === 'fees' && (
                <FeesStatsView
                  fees={feesState.items}
                  filters={feesState.filters}
                  onFiltersChange={(filters) => {
                    dispatch(setFeesFilters(filters));
                    dispatch(fetchDetailedFees({ page: 1, filters }));
                  }}
                  loading={feesState.loading}
                  isWarden={false}
                />
              )}

              {detailedView.activeTab === 'mess' && (
                <MessStatsView
                  feedback={messState.items}
                  filters={messState.filters}
                  onFiltersChange={(filters) => {
                    dispatch(setMessFilters(filters));
                    dispatch(fetchDetailedMessFeedback({ page: 1, filters }));
                  }}
                  loading={messState.loading}
                  isWarden={false}
                />
              )}
            </DetailedViewPanel>
          )}
        </>
      ) : null}
    </div>
  );
}
