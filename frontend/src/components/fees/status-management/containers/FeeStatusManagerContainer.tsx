import { useAppSelector } from "@/hooks";
import type { FeesFilters, FeeSubmission } from "@/types/dashboard";
import { useState } from "react";
import { FeeDocumentSheet } from "../../document-viewer/DocumentSheet";
import { FeeFiltersBar } from "../../filters/FeeFiltersBar";
import { FeeViewTabs } from "../../filters/FeeViewTabs";
import { useEmailToHostelMapping } from "../../hooks/useEmailToHostelMapping";
import { useFeeDocumentViewer } from "../../hooks/useFeeDocumentViewer";
import { useFeeFilters } from "../../hooks/useFeeFilters";
import { useFeeNotifications } from "../../hooks/useFeeNotifications";
import { useFeePagination } from "../../hooks/useFeePagination";
import { NotificationDialog } from "../../shared/NotificationDialog";
import { FeeAnalyticsContainer } from "./FeeAnalyticsContainer";
import { FeeListContainer } from "./FeeListContainer";

type TabType = "list" | "analytics";

interface FeeStatusManagerContainerProps {
  fees: FeeSubmission[];
  userRole: "admin" | "warden";
  userHostel?: string;
}

export function FeeStatusManagerContainer({
  fees,
  userRole,
  userHostel,
}: FeeStatusManagerContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [filters, setFilters] = useState<FeesFilters>({
    hostel: userRole === "admin" ? undefined : userHostel,
    feeType: undefined,
    status: undefined,
  });

  const { updateLoading, notificationLoading } = useAppSelector(
    (state) => state.fees
  );

  const emailToHostel = useEmailToHostelMapping();
  const filteredFees = useFeeFilters({
    fees,
    filters,
    userRole,
    userHostel,
    emailToHostel,
  });

  const { paginatedItems, paginationInfo, setCurrentPage } = useFeePagination({
    items: filteredFees,
    itemsPerPage: 10,
    filters,
  });

  const { viewingDocument, handleViewDocument, closeDocument } =
    useFeeDocumentViewer();

  const {
    notificationDialog,
    handleSendNotification,
    handleNotificationSend,
    closeNotificationDialog,
  } = useFeeNotifications(fees);

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
          <FeeListContainer
            fees={paginatedItems}
            userRole={userRole}
            emailToHostel={emailToHostel}
            updateLoading={updateLoading}
            notificationLoading={notificationLoading}
            paginationInfo={paginationInfo}
            onViewDocument={handleViewDocument}
            onSendNotification={handleSendNotification}
            onPageChange={setCurrentPage}
          />
        )}

        {activeTab === "analytics" && (
          <FeeAnalyticsContainer fees={filteredFees} filters={filters} />
        )}
      </div>

      {/* Document Viewer Sheet */}
      <FeeDocumentSheet
        open={!!viewingDocument}
        onClose={closeDocument}
        documentUrl={viewingDocument?.url || null}
        documentType={viewingDocument?.type || null}
        studentName={viewingDocument?.studentName || null}
        studentRollNo={viewingDocument?.studentRollNo}
      />

      {/* Notification Dialog */}
      <NotificationDialog
        open={notificationDialog.open}
        onClose={closeNotificationDialog}
        studentName={notificationDialog.studentName}
        studentId={notificationDialog.studentId}
        hostelFeeStatus={notificationDialog.hostelFeeStatus}
        messFeeStatus={notificationDialog.messFeeStatus}
        onSend={handleNotificationSend}
      />
    </div>
  );
}
