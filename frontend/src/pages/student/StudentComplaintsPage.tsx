import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ComplaintStatusBadge } from "@/components/complaints/ComplaintStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchComplaints,
  selectComplaintsState,
  setFilters,
} from "@/features/complaints/complaintsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";
import { Check, Inbox, Sparkles } from "lucide-react";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Resolved", value: "Resolved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Awaiting Confirmation", value: "ToBeConfirmed" },
];

const categoryOptions = [
  { label: "All categories", value: "all" },
  { label: "Electrical", value: "Electrical" },
  { label: "Plumbing", value: "Plumbing" },
  { label: "Painting", value: "Painting" },
  { label: "Carpentry", value: "Carpentry" },
  { label: "Cleaning", value: "Cleaning" },
  { label: "Internet", value: "Internet" },
  { label: "Furniture", value: "Furniture" },
  { label: "Pest Control", value: "Pest Control" },
  { label: "Other", value: "Other" },
];

const hostelOptions = [
  { label: "All hostels", value: "all" },
  { label: "BH-1", value: "BH-1" },
  { label: "BH-2", value: "BH-2" },
  { label: "BH-3", value: "BH-3" },
  { label: "BH-4", value: "BH-4" },
];

const formatDate = (value: string | null) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

function StudentComplaintsPage() {
  const dispatch = useAppDispatch();
  const { items, listStatus, filters, error } = useAppSelector(
    selectComplaintsState
  );
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // Get user's hostel if available
  const userHostel = user?.hostel as string | undefined;

  // Filter hostel options: if user has a single hostel, only show that one
  const visibleHostelOptions = useMemo(() => {
    if (userHostel && hostelOptions.find((opt) => opt.value === userHostel)) {
      // User has a specific hostel - only show that one (plus "All hostels" for flexibility)
      return [
        { label: "All hostels", value: "all" },
        { label: userHostel, value: userHostel },
      ];
    }
    return hostelOptions;
  }, [userHostel]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchComplaints(filters));
    }
  }, [dispatch, isAuthenticated, filters]);

  const resolvedCount = useMemo(
    () => items.filter((complaint) => complaint.status === "Resolved").length,
    [items]
  );
  const pendingCount = useMemo(
    () => items.filter((complaint) => complaint.status === "Pending").length,
    [items]
  );

  const updateFilter = (patch: Partial<typeof filters>) => {
    dispatch(setFilters({ ...filters, ...patch }));
  };

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((c) =>
          [c.problemTitle, c.problemDescription, c.hostel, c.category, c.roomNo]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(q))
        )
      : items;
    const sorted = [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [items, query, sort]);

  return (
    <div className="bg-background">
      <div className="mx-auto w-full px-6 py-12 md:px-10 xl:px-16 2xl:px-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] lg:gap-8 xl:grid-cols-[minmax(640px,1fr)_minmax(260px,320px)] xl:gap-12 2xl:grid-cols-[minmax(760px,1fr)_minmax(280px,340px)]">
          {/* Main content */}
          <main className="order-1 space-y-10 lg:order-1">
            <header className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/60">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-4">
                  <Badge
                    variant="outline"
                    className="w-max border-dashed px-3 py-1 text-xs uppercase tracking-widest"
                  >
                    Student workspace
                  </Badge>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                      My complaints
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                      Submit issues, monitor status changes, and stay in sync
                      with wardens and admins. Hostelia keeps every update,
                      file, and resolution step in one place.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground/90">
                      Real-time visibility
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground/90">
                      Escalation ready
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground/90">
                      Audit friendly
                    </span>
                  </div>
                </div>
                <Button asChild size="lg" className="self-start">
                  <Link to="/student/complaints/new">New Complaint</Link>
                </Button>
              </div>
              <div className="mt-6 grid gap-4 border-t border-border/60 pt-6 md:grid-cols-[minmax(0,1fr)_200px] md:items-center">
                <div className="flex w-full items-center gap-3">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, room, category…"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Sort
                  </Label>
                  <Select
                    value={sort}
                    onValueChange={(v) => setSort(v as "newest" | "oldest")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </header>

            <section className="rounded-2xl border border-border/70 bg-muted/30 p-6 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Category
                </Label>
                <p className="text-sm text-muted-foreground">
                  Zero-in on specific maintenance areas without losing context.
                </p>
              </div>
              <div>
                <Select
                  value={filters.category ?? "all"}
                  onValueChange={(value: string) =>
                    updateFilter({
                      category: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/70 bg-card/70">
                <CardHeader className="space-y-2">
                  <CardDescription>Currently pending</CardDescription>
                  <CardTitle className="text-3xl font-semibold text-foreground">
                    {pendingCount}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track outstanding maintenance requests and follow up with
                    wardens when needed.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Applied to current filter settings
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/70">
                <CardHeader className="space-y-2">
                  <CardDescription>Resolved</CardDescription>
                  <CardTitle className="text-3xl font-semibold text-foreground">
                    {resolvedCount}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Confirm fixes, provide feedback, and keep your hostel
                    running smoothly.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Applied to current filter settings
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Complaints history
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Filter and sort your submissions below
                  </p>
                </div>
                {listStatus === "loading" && (
                  <p className="text-sm text-muted-foreground">Refreshing...</p>
                )}
              </div>

              {/* Status filters moved here from sidebar */}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Status
                </Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {statusOptions.map((option) => {
                    const active = (filters.status ?? "all") === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          updateFilter({
                            status:
                              option.value === "all" ? undefined : option.value,
                          })
                        }
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-foreground/40 bg-foreground text-background"
                            : "border-border bg-background hover:bg-muted/60"
                        )}
                        aria-pressed={active}
                      >
                        {active && <Check className="h-3.5 w-3.5" />}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {isAuthenticated && error && (
                <Card className="border-destructive/40 bg-destructive/10">
                  <CardContent className="py-4 text-sm text-destructive">
                    {error}
                  </CardContent>
                </Card>
              )}
              {listStatus === "loading" && items.length === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-lg border border-border bg-muted/30 p-5"
                    >
                      <div className="h-5 w-2/3 rounded bg-muted" />
                      <div className="mt-3 h-3 w-full rounded bg-muted" />
                      <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Inbox className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Welcome to your complaints workspace
                      </h3>
                      <p className="max-w-md text-sm text-muted-foreground">
                        Start by clicking "Submit a complaint" to track your
                        first issue. You'll receive real-time updates and can
                        follow up with wardens directly from this dashboard.
                      </p>
                    </div>
                    <Button asChild size="lg" className="mt-2">
                      <Link to="/student/complaints/new">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Submit a complaint
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {visibleItems.map((complaint) => (
                    <Card
                      key={complaint._id}
                      className="border-border/70 bg-background shadow-sm transition-colors hover:border-foreground/20"
                    >
                      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl text-foreground">
                            <Link
                              to={`/student/complaints/${complaint._id}`}
                              className="hover:underline"
                            >
                              {complaint.problemTitle}
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            Room {complaint.roomNo} · {complaint.hostel} ·{" "}
                            {complaint.category}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="default">{complaint.category}</Badge>
                          <Badge variant="outline">{complaint.hostel}</Badge>
                          <ComplaintStatusBadge status={complaint.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p className="line-clamp-3 leading-relaxed">
                          {complaint.problemDescription}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-muted-foreground/70">
                          <span>
                            Created: {formatDate(complaint.createdAt)}
                          </span>
                          <span>
                            Updated: {formatDate(complaint.updatedAt)}
                          </span>
                          <span>
                            Student status:{" "}
                            <strong className="text-foreground/80">
                              {complaint.studentStatus}
                            </strong>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Right sidebar: Hostel */}
          <aside className="order-2">
            <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-border/70 bg-muted/40 p-5 shadow-sm lg:min-h-[calc(100vh-8rem)]">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Hostel filters
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  {userHostel
                    ? `Your block: ${userHostel}`
                    : "Direct lines to every block"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {userHostel
                    ? "Filter by your block or view all hostels."
                    : "Compare hostels, capacity, and action velocity instantly."}
                </p>
              </div>
              <nav aria-label="Filter by hostel" className="mt-1">
                <ul className="space-y-1.5">
                  {visibleHostelOptions.map((option) => {
                    const active = (filters.hostel ?? "all") === option.value;
                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() =>
                            updateFilter({
                              hostel:
                                option.value === "all"
                                  ? undefined
                                  : option.value,
                            })
                          }
                          className={cn(
                            "relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-accent text-accent-foreground ring-1 ring-ring/30"
                              : "hover:bg-muted/60"
                          )}
                          aria-pressed={active}
                        >
                          <span
                            className={cn("truncate", active && "font-medium")}
                          >
                            {option.label}
                          </span>
                          {active ? (
                            <Check className="h-4 w-4 opacity-80" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default StudentComplaintsPage;
