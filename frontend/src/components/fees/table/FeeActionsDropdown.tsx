import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FeeSubmission } from "@/types/dashboard";
import { Bell, Check, Eye, MoreVertical, X } from "lucide-react";

interface FeeActionsDropdownProps {
  fee: FeeSubmission;
  isLoading: boolean;
  userRole: "admin" | "warden";
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

export function FeeActionsDropdown({
  fee,
  isLoading,
  userRole,
  onViewDocument,
  onApprove,
  onReject,
  onSendNotification,
}: FeeActionsDropdownProps) {
  const hasHostelDoc = !!fee.hostelFee.documentUrl;
  const hasMessDoc = !!fee.messFee.documentUrl;
  const hostelPending = fee.hostelFee.status === "pending";
  const messPending = fee.messFee.status === "pending";
  const hostelRejected = fee.hostelFee.status === "rejected";
  const messRejected = fee.messFee.status === "rejected";
  const isAdmin = userRole === "admin";

  // Show view document only if document exists AND status is not rejected
  const canViewHostelDoc = hasHostelDoc && !hostelRejected;
  const canViewMessDoc = hasMessDoc && !messRejected;

  // Determine if we should show notification option
  // Show notification when status is "documentNotSubmitted" OR "rejected"
  const canSendHostelNotification =
    fee.hostelFee.status === "documentNotSubmitted" || hostelRejected;
  const canSendMessNotification =
    fee.messFee.status === "documentNotSubmitted" || messRejected;
  const showNotification = canSendHostelNotification || canSendMessNotification;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canViewHostelDoc && (
          <DropdownMenuItem
            onClick={() =>
              onViewDocument(
                fee.hostelFee.documentUrl!,
                "hostel",
                fee.studentName,
                fee.studentId
              )
            }
          >
            <Eye className="h-4 w-4 mr-2" />
            View Hostel Fee Document
          </DropdownMenuItem>
        )}
        {canViewMessDoc && (
          <DropdownMenuItem
            onClick={() =>
              onViewDocument(
                fee.messFee.documentUrl!,
                "mess",
                fee.studentName,
                fee.studentId
              )
            }
          >
            <Eye className="h-4 w-4 mr-2" />
            View Mess Fee Document
          </DropdownMenuItem>
        )}
        {isAdmin && hostelPending && onApprove && onReject && (
          <>
            <DropdownMenuItem
              onClick={() => onApprove(fee.studentId, "hostel")}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve Hostel Fee
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onReject(fee.studentId, "hostel")}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Reject Hostel Fee
            </DropdownMenuItem>
          </>
        )}
        {isAdmin && messPending && onApprove && onReject && (
          <>
            <DropdownMenuItem
              onClick={() => onApprove(fee.studentId, "mess")}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve Mess Fee
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onReject(fee.studentId, "mess")}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Reject Mess Fee
            </DropdownMenuItem>
          </>
        )}
        {showNotification && (
          <DropdownMenuItem
            onClick={() => onSendNotification(fee.studentId)}
            disabled={isLoading}
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Notification
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
