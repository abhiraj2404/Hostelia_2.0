import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { ComplaintEmptyState } from "@/components/complaints/ComplaintEmptyState";
import { ComplaintFilterBar } from "@/components/complaints/ComplaintFilterBar";
import { ComplaintGrid } from "@/components/complaints/ComplaintGrid";
import { ComplaintMetrics } from "@/components/complaints/ComplaintMetrics";
import {
  complaintCategoryOptions,
  complaintStatusOptions,
  createComplaintMetrics,
} from "@/components/complaints/complaintConstants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchComplaints,
  selectComplaintsState,
  setFilters,
  clearError,
} from "@/features/complaints/complaintsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";

function ComplaintsListPage() {
  const dispatch = useAppDispatch();
  const { items, listStatus, filters, error } = useAppSelector(
    selectComplaintsState
  );
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = user?.role;
  const isStudent = role === "student";
  const isWarden = role === "warden";
  const isAdmin = role === "admin";

  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Clear any previous errors and toasts on component mount
  useEffect(() => {
    dispatch(clearError());
    toast.dismiss();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch all complaints without query parameter - filtering happens client-side
      dispatch(fetchComplaints(filters));
    }
  }, [dispatch, isAuthenticated, filters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const statusCounts = useMemo(() => {
    // Count all items regardless of filters for metrics
    const pending = items.filter((c) => c.status === "Pending").length;
    const resolved = items.filter((c) => c.status === "Resolved").length;
    const awaiting = items.filter((c) => c.status === "ToBeConfirmed").length;
    const rejected = items.filter((c) => c.status === "Rejected").length;
    return {
      total: items.length,
      pending,
      resolved,
      awaiting,
      rejected,
    };
  }, [items]);

  const metrics = useMemo(
    () => createComplaintMetrics(statusCounts),
    [statusCounts]
  );

  const hasActiveFilters = Boolean(
    filters.status || filters.category || filters.hostel || filters.query
  );

  const visibleItems = useMemo(() => {
    let filtered = [...items];

    // 1. Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(
        (complaint) => complaint.status === filters.status
      );
    }

    // 2. Apply category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (complaint) => complaint.category === filters.category
      );
    }

    // 3. Apply hostel filter (admin only)
    if (isAdmin && filters.hostel && filters.hostel !== "all") {
      filtered = filtered.filter(
        (complaint) => complaint.hostel === filters.hostel
      );
    }

    // 4. Sort by date
    const sorted = filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  }, [items, filters.status, filters.category, filters.hostel, isAdmin, sort]);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return visibleItems.slice(startIndex, startIndex + limit);
  }, [visibleItems, page, limit]);

  const totalPages = Math.ceil(visibleItems.length / limit);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.category, filters.hostel, filters.query]);

  const createPath = "/complaints/new";
  const detailPath = (id: string) => `/complaints/${id}`;

  const updateFilter = (patch: Partial<typeof filters>) => {
    if (!isAdmin && patch.hostel !== undefined) {
      return;
    }
    dispatch(setFilters({ ...filters, ...patch }));
  };

  const handleQueryChange = (value: string) => {
    const trimmed = value.trim();
    dispatch(
      setFilters({
        ...filters,
        query: trimmed.length ? trimmed : undefined,
      })
    );
  };

  const clearFilters = () => {
    dispatch(
      setFilters({
        status: undefined,
        category: undefined,
        query: undefined,
        ...(isAdmin ? { hostel: undefined } : {}),
      })
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Complaint Management
            </h1>
            <p className="text-muted-foreground">
              Monitor, filter, and track every maintenance request in your
              block.
            </p>
            {(isStudent || isWarden) && user?.hostel && (
              <p className="text-xs text-muted-foreground">
                Assigned hostel: {user.hostel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => dispatch(fetchComplaints(filters))}
              disabled={listStatus === "loading"}
            >
              <RefreshCw
                className={cn(
                  "mr-2 h-4 w-4",
                  listStatus === "loading" && "animate-spin"
                )}
              />
              Refresh
            </Button>
            {isStudent && (
              <Button asChild>
                <Link to={createPath}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Complaint
                </Link>
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="border-destructive/40 bg-destructive/10">
            <CardContent className="flex items-center gap-3 py-3 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        <ComplaintMetrics metrics={metrics} />

        <ComplaintFilterBar
          query={filters.query ?? ""}
          onQueryChange={handleQueryChange}
          status={filters.status}
          category={filters.category}
          hostel={filters.hostel}
          sort={sort}
          onStatusChange={(value) => updateFilter({ status: value })}
          onCategoryChange={(value) => updateFilter({ category: value })}
          onHostelChange={(value) => updateFilter({ hostel: value })}
          onSortChange={setSort}
          onClear={clearFilters}
          listStatus={listStatus}
          statusOptions={complaintStatusOptions}
          categoryOptions={complaintCategoryOptions}
          showHostelFilter={isAdmin}
        />

        {listStatus === "loading" && items.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-[320px] animate-pulse rounded-2xl border border-border/60 bg-muted/20"
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <ComplaintEmptyState
            hasActiveFilters={hasActiveFilters}
            isStudent={isStudent}
            createPath={createPath}
          />
        ) : (
          <>
            <ComplaintGrid
              complaints={paginatedItems}
              detailPath={detailPath}
            />

            {/* Pagination Controls */}
            {visibleItems.length > limit && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, visibleItems.length)} of{" "}
                  {visibleItems.length} complaints
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ComplaintsListPage;
