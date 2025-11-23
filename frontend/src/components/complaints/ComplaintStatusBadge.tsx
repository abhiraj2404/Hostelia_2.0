import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/features/complaints/complaintsSlice";

const statusVariantMap: Record<
  Complaint["status"],
  "default" | "success" | "destructive" | "outline" | "secondary"
> = {
  Pending: "secondary",
  Resolved: "default",
  Rejected: "destructive",
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
  return (
    <Badge
      variant={statusVariantMap[status]}
      className="shadow-md backdrop-blur-sm bg-background/95"
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
}

export function ComplaintStudentStatusBadge({
  studentStatus,
}: ComplaintStudentStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="shadow-md backdrop-blur-sm bg-background/95"
    >
      {studentStatusMap[studentStatus]}
    </Badge>
  );
}
