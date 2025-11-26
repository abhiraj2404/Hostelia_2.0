import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clock, FileX, XCircle, RefreshCw } from "lucide-react";
import type { FeeSubmission } from "@/types/dashboard";
import { FeeDocumentViewer } from "../FeeDocumentViewer";
import { FeeSubmissionForm } from "../FeeSubmissionForm";
import { useState } from "react";

interface FeeStatusCardProps {
  feeType: "hostel" | "mess";
  feeData: FeeSubmission["hostelFee"] | FeeSubmission["messFee"];
  onRefresh?: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
      return {
        variant: "default" as const,
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle2,
        label: "Approved",
      };
    case "pending":
      return {
        variant: "outline" as const,
        className:
          "border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400",
        icon: Clock,
        label: "Pending",
      };
    case "rejected":
      return {
        variant: "destructive" as const,
        className: "",
        icon: XCircle,
        label: "Rejected",
      };
    default:
      return {
        variant: "secondary" as const,
        className: "text-muted-foreground",
        icon: FileX,
        label: "Not Submitted",
      };
  }
};

export function FeeStatusCard({
  feeType,
  feeData,
  onRefresh,
}: FeeStatusCardProps) {
  const [showReplaceForm, setShowReplaceForm] = useState(false);
  const statusConfig = getStatusConfig(feeData.status);
  const Icon = statusConfig.icon;
  const feeTypeLabel = feeType === "hostel" ? "Hostel Fee" : "Mess Fee";
  const description =
    feeType === "hostel"
      ? "Submit proof of hostel fee payment"
      : "Submit proof of mess fee payment";

  const hasDocument = !!feeData.documentUrl;
  // Allow replacement whenever document exists, regardless of status
  const canReplace = hasDocument;

  const handleReplaceSuccess = () => {
    setShowReplaceForm(false);
    onRefresh?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{feeTypeLabel}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={statusConfig.variant} className={statusConfig.className}>
            <Icon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasDocument && !showReplaceForm ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Submitted Document</h4>
                {canReplace && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReplaceForm(true)}
                    className="gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Replace
                  </Button>
                )}
              </div>
              <FeeDocumentViewer documentUrl={feeData.documentUrl!} feeType={feeType} />
            </div>
            {feeData.status === "rejected" && !showReplaceForm && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  {feeData.rejectionReason || "Your document was rejected. Please submit a new one."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <FeeSubmissionForm
            feeType={feeType}
            currentStatus={feeData.status}
            onSuccess={handleReplaceSuccess}
            isReplacement={showReplaceForm}
          />
        )}
      </CardContent>
    </Card>
  );
}
