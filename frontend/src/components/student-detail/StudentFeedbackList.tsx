import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StudentFeedbackListProps {
  feedback: any[];
}

export function StudentFeedbackList({ feedback }: StudentFeedbackListProps) {
  const [page, setPage] = useState(1);
  const limit = 8; // 8 items per page

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: '2-digit'
    });
  };

  const getMealTypeBadgeColor = (mealType: string) => {
    switch (mealType) {
      case 'Breakfast':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Lunch':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Snacks':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Dinner':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return '';
    }
  };

  // Sort feedback by date (newest first)
  const sortedFeedback = useMemo(() => {
    return [...feedback].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [feedback]);

  // Paginate feedback
  const paginatedFeedback = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return sortedFeedback.slice(startIndex, startIndex + limit);
  }, [sortedFeedback, page]);

  const totalPages = Math.ceil(sortedFeedback.length / limit);

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mess Feedback</h2>

      {sortedFeedback.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No feedback submitted</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[120px]">Meal Type</TableHead>
                    <TableHead className="w-[140px]">Rating</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeedback.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${getMealTypeBadgeColor(item.mealType)}`}
                        >
                          {item.mealType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {renderStarRating(item.rating)}
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm max-w-md">
                          {item.comment || 'No comment'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {sortedFeedback.length > limit && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, sortedFeedback.length)} of{' '}
                {sortedFeedback.length} feedback
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
  );
}
