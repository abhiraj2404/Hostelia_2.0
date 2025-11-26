import { Badge } from "@/components/ui/badge";
import { getStatusBadge } from "../utils/feeUtils";

interface FeeStatusBadgeProps {
  status: string;
  className?: string;
}

export function FeeStatusBadge({ status, className }: FeeStatusBadgeProps) {
  const badgeConfig = getStatusBadge(status);

  return (
    <Badge
      variant={badgeConfig.variant}
      className={`${badgeConfig.className} ${className || ""}`}
    >
      {badgeConfig.label}
    </Badge>
  );
}

