import { FeesAnalytics } from "@/components/dashboard/detailed-views/FeesDetailedView/FeesAnalytics";
import { useState, useEffect } from "react";
import type { FeesFilters, FeeSubmission } from "@/types/dashboard";
import { useFeeFilters } from "./hooks/useFeeFilters";
import { useEmailToHostelMapping } from "./hooks/useEmailToHostelMapping";
import { updateFeeStatus, sendFeeReminder } from "@/features/fees/feesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { toast } from "sonner";
import { FeeFiltersBar } from "./components/FeeFiltersBar";
import { FeeViewTabs } from "./components/FeeViewTabs";
import { FeeListTable } from "./components/FeeListTable";
import { FeePagination } from "./components/FeePagination";
import { FeeDocumentSheet } from "./components/FeeDocumentSheet";
import { NotificationDialog } from "./components/NotificationDialog";

interface FeeStatusManagerProps {
  fees: FeeSubmission[];
  userRole: "admin" | "warden";
  userHostel?: string;
}

type TabType = "list" | "analytics";

const ITEMS_PER_PAGE = 10;

export function FeeStatusManager({
  fees,
  userRole,
  userHostel,
}: FeeStatusManagerProps) {
  const dispatch = useAppDispatch();
  const { updateLoading, notificationLoading } = useAppSelector((state) => state.fees);
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [filters, setFilters] = useState<FeesFilters>({
    hostel: userRole === "admin" ? undefined : userHostel,
    feeType: undefined,
    status: undefined,
  });
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    type: "hostel" | "mess";
    studentName: string;
  } | null>(null);
  const [notificationDialog, setNotificationDialog] = useState<{
    open: boolean;
    studentId: string;
    studentName: string;
    hostelFeeStatus: string;
    messFeeStatus: string;
  }>({
    open: false,
    studentId: "",
    studentName: "",
    hostelFeeStatus: "",
    messFeeStatus: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const emailToHostel = useEmailToHostelMapping();
  const filteredFees = useFeeFilters({
    fees,
    filters,
    userRole,
    userHostel,
    emailToHostel,
  });

  // Pagination for list view
  const totalPages = Math.ceil(filteredFees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFees = filteredFees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleStatusUpdate = async (
    studentId: string,
    feeType: "hostel" | "mess",
    newStatus: "approved" | "rejected"
  ) => {
    try {
      const updateData: {
        studentId: string;
        hostelFeeStatus?:
          | "documentNotSubmitted"
          | "pending"
          | "approved"
          | "rejected";
        messFeeStatus?:
          | "documentNotSubmitted"
          | "pending"
          | "approved"
          | "rejected";
      } = { studentId };
      if (feeType === "hostel") {
        updateData.hostelFeeStatus = newStatus;
      } else {
        updateData.messFeeStatus = newStatus;
      }

      const result = await dispatch(updateFeeStatus(updateData));

      if (updateFeeStatus.fulfilled.match(result)) {
        toast.success(
          `${
            feeType === "hostel" ? "Hostel" : "Mess"
          } fee ${newStatus} successfully`
        );
      } else {
        const errorMessage = result.payload as string;
        if (
          errorMessage.includes("Forbidden") ||
          errorMessage.includes("403")
        ) {
          toast.error(
            "Only admins can update fee status. Please contact an admin."
          );
        } else {
          toast.error(errorMessage || "Failed to update fee status");
        }
      }
    } catch {
      toast.error("Failed to update fee status");
    }
  };

  const handleViewDocument = (
    url: string,
    type: "hostel" | "mess",
    studentName: string
  ) => {
    setViewingDocument({ url, type, studentName });
  };

  const handleApprove = (studentId: string, feeType: "hostel" | "mess") => {
    handleStatusUpdate(studentId, feeType, "approved");
  };

  const handleReject = (studentId: string, feeType: "hostel" | "mess") => {
    handleStatusUpdate(studentId, feeType, "rejected");
  };

  const handleSendNotification = (studentId: string) => {
    const fee = fees.find((f) => f.studentId === studentId);
    if (fee) {
      setNotificationDialog({
        open: true,
        studentId,
        studentName: fee.studentName,
        hostelFeeStatus: fee.hostelFee.status,
        messFeeStatus: fee.messFee.status,
      });
    }
  };

  const handleNotificationSend = async (
    emailType: "hostelFee" | "messFee" | "both",
    notes?: string
  ) => {
    try {
      const result = await dispatch(
        sendFeeReminder({
          studentId: notificationDialog.studentId,
          emailType,
          notes,
        })
      );

      if (sendFeeReminder.fulfilled.match(result)) {
        toast.success(result.payload.message || "Notification sent successfully");
        setNotificationDialog({ ...notificationDialog, open: false });
      } else {
        const errorMessage = result.payload as string;
        // Handle Forbidden error gracefully
        if (errorMessage.includes("Forbidden") || errorMessage.includes("403")) {
          toast.error("You don't have permission to send notifications. Please contact an admin.");
        } else {
          toast.error(errorMessage || "Failed to send notification");
        }
        // Don't throw error - let user close dialog
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      // Don't throw error - let user close dialog
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Header: Filters & Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <FeeFiltersBar
          filters={filters}
          userRole={userRole}
          userHostel={userHostel}
          onFiltersChange={setFilters}
        />
        <FeeViewTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "list" && (
          <div className="space-y-4">
            <FeeListTable
              fees={paginatedFees}
              userRole={userRole}
              emailToHostel={emailToHostel}
              updateLoading={updateLoading}
              notificationLoading={notificationLoading}
              onViewDocument={handleViewDocument}
              onApprove={userRole === "admin" ? handleApprove : undefined}
              onReject={userRole === "admin" ? handleReject : undefined}
              onSendNotification={handleSendNotification}
            />
            <FeePagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredFees.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {activeTab === "analytics" && (
          <FeesAnalytics fees={filteredFees} filters={filters} />
        )}
      </div>

      {/* Document Viewer Sheet */}
      <FeeDocumentSheet
        open={!!viewingDocument}
        onClose={() => setViewingDocument(null)}
        documentUrl={viewingDocument?.url || null}
        documentType={viewingDocument?.type || null}
        studentName={viewingDocument?.studentName || null}
      />

      {/* Notification Dialog */}
      <NotificationDialog
        open={notificationDialog.open}
        onClose={() => setNotificationDialog({ ...notificationDialog, open: false })}
        studentName={notificationDialog.studentName}
        studentId={notificationDialog.studentId}
        hostelFeeStatus={notificationDialog.hostelFeeStatus}
        messFeeStatus={notificationDialog.messFeeStatus}
        onSend={handleNotificationSend}
      />
    </div>
  );
}
