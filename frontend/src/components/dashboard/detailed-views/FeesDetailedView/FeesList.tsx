import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FeeSubmission } from "@/types/dashboard";
import { formatDate } from "@/components/dashboard/utils/dashboardConstants";

interface FeesListProps {
  fees: FeeSubmission[];
  loading?: boolean;
  emailToHostel?: Record<string, string>;
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; className: string }> = {
    approved: { variant: "default", className: "bg-green-100 text-green-700" },
    pending: { variant: "outline", className: "border-yellow-500 text-yellow-700" },
    rejected: { variant: "destructive", className: "" },
    documentNotSubmitted: { variant: "secondary", className: "text-muted-foreground" },
  };
  
  return variants[status] || variants.documentNotSubmitted;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    documentNotSubmitted: 'Not Submitted',
  };
  return labels[status] || status;
};

export function FeesList({
  fees,
  loading = false,
  emailToHostel = {},
}: FeesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(fees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFees = fees.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      ) : fees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No fee submissions found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Hostel Fee</TableHead>
                  <TableHead>Mess Fee</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFees.map((fee) => {
                  const hostelBadge = getStatusBadge(fee.hostelFee.status);
                  const messBadge = getStatusBadge(fee.messFee.status);
                  
                  return (
                    <TableRow key={fee._id}>
                      <TableCell className="font-medium">
                        {fee.studentName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {fee.studentEmail}
                      </TableCell>
                      <TableCell>
                        {emailToHostel[fee.studentEmail] || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={hostelBadge.variant} className={hostelBadge.className}>
                          {getStatusLabel(fee.hostelFee.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={messBadge.variant} className={messBadge.className}>
                          {getStatusLabel(fee.messFee.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(fee.updatedAt || fee.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, fees.length)} of {fees.length} submissions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
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

