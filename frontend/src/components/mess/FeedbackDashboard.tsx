import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Filter,
  X,
  AlertCircle,
  Loader2,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Feedback {
  _id: string;
  date: string;
  day: string;
  mealType: string;
  rating: number;
  comment?: string;
  user: {
    name: string;
    email: string;
    rollNo: string;
    hostel: string;
    roomNo: string;
    year: number;
  };
  createdAt: string;
}

const mealIcons = {
  Breakfast: Coffee,
  Lunch: UtensilsCrossed,
  Snacks: Cookie,
  Dinner: Moon,
};

const mealTypes = ["All", "Breakfast", "Lunch", "Snacks", "Dinner"];
const ratingFilters = ["All", "5", "4", "3", "2", "1"];

export function FeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [mealFilter, setMealFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [hostelFilter, setHostelFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/mess/feedback");
        // Handle both response formats: { feedbacks: [] } or direct array
        const feedbackData = response.data?.feedbacks || response.data || [];
        setFeedbacks(feedbackData);
        setFilteredFeedbacks(feedbackData);
        setError(null);
      } catch (err: any) {
        console.error("Feedback fetch error:", err);
        setError(err.response?.data?.message || "Failed to load feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...feedbacks];

    if (mealFilter !== "All") {
      filtered = filtered.filter((f) => f.mealType === mealFilter);
    }

    if (ratingFilter !== "All") {
      filtered = filtered.filter((f) => f.rating === parseInt(ratingFilter));
    }

    if (hostelFilter !== "All") {
      filtered = filtered.filter((f) => f.user.hostel === hostelFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter((f) => {
        const feedbackDate = new Date(f.date);
        feedbackDate.setHours(0, 0, 0, 0);
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          return feedbackDate >= fromDate && feedbackDate <= toDate;
        }
        return feedbackDate >= fromDate;
      });
    }

    setFilteredFeedbacks(filtered);
  }, [mealFilter, ratingFilter, hostelFilter, dateFrom, dateTo, feedbacks]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [mealFilter, ratingFilter, hostelFilter, dateFrom, dateTo]);

  // Calculate stats
  const calculateStats = () => {
    if (filteredFeedbacks.length === 0) {
      return {
        avgRating: 0,
        totalFeedbacks: 0,
        withComments: 0,
        mealRatings: {} as Record<string, number>,
      };
    }

    const avgRating =
      filteredFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
      filteredFeedbacks.length;

    const withComments = filteredFeedbacks.filter((f) => f.comment).length;

    const mealRatings: Record<string, number> = {};
    mealTypes.slice(1).forEach((meal) => {
      const mealFeedbacks = filteredFeedbacks.filter(
        (f) => f.mealType === meal
      );
      if (mealFeedbacks.length > 0) {
        mealRatings[meal] =
          mealFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
          mealFeedbacks.length;
      }
    });

    return {
      avgRating: parseFloat(avgRating.toFixed(1)),
      totalFeedbacks: filteredFeedbacks.length,
      withComments,
      mealRatings,
    };
  };

  const stats = calculateStats();

  // Pagination derived values
  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFeedbacks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFeedbacks, currentPage]);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Get unique hostels
  const hostels = [
    "All",
    ...Array.from(new Set(feedbacks.map((f) => f.user.hostel))).sort(),
  ];

  // Clear filters
  const clearFilters = () => {
    setMealFilter("All");
    setRatingFilter("All");
    setHostelFilter("All");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters =
    mealFilter !== "All" || ratingFilter !== "All" || hostelFilter !== "All" || dateFrom !== undefined || dateTo !== undefined;

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-destructive/50">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-foreground">Failed to Load Feedbacks</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3",
                    i <= Math.round(stats.avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Feedbacks
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalFeedbacks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {feedbacks.length} total submissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Comments
            </CardTitle>
            <MessageSquare className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.withComments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalFeedbacks > 0
                ? `${Math.round((stats.withComments / stats.totalFeedbacks) * 100)}% with comments`
                : "No comments yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meal Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.mealRatings).slice(0, 2).map(([meal, rating]) => {
                const Icon = mealIcons[meal as keyof typeof mealIcons];
                return (
                  <div key={meal} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon className="size-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{meal}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="size-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowFromCalendar(!showFromCalendar)}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {dateFrom ? (
                    new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(dateFrom)
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
                {showFromCalendar && (
                  <div className="absolute z-50 mt-2 bg-background border rounded-lg shadow-lg">
                    <Calendar
                      selected={dateFrom}
                      onSelect={(date) => {
                        setDateFrom(date);
                        setShowFromCalendar(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowToCalendar(!showToCalendar)}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {dateTo ? (
                    new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(dateTo)
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
                {showToCalendar && (
                  <div className="absolute z-50 mt-2 bg-background border rounded-lg shadow-lg">
                    <Calendar
                      selected={dateTo}
                      onSelect={(date) => {
                        setDateTo(date);
                        setShowToCalendar(false);
                      }}
                      disabled={(date) => dateFrom ? date < dateFrom : false}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meal Type</label>
              <Select value={mealFilter} onValueChange={setMealFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((meal) => (
                    <SelectItem key={meal} value={meal}>
                      {meal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ratingFilters.map((rating) => (
                    <SelectItem key={rating} value={rating}>
                      {rating === "All" ? "All Ratings" : `${rating} Stars`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hostel</label>
              <Select value={hostelFilter} onValueChange={setHostelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hostels.map((hostel) => (
                    <SelectItem key={hostel} value={hostel}>
                      {hostel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Feedback Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredFeedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="size-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No feedbacks found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Feedbacks will appear here once submitted"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Day</TableHead>
                    <TableHead className="font-semibold">Meal</TableHead>
                    <TableHead className="font-semibold">Rating</TableHead>
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Hostel</TableHead>
                    <TableHead className="font-semibold">Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeedbacks.map((feedback) => {
                    const MealIcon =
                      mealIcons[feedback.mealType as keyof typeof mealIcons];
                    return (
                      <TableRow key={feedback._id} className="hover:bg-muted/30">
                        <TableCell className="text-sm">
                          {formatDate(feedback.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {feedback.day}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MealIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm">{feedback.mealType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "size-3.5",
                                  i <= feedback.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {feedback.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {feedback.user.rollNo} • Year {feedback.user.year}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {feedback.user.hostel}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {feedback.comment ? (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {feedback.comment}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground/50 italic">
                              No comment
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredFeedbacks.length > 0 && totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, idx) => (
                <PaginationItem key={idx}>
                  {pageNum === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
