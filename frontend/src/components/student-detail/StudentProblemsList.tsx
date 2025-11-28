import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ComplaintStatusBadge } from '@/components/complaints/ComplaintStatusBadge';
import { Badge } from '@/components/ui/badge';

interface StudentProblemsListProps {
  problems: any[];
}

export function StudentProblemsList({ problems }: StudentProblemsListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 5;

  const paginatedProblems = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return problems.slice(startIndex, startIndex +limit);
  }, [problems, page]);

  const totalPages = Math.ceil(problems.length / limit);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Complaints & Problems</h2>

      {problems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No complaints found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProblems.map((problem) => (
                    <TableRow
                      key={problem._id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => navigate(`/complaints/${problem._id}`)}
                    >
                      <TableCell className="font-medium">
                        <p className="line-clamp-1 max-w-md">{problem.problemTitle}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{problem.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <ComplaintStatusBadge status={problem.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(problem.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>



          {/* Pagination */}
          {problems.length > limit && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, problems.length)} of{' '}
                {problems.length} complaints
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
