import { sendFeeReminder } from "@/features/fees/feesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import type { FeeSubmission } from "@/types/dashboard";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationDialogState {
  open: boolean;
  studentId: string;
  studentName: string;
  hostelFeeStatus: string;
  messFeeStatus: string;
}

export function useFeeNotifications(fees: FeeSubmission[]) {
  const dispatch = useAppDispatch();
  const { notificationLoading } = useAppSelector((state) => state.fees);

  const [notificationDialog, setNotificationDialog] =
    useState<NotificationDialogState>({
      open: false,
      studentId: "",
      studentName: "",
      hostelFeeStatus: "",
      messFeeStatus: "",
    });

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
        toast.success(
          result.payload.message || "Notification sent successfully"
        );
        setNotificationDialog({ ...notificationDialog, open: false });
      } else {
        const errorMessage = result.payload as string;
        if (
          errorMessage.includes("Forbidden") ||
          errorMessage.includes("403")
        ) {
          toast.error(
            "You don't have permission to send notifications. Please contact an admin."
          );
        } else {
          toast.error(errorMessage || "Failed to send notification");
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const closeNotificationDialog = () => {
    setNotificationDialog({ ...notificationDialog, open: false });
  };

  return {
    notificationDialog,
    handleSendNotification,
    handleNotificationSend,
    closeNotificationDialog,
    notificationLoading,
  };
}
