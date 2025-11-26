import { CheckCircle2 } from "lucide-react";

interface SubmissionStatusMessageProps {
  status: "pending" | "approved";
}

export function SubmissionStatusMessage({
  status,
}: SubmissionStatusMessageProps) {
  if (status === "pending") {
    return (
      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        <p>
          Your document is currently under review. You cannot submit a new
          document at this time.
        </p>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <p>Your fee has been approved. No further action needed.</p>
        </div>
      </div>
    );
  }

  return null;
}

