import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/features/complaints/complaintsSlice";

const statusVariantMap: Record<
  Complaint["status"],
  "default" | "success" | "destructive" | "outline" | "secondary"
> = {
  Pending: "secondary",
  Resolved: "default",
  Rejected: "default",
  ToBeConfirmed: "outline",
};

const statusLabelMap: Record<Complaint["status"], string> = {
  Pending: "Under Review",
  Resolved: "Resolved",
  Rejected: "Rejected",
  ToBeConfirmed: "Awaiting Confirmation",
};

interface ComplaintStatusBadgeProps {
  status: Complaint["status"];
}

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
  const getHoverClass = () => {
    switch (status) {
      case "Resolved":
        return "hover:bg-green-100 dark:hover:bg-green-900/30";
      case "Rejected":
        return "hover:bg-red-100 dark:hover:bg-red-900/30";
      case "Pending":
        return "hover:bg-amber-100 dark:hover:bg-amber-900/30";
      case "ToBeConfirmed":
        return "hover:bg-purple-100 dark:hover:bg-purple-900/30";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant={statusVariantMap[status]}
      className={`shadow-md backdrop-blur-sm bg-background/95 transition-colors ${getHoverClass()}`}
    >
      {statusLabelMap[status]}
    </Badge>
  );
}

const studentStatusMap: Record<Complaint["studentStatus"], string> = {
  NotResolved: "Not Verified",
  Resolved: "Student Confirmed",
  Rejected: "Student Reopened",
};

interface ComplaintStudentStatusBadgeProps {
  studentStatus: Complaint["studentStatus"];
  complaintStatus?: Complaint["status"];
}

export function ComplaintStudentStatusBadge({
  studentStatus,
  complaintStatus,
}: ComplaintStudentStatusBadgeProps) {
  // If complaint is resolved but studentStatus is NotResolved, it means it's an old complaint
  // that was resolved before the verification flow was added, so show "Student Confirmed"
  const displayStatus =
    complaintStatus === "Resolved" && studentStatus === "NotResolved"
      ? "Resolved"
      : studentStatus;

  const getHoverClass = () => {
    // Use studentStatus directly for hover effect to ensure correct mapping
    switch (studentStatus) {
      case "Resolved":
        return "hover:bg-green-100 dark:hover:bg-green-900/30";
      case "Rejected":
        return "hover:bg-red-100 dark:hover:bg-red-900/30";
      case "NotResolved":
        return "hover:bg-amber-100 dark:hover:bg-amber-900/30";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`shadow-md backdrop-blur-sm bg-background/95 transition-colors ${getHoverClass()}`}
    >
      {studentStatusMap[displayStatus]}
    </Badge>
  );
}
