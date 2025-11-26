import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FeeSubmission } from "@/types/dashboard";
import { FeeTableRow } from "./FeeTableRow";

interface FeeListTableProps {
  fees: FeeSubmission[];
  userRole: "admin" | "warden";
  emailToHostel: Record<string, string>;
  updateLoading: Record<string, boolean>;
  notificationLoading: Record<string, boolean>;
  onViewDocument: (url: string, type: "hostel" | "mess", studentName: string) => void;
  onApprove?: (studentId: string, feeType: "hostel" | "mess") => void;
  onReject?: (studentId: string, feeType: "hostel" | "mess") => void;
  onSendNotification: (studentId: string) => void;
}

export function FeeListTable({
  fees,
  userRole,
  emailToHostel,
  updateLoading,
  notificationLoading,
  onViewDocument,
  onApprove,
  onReject,
  onSendNotification,
}: FeeListTableProps) {
  if (fees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No fee submissions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            {userRole === "admin" && <TableHead>Hostel</TableHead>}
            <TableHead>Hostel Fee</TableHead>
            <TableHead>Mess Fee</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fees.map((fee) => {
            const studentHostel = emailToHostel[fee.studentEmail] || "N/A";
            const isLoading =
              updateLoading[fee.studentId] || notificationLoading[fee.studentId] || false;

            return (
              <FeeTableRow
                key={fee._id}
                fee={fee}
                userRole={userRole}
                studentHostel={studentHostel}
                isLoading={isLoading}
                onViewDocument={onViewDocument}
                onApprove={onApprove}
                onReject={onReject}
                onSendNotification={onSendNotification}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

