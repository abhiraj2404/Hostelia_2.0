import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TransitEntry {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNo: string;
    hostel: string;
    roomNo: string;
  };
  purpose: string;
  transitStatus: "ENTRY" | "EXIT";
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

interface TransitHistoryProps {
  entries: TransitEntry[];
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  listError: string | null;
  onRefresh: () => void;
}

export function TransitHistory({ entries, listStatus, listError, onRefresh }: TransitHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ENTRY" | "EXIT">("ALL");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  const ITEMS_PER_PAGE = 7;

  // Filter entries according to selected filters
  const filteredEntries = entries.filter((entry) => {
    const matchesStatus = statusFilter === "ALL" || entry.transitStatus === statusFilter;
    const matchesDate = !dateFilter || (new Date(entry.date).toDateString() === dateFilter.toDateString());
    return matchesStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // HH:MM
  };

  return (
    <Card className="relative border overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full">
      <CardHeader className="bg-muted/50 text-foreground pb-3 px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2.5 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <List className="size-5 text-primary" />
              </div>
              <span className="font-bold">My Transit History</span>
            </CardTitle>
            {/* <CardDescription className="text-muted-foreground text-sm">
              Your complete entry and exit records
            </CardDescription> */}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={listStatus === "loading"}
            className="shadow-sm"
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                listStatus === "loading" && "animate-spin"
              )}
            />
            Refresh
          </Button>
        </div>
        {/* Filters */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Date Filter */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full h-10 justify-start text-left font-normal"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="mr-2 size-4" />
              {dateFilter ? (
                new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(dateFilter)
              ) : (
                <span>Filter by date</span>
              )}
            </Button>
            {showCalendar && (
              <div className="absolute left-0 z-50 mt-2 bg-background border rounded-lg shadow-lg w-72 sm:w-80">
                <Calendar
                  className="w-full"
                  selected={dateFilter}
                  onSelect={(date) => {
                    setDateFilter(date);
                    setShowCalendar(false);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ENTRY">Entry Only</SelectItem>
              <SelectItem value="EXIT">Exit Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          <div className="col-span-2 sm:col-span-2 flex items-center justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("ALL"); setDateFilter(undefined); setCurrentPage(1); }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col">
        <div className="flex-1 pb-13 overflow-auto">
        {listStatus === "loading" ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading your records...</p>
          </div>
        ) : listError ? (
          <div className="m-6">
            <div className="flex items-start gap-3 p-5 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900">
              <AlertCircle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">Error loading records</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{listError}</p>
              </div>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-4">
            <div className="mx-auto w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="size-10 text-gray-400 dark:text-gray-600" />
              </div>
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                No Transit Records Yet
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create your first entry or exit record above to start tracking your transit movements
              </p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-4">
            <div className="mx-auto w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
              <List className="size-10 text-gray-400 dark:text-gray-600" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                No Matching Records Found
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your filters to find matching transit records
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 shadow-sm">
                      <TableRow className="border-b-2 border-gray-300 dark:border-gray-700">
                        <TableHead className="w-14 px-3 py-2 font-semibold text-gray-900 dark:text-white text-sm text-center">#</TableHead>
                        <TableHead className="px-3 py-2 font-semibold text-gray-900 dark:text-white text-sm min-w-[100px]">Date</TableHead>
                        <TableHead className="px-3 py-2 font-semibold text-gray-900 dark:text-white text-sm min-w-20">Time</TableHead>
                        <TableHead className="px-4 py-2 font-semibold text-gray-900 dark:text-white text-sm min-w-[70px]">Type</TableHead>
                        <TableHead className="px-3 py-2 font-semibold text-gray-900 dark:text-white text-sm min-w-[200px]">Purpose</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntries.map((entry, index) => {
                        const isEntry = entry.transitStatus === "ENTRY";
                        return (
                          <TableRow 
                            key={entry._id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-800"
                          >
                            <TableCell className="px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 text-center text-sm">
                              {String(startIndex + index + 1).padStart(2, '0')}
                            </TableCell>
                            <TableCell className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
                              {formatDate(entry.date)}
                            </TableCell>
                            <TableCell className="px-3 py-2 font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {formatTime(entry.time)}
                            </TableCell>
                            <TableCell className="px-3 py-2">
                              <Badge
                                variant={isEntry ? "default" : "outline"}
                                className={
                                  isEntry
                                    ? "border-2 border-green-600 text-green-700 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-500 dark:hover:text-white font-semibold px-3 py-1"
                                    : "border-2 border-orange-600 text-orange-700 hover:bg-orange-600 hover:text-white dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white font-semibold px-2.5 py-1 text-xs"
                                }
                              >
                                {entry.transitStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-gray-700 dark:text-gray-300 text-sm">
                              <div className="leading-relaxed max-w-md wrap-break-word">
                                {entry.purpose}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="lg:hidden p-2 space-y-3 max-h-[600px] overflow-y-auto">
              {paginatedEntries.map((entry, index) => {
                const isEntry = entry.transitStatus === "ENTRY";
                return (
                  <Card key={entry._id} className="border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-3 space-y-2">
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-sm shadow-sm">
                            {String(startIndex + index + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">Record #{index + 1}</p>
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                              {formatDate(entry.date)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={isEntry ? "default" : "outline"}
                          className={
                            isEntry
                              ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 font-semibold px-2.5 py-1 text-xs shadow-sm"
                              : "border-2 border-orange-600 text-orange-700 hover:bg-orange-600 hover:text-white dark:border-orange-500 dark:text-orange-400 font-semibold px-2.5 py-1 text-xs"
                          }
                        >
                          {entry.transitStatus}
                        </Badge>
                      </div>

                      {/* Time Info */}
                      <div className="pt-1 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-gray-500 dark:text-gray-500" />
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">Time</p>
                        </div>
                        <p className="text-xs font-mono font-semibold text-gray-900 dark:text-gray-100 mt-1">{formatTime(entry.time)}</p>
                      </div>

                      {/* Purpose */}
                      <div className="pt-1 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-1">Purpose</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed wrap-break-word">
                          {entry.purpose}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
        </div>

        {/* Pagination Controls */}
        {filteredEntries.length > 0 && totalPages > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-t border-border/30 bg-card">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="text-sm">Page {currentPage} of {totalPages}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
