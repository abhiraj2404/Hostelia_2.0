import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface StudentTransitHistoryProps {
  transit: any[];
}

export function StudentTransitHistory({ transit }: StudentTransitHistoryProps) {
  const [page, setPage] = useState(1);
  const limit = 5; // 5 items per page

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} at ${time || 'N/A'}`;
  };

  // Sort transit by date/time (newest first)
  const sortedTransit = useMemo(() => {
    return [...transit].sort((a, b) => {
      const aDateTime = new Date(`${a.date} ${a.time || '00:00:00'}`).getTime();
      const bDateTime = new Date(`${b.date} ${b.time || '00:00:00'}`).getTime();
      return bDateTime - aDateTime;
    });
  }, [transit]);

  // Paginate transit
  const paginatedTransit = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return sortedTransit.slice(startIndex, startIndex + limit);
  }, [sortedTransit, page]);

  const totalPages = Math.ceil(sortedTransit.length / limit);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transit History</h2>

      {sortedTransit.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No transit entries found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0 divide-y">
                {paginatedTransit.map((entry, index) => (
                  <div
                    key={entry._id}
                    className={`flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? 'bg-muted/20' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        entry.transitStatus === 'ENTRY'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                    >
                      <ArrowRight
                        className={`h-5 w-5 ${
                          entry.transitStatus === 'ENTRY'
                            ? 'text-green-600 dark:text-green-400'
                            : 'rotate-180 text-red-600 dark:text-red-400'
                        }`}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{entry.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(entry.date, entry.time)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={entry.transitStatus === 'ENTRY' ? 'default' : 'destructive'}
                      className={`text-xs flex-shrink-0 ${
                        entry.transitStatus === 'ENTRY'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30'
                      }`}
                    >
                      {entry.transitStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {sortedTransit.length > limit && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, sortedTransit.length)} of{' '}
                {sortedTransit.length} entries
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
