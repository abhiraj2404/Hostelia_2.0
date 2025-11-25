import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";
import type { MessFeedback } from "@/types/dashboard";
import { formatDate } from "@/components/dashboard/utils/dashboardConstants";

interface MessFeedbackListProps {
  feedback: MessFeedback[];
  loading?: boolean;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function MessFeedbackList({
  feedback,
  loading = false,
}: MessFeedbackListProps) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No feedback found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Meal Type</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell>{item.mealType}</TableCell>
                  <TableCell className="font-medium">
                    {item.studentId?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {item.studentId?.hostel || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <RatingStars rating={item.rating} />
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {item.comment || <span className="text-muted-foreground italic">No comment</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
