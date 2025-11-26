import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  hostelFeeStatus: string;
  messFeeStatus: string;
  onSend: (
    emailType: "hostelFee" | "messFee" | "both",
    notes?: string
  ) => Promise<void>;
}

export function NotificationDialog({
  open,
  onClose,
  studentName,
  studentId: _studentId, // Required by interface but not used in component
  hostelFeeStatus,
  messFeeStatus,
  onSend,
}: NotificationDialogProps) {
  // Suppress unused variable warning - studentId is required by interface but handled by parent
  void _studentId;
  const [emailType, setEmailType] = useState<"hostelFee" | "messFee" | "both">(
    "both"
  );
  const [notes, setNotes] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canSendHostel =
    hostelFeeStatus === "documentNotSubmitted" ||
    hostelFeeStatus === "rejected";
  const canSendMess =
    messFeeStatus === "documentNotSubmitted" || messFeeStatus === "rejected";
  const canSendBoth = canSendHostel && canSendMess;

  // Determine available options
  const availableOptions: Array<{
    value: "hostelFee" | "messFee" | "both";
    label: string;
  }> = [];
  if (canSendHostel) {
    availableOptions.push({ value: "hostelFee", label: "Hostel Fee Only" });
  }
  if (canSendMess) {
    availableOptions.push({ value: "messFee", label: "Mess Fee Only" });
  }
  if (canSendBoth) {
    availableOptions.push({
      value: "both",
      label: "Both Hostel and Mess Fees",
    });
  }

  // Set default if current selection is not available
  if (open && !availableOptions.find((opt) => opt.value === emailType)) {
    if (availableOptions.length > 0) {
      setEmailType(availableOptions[0].value);
    }
  }

  const handleSend = async () => {
    if (!emailType) return;
    setIsSending(true);
    try {
      await onSend(emailType, notes.trim() || undefined);
      // Only close and reset if successful (parent handles success)
      // If error, parent shows toast and we keep dialog open
    } catch {
      // Error handling is done in parent via toast
      // Keep dialog open so user can retry or cancel
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Send Fee Reminder</SheetTitle>
          <SheetDescription>
            Send a reminder notification to {studentName} to submit their fee
            documents.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emailType">Fee Type</Label>
            <Select
              value={emailType}
              onValueChange={(value) =>
                setEmailType(value as "hostelFee" | "messFee" | "both")
              }
            >
              <SelectTrigger id="emailType">
                <SelectValue placeholder="Select fee type" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !emailType}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Notification"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
