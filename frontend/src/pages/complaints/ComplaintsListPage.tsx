import { Plus, RefreshCw, XCircle } from "lucide-react";
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

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (isAuthenticated) {
      const extendedFilters = {
        ...filters,
        ...(query && { query }),
      };
      dispatch(fetchComplaints(extendedFilters));
    }
  }, [dispatch, isAuthenticated, filters, query]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const statusCounts = useMemo(() => {
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

  const hasActiveFilters = Boolean(filters.status || filters.category || filters.hostel || query);

  const visibleItems = useMemo(() => {
    // Backend handles search filtering, we only sort here
    const sorted = [...items].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [items, sort]);

  const createPath = "/complaints/new";
  const detailPath = (id: string) => `/complaints/${id}`;

  const updateFilter = (patch: Partial<typeof filters>) => {
    if (!isAdmin && patch.hostel !== undefined) {
      return;
    }
    dispatch(setFilters({ ...filters, ...patch }));
  };

  const clearFilters = () => {
    setQuery("");
    dispatch(
      setFilters({
        status: undefined,
        category: undefined,
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
          query={query}
          onQueryChange={setQuery}
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
          <ComplaintGrid complaints={visibleItems} detailPath={detailPath} />
        )}
      </div>
    </div>
  );
}

export default ComplaintsListPage;
