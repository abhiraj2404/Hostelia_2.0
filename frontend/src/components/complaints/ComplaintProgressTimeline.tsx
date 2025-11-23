import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Complaint } from "@/features/complaints/complaintsSlice";
import { cn } from "@/lib/utils";
import { Check, Circle, X } from "lucide-react";

type ComplaintProgressTimelineProps = {
  complaint: Complaint;
};

type Stage = {
  label: string;
  status: "completed" | "current" | "pending" | "rejected";
  timestamp?: string | null;
};

export function ComplaintProgressTimeline({
  complaint,
}: ComplaintProgressTimelineProps) {
  const stages: Stage[] = [];

  // Stage 1: Registered (always completed)
  stages.push({
    label: "Registered",
    status: "completed",
    timestamp: complaint.createdAt,
  });

  // Stage 2: Under Review
  if (complaint.status === "Pending") {
    stages.push({
      label: "Under Review",
      status: "current",
      timestamp: complaint.updatedAt,
    });
  } else if (complaint.status === "Rejected") {
    stages.push({
      label: "Rejected",
      status: "rejected",
      timestamp: complaint.updatedAt,
    });
  } else {
    stages.push({
      label: "Under Review",
      status: "completed",
      timestamp: complaint.updatedAt,
    });
  }

  // Stage 3: Awaiting Confirmation (only if warden resolved)
  if (complaint.status === "ToBeConfirmed") {
    stages.push({
      label: "Awaiting Confirmation",
      status: "current",
      timestamp: complaint.resolvedAt,
    });
    stages.push({
      label: "Resolved",
      status: "pending",
    });
  } else if (complaint.status === "Resolved") {
    stages.push({
      label: "Awaiting Confirmation",
      status: "completed",
      timestamp: complaint.resolvedAt,
    });
    stages.push({
      label: "Resolved",
      status: "completed",
      timestamp: complaint.studentVerifiedAt,
    });
  } else if (complaint.status !== "Rejected") {
    stages.push({
      label: "Awaiting Confirmation",
      status: "pending",
    });
    stages.push({
      label: "Resolved",
      status: "pending",
    });
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
        <CardTitle className="text-lg">Progress Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {stages.map((stage, index) => (
              <div key={index} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
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
                    <Check className="h-4 w-4" />
                  )}
                  {stage.status === "current" && (
                    <Circle className="h-4 w-4 fill-current" />
                  )}
                  {stage.status === "pending" && <Circle className="h-4 w-4" />}
                  {stage.status === "rejected" && <X className="h-4 w-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      "font-medium text-sm",
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
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
