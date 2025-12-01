import { ComplaintsStatsView } from "@/components/dashboard/detailed-views/ComplaintsDetailedView/ComplaintsStatsView";
import { DetailedViewPanel } from "@/components/dashboard/detailed-views/DetailedViewPanel";
import { FeesStatsView } from "@/components/dashboard/detailed-views/FeesDetailedView/FeesStatsView";
import { MessStatsView } from "@/components/dashboard/detailed-views/MessDetailedView/MessStatsView";
import { StudentsStatsView } from "@/components/dashboard/detailed-views/StudentsDetailedView/StudentsStatsView";
import { WardensStatsView } from "@/components/dashboard/detailed-views/WardensDetailedView";
import { UsersStatsView } from "@/components/dashboard/detailed-views/UsersDetailedView";
import { AdminMetrics } from "@/components/dashboard/metrics/AdminMetrics";
import { UserProfileCard } from "@/components/dashboard/profile/UserProfileCard";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { Button } from "@/components/ui/button";
import {
  fetchAdminDashboardData,
  fetchDetailedComplaints,
  fetchDetailedFees,
  fetchDetailedMessFeedback,
  fetchDetailedStudents,
  fetchDetailedWardens,
  selectDashboardMetrics,
  selectDashboardState,
  selectDetailedComplaints,
  selectDetailedFees,
  selectDetailedMessFeedback,
  selectDetailedStudents,
  selectDetailedView,
  selectDetailedWardens,
  setActiveTab,
  setComplaintsFilters,
  setDetailedViewExpanded,
  setFeesFilters,
  setMessFilters,
  setStudentsFilters,
  setStudentsPage,
  setWardensFilters,
  setWardensPage,
  toggleDetailedView,
} from "@/features/dashboard/dashboardSlice";
import {
  createWarden,
  deleteUser,
  fetchStudents,
  fetchWardens,
  selectUsersState,
  setStudentsFilters as setUsersStudentsFilters,
  setStudentsPage as setUsersStudentsPage,
  updateUser,
} from "@/features/users";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";
import { sortByNameCaseInsensitive } from "@/utils/sorting";
import type { DetailedTab } from "@/types/dashboard";
import type {
  Student,
  UserManagementFilters,
  Warden,
  WardenCreateData,
} from "@/types/users";
import {
  Bell,
  DollarSign,
  FileText,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(selectDashboardState);
  const metrics = useAppSelector(selectDashboardMetrics);
  const detailedView = useAppSelector(selectDetailedView);
  const complaintsState = useAppSelector(selectDetailedComplaints);
  const studentsState = useAppSelector(selectDetailedStudents);
  const feesState = useAppSelector(selectDetailedFees);
  const messState = useAppSelector(selectDetailedMessFeedback);
  const wardensState = useAppSelector(selectDetailedWardens);
  const usersState = useAppSelector(selectUsersState);

  // Fetch initial dashboard data (all hostels)
  useEffect(() => {
    dispatch(fetchAdminDashboardData());
    // Fetch first tab data (students) and set as default
    dispatch(fetchDetailedStudents({ page: 1 }));
    dispatch(setActiveTab("students"));
    dispatch(setDetailedViewExpanded(true));
    // Fetch users data for user management tab
    dispatch(fetchStudents());
    dispatch(fetchWardens());
    // Fetch wardens data for wardens tab
    dispatch(fetchDetailedWardens({ page: 1 }));
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
      case "complaints":
        dispatch(
          fetchDetailedComplaints({
            page: complaintsState.pagination.page,
            filters: complaintsState.filters,
          })
        );
        break;
      case "students":
        dispatch(
          fetchDetailedStudents({
            page: studentsState.pagination.page,
            filters: studentsState.filters,
          })
        );
        break;
      case "fees":
        dispatch(
          fetchDetailedFees({
            page: feesState.pagination.page,
            filters: feesState.filters,
          })
        );
        break;
      case "mess":
        dispatch(
          fetchDetailedMessFeedback({
            page: messState.pagination.page,
            filters: messState.filters,
          })
        );
        break;
      case "wardens":
        dispatch(
          fetchDetailedWardens({
            page: wardensState.pagination.page,
            filters: wardensState.filters,
          })
        );
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
      case "complaints":
        dispatch(
          fetchDetailedComplaints({
            page: complaintsState.pagination.page,
            filters: complaintsState.filters,
          })
        );
        break;
      case "students":
        dispatch(
          fetchDetailedStudents({
            page: studentsState.pagination.page,
            filters: studentsState.filters,
          })
        );
        break;
      case "fees":
        dispatch(
          fetchDetailedFees({
            page: feesState.pagination.page,
            filters: feesState.filters,
          })
        );
        break;
      case "mess":
        dispatch(
          fetchDetailedMessFeedback({
            page: messState.pagination.page,
            filters: messState.filters,
          })
        );
        break;
      case "wardens":
        dispatch(
          fetchDetailedWardens({
            page: wardensState.pagination.page,
            filters: wardensState.filters,
          })
        );
        break;
    }
  };

  // User management handlers
  const handleUpdateStudent = async (
    userId: string,
    data: Partial<Student>
  ) => {
    try {
      const action = await dispatch(updateUser({ userId, data }));
      if (updateUser.fulfilled.match(action)) {
        toast.success("Student updated successfully");
        dispatch(fetchStudents());
      } else {
        const errorMessage = action.payload || "Failed to update student";
        if (
          errorMessage.includes("403") ||
          errorMessage.includes("Forbidden")
        ) {
          toast.error(
            "You don't have permission to update this student. Only admins can update students from all hostels."
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch {
      toast.error("An unexpected error occurred while updating the student.");
    }
  };

  const handleUpdateWarden = async (userId: string, data: Partial<Warden>) => {
    try {
    const action = await dispatch(updateUser({ userId, data }));
    if (updateUser.fulfilled.match(action)) {
      toast.success("Warden updated successfully");
      dispatch(fetchWardens());
    } else {
        const errorMessage = action.payload || "Failed to update warden";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while updating the warden.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteStudent = async (userId: string) => {
    const action = await dispatch(deleteUser(userId));
    if (deleteUser.fulfilled.match(action)) {
      toast.success("Student deleted successfully");
      dispatch(fetchStudents());
    } else {
      toast.error(action.payload || "Failed to delete student");
    }
  };

  const handleDeleteWarden = async (userId: string) => {
    const action = await dispatch(deleteUser(userId));
    if (deleteUser.fulfilled.match(action)) {
      toast.success("Warden deleted successfully");
      dispatch(fetchWardens());
    } else {
      toast.error(action.payload || "Failed to delete warden");
    }
  };

  const handleCreateWarden = async (data: WardenCreateData) => {
    const action = await dispatch(createWarden(data));
    if (createWarden.fulfilled.match(action)) {
      toast.success("Warden created successfully");
      dispatch(fetchWardens());
    } else {
      toast.error(action.payload || "Failed to create warden");
    }
  };

  // Client-side filtering and pagination for students
  const filteredStudents = useMemo(() => {
    let result = [...studentsState.items];

    // 1. Filter by Hostel
    if (
      studentsState.filters.hostel &&
      studentsState.filters.hostel !== "all"
    ) {
      result = result.filter((s) => s.hostel === studentsState.filters.hostel);
    }

    // 2. Filter by Search
    if (studentsState.filters.query) {
      const query = studentsState.filters.query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          (s.rollNo && s.rollNo.toLowerCase().includes(query))
      );
    }

    // 3. Filter by Year
    if (studentsState.filters.year && studentsState.filters.year !== "all") {
      result = result.filter((s) => s.year === studentsState.filters.year);
    }

    // Sort case-insensitively by name
    return sortByNameCaseInsensitive(result);
  }, [studentsState.items, studentsState.filters]);

  const paginatedStudents = useMemo(() => {
    const page = studentsState.pagination.page;
    const limit = studentsState.pagination.limit;
    const startIndex = (page - 1) * limit;
    return filteredStudents.slice(startIndex, startIndex + limit);
  }, [filteredStudents, studentsState.pagination]);

  // Client-side filtering and pagination for wardens
  const filteredWardens = useMemo(() => {
    let result = [...wardensState.items];

    // Filter by Hostel
    if (
      wardensState.filters.hostel &&
      wardensState.filters.hostel !== "all"
    ) {
      result = result.filter((w) => w.hostel === wardensState.filters.hostel);
    }

    // Filter by Search
    if (wardensState.filters.query) {
      const query = wardensState.filters.query.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.email.toLowerCase().includes(query)
      );
    }

    // Sort case-insensitively by name
    return sortByNameCaseInsensitive(result);
  }, [wardensState.items, wardensState.filters]);

  const paginatedWardens = useMemo(() => {
    const page = wardensState.pagination.page;
    const limit = wardensState.pagination.limit;
    const startIndex = (page - 1) * limit;
    return filteredWardens.slice(startIndex, startIndex + limit);
  }, [filteredWardens, wardensState.pagination]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all hostel operations</p>
        </div>
        <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={() => navigate("/users")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
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
              showUsersTab={false}
              showWardensTab={true}
            >
              {detailedView.activeTab === "complaints" && (
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

              {detailedView.activeTab === "students" && (
                <StudentsStatsView
                  students={paginatedStudents}
                  filters={studentsState.filters}
                  onFiltersChange={(filters) => {
                    dispatch(setStudentsFilters(filters));
                  }}
                  loading={studentsState.loading}
                  pagination={{
                    ...studentsState.pagination,
                    total: filteredStudents.length,
                  }}
                  onPageChange={(page) => {
                    dispatch(setStudentsPage(page));
                  }}
                  isWarden={false}
                />
              )}

              {detailedView.activeTab === "fees" && (
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

              {detailedView.activeTab === "mess" && (
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

              {detailedView.activeTab === "users" && (
                <UsersStatsView
                  students={usersState.students}
                  wardens={usersState.wardens}
                  studentsFilters={usersState.studentsFilters}
                  wardensFilters={usersState.wardensFilters}
                  onStudentsFiltersChange={(filters: UserManagementFilters) => {
                    dispatch(setUsersStudentsFilters(filters));
                  }}
                  onWardensFiltersChange={(filters: UserManagementFilters) => {
                    dispatch(setWardensFilters(filters));
                  }}
                  onUpdateStudent={handleUpdateStudent}
                  onUpdateWarden={handleUpdateWarden}
                  onDeleteStudent={handleDeleteStudent}
                  onDeleteWarden={handleDeleteWarden}
                  onCreateWarden={handleCreateWarden}
                  studentsLoading={usersState.studentsLoading}
                  wardensLoading={usersState.wardensLoading}
                  studentsPagination={usersState.studentsPagination}
                  wardensPagination={usersState.wardensPagination}
                  onStudentsPageChange={(page: number) => {
                    dispatch(setUsersStudentsPage(page));
                  }}
                  onWardensPageChange={(page: number) => {
                    dispatch(setWardensPage(page));
                  }}
                  isWarden={false}
                  updateLoading={usersState.updateLoading}
                  deleteLoading={usersState.deleteLoading}
                  createWardenLoading={usersState.createWardenLoading}
                />
              )}

              {detailedView.activeTab === "wardens" && (
                <WardensStatsView
                  wardens={paginatedWardens}
                  filters={wardensState.filters}
                  onFiltersChange={(filters) => {
                    dispatch(setWardensFilters(filters));
                  }}
                  loading={wardensState.loading}
                  pagination={{
                    ...wardensState.pagination,
                    total: filteredWardens.length,
                  }}
                  onPageChange={(page) => {
                    dispatch(setWardensPage(page));
                  }}
                />
              )}
            </DetailedViewPanel>
          )}
        </>
      ) : null}
    </div>
  );
}
