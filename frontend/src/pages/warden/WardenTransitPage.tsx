import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  fetchTransitEntries,
  selectTransitState,
} from "@/features/transit/transitSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  LogIn,
  LogOut,
  AlertCircle,
  Loader2,
  Clock,
  Search,
  ArrowRight,
  ArrowLeft,
  Filter,
  X,
} from "lucide-react";

type FilterType = "ALL" | "ENTRY" | "EXIT";

function WardenTransitPage() {
  const dispatch = useAppDispatch();
  const { entries, listStatus, listError } = useAppSelector(selectTransitState);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("ALL");

  useEffect(() => {
    if (listStatus === "idle" && isAuthenticated) {
      dispatch(fetchTransitEntries());
    }
  }, [listStatus, dispatch, isAuthenticated]);

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date) + ` (${timeStr.slice(0, 5)})`;
  };

  // Filter and search entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.studentId?.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.studentId?.roomNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.purpose?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === "ALL" || entry.transitStatus === filterType;

    // Frontend-only restriction: if the current user is a warden, show only entries
    // for students in the same hostel as the warden. Admins and other roles see all.
    const isWarden = currentUser?.role === "warden";
    const sameHostel =
      !isWarden ||
      !currentUser?.hostel ||
      (entry.studentId?.hostel || "").toLowerCase() ===
        (currentUser?.hostel || "").toLowerCase();

    return matchesSearch && matchesFilter && sameHostel;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("ALL");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-5 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border bg-card text-xs font-medium shadow-sm">
            <Clock className="size-3.5" />
            <span>Transit Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Entry & Exit Register
          </h1>
          <p className="text-muted-foreground">
            Monitor student entry and exit records for hostel security
          </p>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Clock className="size-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  All Transit Records
                </CardTitle>
                <CardDescription>
                  {filteredEntries.length} record
                  {filteredEntries.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchTransitEntries())}
                disabled={listStatus === "loading"}
              >
                {listStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>Refresh</>
                )}
              </Button>
            </div>
          </CardHeader>
              <CardContent className="pt-6">
            {!isAuthenticated ? (
              <div className="text-center py-12 space-y-4">
                <AlertCircle className="size-12 mx-auto text-gray-400 dark:text-gray-600" />
                <div className="space-y-2">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Authentication Required
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please log in to view transit records
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Filters and Search */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, roll no, room no, or purpose..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Filter by Type */}
                    <div className="flex gap-2">
                      <Select
                        value={filterType}
                        onValueChange={(value) =>
                          setFilterType(value as FilterType)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <Filter className="mr-2 size-4" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Records</SelectItem>
                          <SelectItem value="ENTRY">Entry Only</SelectItem>
                          <SelectItem value="EXIT">Exit Only</SelectItem>
                        </SelectContent>
                      </Select>

                      {(searchQuery || filterType !== "ALL") && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={clearFilters}
                          title="Clear filters"
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                {listStatus === "loading" ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="size-8 animate-spin text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Loading records...
                    </p>
                  </div>
                ) : listError ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="size-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{listError}</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <Clock className="size-12 mx-auto text-gray-400 dark:text-gray-600" />
                    <div className="space-y-2">
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {searchQuery || filterType !== "ALL"
                          ? "No records match your filters"
                          : "No records yet"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {searchQuery || filterType !== "ALL"
                          ? "Try adjusting your search or filters"
                          : "Transit records will appear here once students create them"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                    {filteredEntries.map((entry) => {
                      const isEntry = entry.transitStatus === "ENTRY";
                      const Icon = isEntry ? ArrowLeft : ArrowRight;
                      return (
                        <div
                          key={entry._id}
                          className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                className={cn(
                                  "p-2 rounded-lg shrink-0",
                                  isEntry
                                    ? "bg-green-500/10"
                                    : "bg-orange-500/10"
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "size-5",
                                    isEntry
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span
                                    className={cn(
                                      "text-sm font-semibold px-2 py-0.5 rounded-md",
                                      isEntry
                                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                        : "bg-orange-500/10 text-orange-700 dark:text-orange-400"
                                    )}
                                  >
                                    {entry.transitStatus}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(entry.date, entry.time)}
                                  </span>
                                </div>

                                {/* Student Details */}
                                <div className="space-y-1 mb-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {entry.studentId?.name || "Unknown"}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                    <span>
                                      Roll: {entry.studentId?.rollNo || "N/A"}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {entry.studentId?.hostel || "N/A"} - Room{" "}
                                      {entry.studentId?.roomNo || "N/A"}
                                    </span>
                                  </div>
                                </div>

                                {/* Purpose */}
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-medium text-gray-700 dark:text-gray-200">Purpose:</span>{" "}
                                  {entry.purpose}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        {isAuthenticated && listStatus === "succeeded" && entries.length > 0 && (
          <div className="grid gap-4 mt-6 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {entries.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Records
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="size-5 text-green-600" />
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                      {entries.filter((e) => e.transitStatus === "ENTRY").length}
                    </p>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                    Entries
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <LogOut className="size-5 text-orange-600" />
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                      {entries.filter((e) => e.transitStatus === "EXIT").length}
                    </p>
                  </div>
                  <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                    Exits
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default WardenTransitPage;
