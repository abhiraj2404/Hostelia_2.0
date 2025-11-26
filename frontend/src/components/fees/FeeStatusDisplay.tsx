import type { FeeSubmission } from "@/types/dashboard";
import { FeeStatusCard } from "./components/FeeStatusCard";

interface FeeStatusDisplayProps {
  feeSubmission: FeeSubmission | null;
  onRefresh?: () => void;
}

export function FeeStatusDisplay({
  feeSubmission,
  onRefresh,
}: FeeStatusDisplayProps) {
  if (!feeSubmission) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No fee submission found. Please contact admin.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FeeStatusCard
        feeType="hostel"
        feeData={feeSubmission.hostelFee}
        onRefresh={onRefresh}
      />
      <FeeStatusCard
        feeType="mess"
        feeData={feeSubmission.messFee}
        onRefresh={onRefresh}
      />
    </div>
  );
}
