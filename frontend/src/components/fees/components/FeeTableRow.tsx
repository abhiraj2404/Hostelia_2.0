import { formatDate } from "@/components/dashboard/utils/dashboardConstants";
import { TableCell, TableRow } from "@/components/ui/table";
import type { FeeSubmission } from "@/types/dashboard";
import { FeeActionsDropdown } from "./FeeActionsDropdown";
import { FeeStatusBadge } from "./FeeStatusBadge";

interface FeeTableRowProps {
  fee: FeeSubmission;
  userRole: "admin" | "warden";
  studentHostel: string;
  isLoading: boolean;
  onViewDocument: (
    url: string,
    type: "hostel" | "mess",
    studentName: string,
    studentId: string
  ) => void;
  onApprove?: (studentId: string, feeType: "hostel" | "mess") => void;
  onReject?: (studentId: string, feeType: "hostel" | "mess") => void;
  onSendNotification: (studentId: string) => void;
}

export function FeeTableRow({
  fee,
  userRole,
  studentHostel,
  isLoading,
  onViewDocument,
  onApprove,
  onReject,
  onSendNotification,
}: FeeTableRowProps) {
  return (
    <TableRow key={fee._id}>
      <TableCell className="font-medium">{fee.studentName}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {fee.studentEmail}
      </TableCell>
      {userRole === "admin" && <TableCell>{studentHostel}</TableCell>}
      <TableCell>
        <FeeStatusBadge status={fee.hostelFee.status} />
      </TableCell>
      <TableCell>
        <FeeStatusBadge status={fee.messFee.status} />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDate(fee.updatedAt || fee.createdAt)}
      </TableCell>
      <TableCell>
        <FeeActionsDropdown
          fee={fee}
          isLoading={isLoading}
          userRole={userRole}
          onViewDocument={onViewDocument}
          onApprove={onApprove}
          onReject={onReject}
          onSendNotification={onSendNotification}
        />
      </TableCell>
    </TableRow>
  );
}
