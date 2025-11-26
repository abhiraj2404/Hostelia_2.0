import type { FeeSubmission } from "@/types/dashboard";
import { FeeListTable } from "../../table/FeeListTable";
import { FeePagination } from "../../shared/FeePagination";
import { useFeeStatusUpdates } from "../../hooks/useFeeStatusUpdates";

interface FeeListContainerProps {
  fees: FeeSubmission[];
  userRole: "admin" | "warden";
  emailToHostel: Record<string, string>;
  updateLoading: Record<string, boolean>;
  notificationLoading: Record<string, boolean>;
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    totalItems: number;
  };
  onViewDocument: (
    url: string,
    type: "hostel" | "mess",
    studentName: string,
    studentId: string
  ) => void;
  onSendNotification: (studentId: string) => void;
  onPageChange: (page: number) => void;
}

export function FeeListContainer({
  fees,
  userRole,
  emailToHostel,
  updateLoading,
  notificationLoading,
  paginationInfo,
  onViewDocument,
  onSendNotification,
  onPageChange,
}: FeeListContainerProps) {
  const { handleApprove, handleReject } = useFeeStatusUpdates();

  return (
    <div className="space-y-4">
      <FeeListTable
        fees={fees}
        userRole={userRole}
        emailToHostel={emailToHostel}
        updateLoading={updateLoading}
        notificationLoading={notificationLoading}
        onViewDocument={onViewDocument}
        onApprove={userRole === "admin" ? handleApprove : undefined}
        onReject={userRole === "admin" ? handleReject : undefined}
        onSendNotification={onSendNotification}
      />
      <FeePagination
        currentPage={paginationInfo.currentPage}
        totalPages={paginationInfo.totalPages}
        startIndex={paginationInfo.startIndex}
        endIndex={paginationInfo.endIndex}
        totalItems={paginationInfo.totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
}

