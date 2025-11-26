import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  fetchStudentDashboardData,
  selectDashboardState,
  selectDashboardMetrics,
  selectRecentComplaints,
  selectRecentAnnouncements,
  selectMessMenu,
} from "@/features/dashboard/dashboardSlice";
import { UserProfileCard } from "@/components/dashboard/profile/UserProfileCard";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { ComplaintsStatsWidget } from "@/components/dashboard/widgets/ComplaintsStatsWidget";
import { ComplaintsWidget } from "@/components/dashboard/widgets/ComplaintsWidget";
import { AnnouncementsWidget } from "@/components/dashboard/widgets/AnnouncementsWidget";
import { FeeStatusWidget } from "@/components/dashboard/widgets/FeeStatusWidget";
import { MessMenuWidget } from "@/components/dashboard/widgets/MessMenuWidget";
import { studentQuickActions } from "@/components/dashboard/utils/dashboardConstants";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudentDashboardLayout() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectDashboardState);
  const metrics = useAppSelector(selectDashboardMetrics);
  const recentComplaints = useAppSelector(selectRecentComplaints);
  const recentAnnouncements = useAppSelector(selectRecentAnnouncements);
  const messMenu = useAppSelector(selectMessMenu);

  useEffect(() => {
    dispatch(fetchStudentDashboardData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchStudentDashboardData());
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard
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
          {/* User Profile */}
          <UserProfileCard />

          {/* Quick Actions */}
          <QuickActionsWidget actions={studentQuickActions} />

          {/* Top Row: Fee Status + Announcements (2:3 ratio) */}
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <FeeStatusWidget fees={metrics.fees} />
            </div>
            <div className="lg:col-span-3">
              <AnnouncementsWidget announcements={recentAnnouncements.slice(0, 2)} />
            </div>
          </div>

          {/* Complaints Stats Row */}
          <ComplaintsStatsWidget metrics={metrics.complaints} />

          {/* Bottom Row: Recent Complaints (2) + Mess Menu - 2:1 ratio */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ComplaintsWidget complaints={recentComplaints.slice(0, 2)} />
            </div>
            <div>
              <MessMenuWidget menu={messMenu} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
