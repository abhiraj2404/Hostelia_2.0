import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeeSubmission } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { Check, Circle, X } from "lucide-react";

type FeeProgressTimelineProps = {
  feeData: FeeSubmission["hostelFee"] | FeeSubmission["messFee"];
  feeType: "hostel" | "mess";
  createdAt?: string;
  updatedAt?: string;
};

type Stage = {
  label: string;
  status: "completed" | "current" | "pending" | "rejected";
  timestamp?: string | null;
};

export function FeeProgressTimeline({
  feeData,
  feeType,
  createdAt,
  updatedAt,
}: FeeProgressTimelineProps) {
  const stages: Stage[] = [];

  // Stage 1: Not Submitted or Submitted
  if (feeData.status === "documentNotSubmitted") {
    stages.push({
      label: "Not Submitted",
      status: "current",
      timestamp: null,
    });
    stages.push({
      label: "Under Review",
      status: "pending",
    });
    stages.push({
      label: feeData.status === "rejected" ? "Rejected" : "Approved",
      status: "pending",
    });
  } else {
    // Document has been submitted
    stages.push({
      label: "Submitted",
      status: "completed",
      timestamp: feeData.submittedAt || createdAt,
    });

    // Stage 2: Under Review
    if (feeData.status === "pending") {
      stages.push({
        label: "Under Review",
        status: "current",
        timestamp: null, // No timestamp for current stage
      });
      stages.push({
        label: "Approved",
        status: "pending",
      });
    } else if (feeData.status === "rejected") {
      stages.push({
        label: "Under Review",
        status: "completed",
        timestamp: feeData.submittedAt || createdAt,
      });
      stages.push({
        label: "Rejected",
        status: "rejected",
        timestamp: updatedAt,
      });
    } else if (feeData.status === "approved") {
      stages.push({
        label: "Under Review",
        status: "completed",
        timestamp: feeData.submittedAt || createdAt,
      });
      stages.push({
        label: "Approved",
        status: "completed",
        timestamp: updatedAt,
      });
    }
  }

  const formatDate = (timestamp?: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {feeType === "hostel" ? "Hostel" : "Mess"} Fee Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal timeline - responsive: vertical on mobile, horizontal on larger screens */}
        <div className="relative">
          {/* Progress line - horizontal on desktop, vertical on mobile */}
          <div className="hidden md:block absolute top-4 left-0 right-0 h-0.5 bg-border" />
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {/* Stages container - flex-col on mobile, flex-row on desktop */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-2">
            {stages.map((stage, index) => (
              <div
                key={index}
                className="relative flex md:flex-col items-start md:items-center gap-3 md:gap-2 flex-1"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    stage.status === "completed" &&
                      "border-primary bg-primary text-primary-foreground",
                    stage.status === "current" &&
                      "border-primary bg-background text-primary animate-pulse",
                    stage.status === "pending" &&
                      "border-muted-foreground/30 bg-background text-muted-foreground",
                    stage.status === "rejected" &&
                      "border-destructive bg-destructive text-destructive-foreground"
                  )}
                >
                  {stage.status === "completed" && (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                  {stage.status === "current" && (
                    <Circle className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                  )}
                  {stage.status === "pending" && (
                    <Circle className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                  {stage.status === "rejected" && (
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 md:text-center min-w-0">
                  <p
                    className={cn(
                      "font-medium text-sm md:text-xs",
                      stage.status === "completed" &&
                        "text-foreground font-semibold",
                      stage.status === "current" && "text-primary font-bold",
                      stage.status === "pending" && "text-muted-foreground",
                      stage.status === "rejected" &&
                        "text-destructive font-semibold"
                    )}
                  >
                    {stage.label}
                  </p>
                  {stage.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(stage.timestamp)}
                    </p>
                  )}
                </div>

                {/* Connector line between stages (desktop only) */}
                {index < stages.length - 1 && (
                  <div className="hidden md:block absolute top-4 left-full w-full h-0.5 bg-border -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

