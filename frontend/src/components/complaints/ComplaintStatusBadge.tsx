import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/features/complaints/complaintsSlice";

const statusVariantMap: Record<Complaint["status"], "default" | "success" | "destructive" | "outline"> = {
  Pending: "outline",
  Resolved: "success",
  Rejected: "destructive",
  ToBeConfirmed: "default",
};

const statusLabelMap: Record<Complaint["status"], string> = {
  Pending: "Pending",
  Resolved: "Resolved",
  Rejected: "Rejected",
  ToBeConfirmed: "Awaiting Confirmation",
};

interface ComplaintStatusBadgeProps {
  status: Complaint["status"];
}

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{statusLabelMap[status]}</Badge>;
}

const studentStatusMap: Record<Complaint["studentStatus"], string> = {
  NotResolved: "Pending review",
  Resolved: "Student accepted",
  Rejected: "Student disputed",
};

interface ComplaintStudentStatusBadgeProps {
  studentStatus: Complaint["studentStatus"];
}

export function ComplaintStudentStatusBadge({ studentStatus }: ComplaintStudentStatusBadgeProps) {
  return <Badge variant="outline">{studentStatusMap[studentStatus]}</Badge>;
}

