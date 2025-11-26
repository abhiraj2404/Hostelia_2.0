export type BadgeVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "primary"
  | "success";

export type FeeStatus =
  | "documentNotSubmitted"
  | "pending"
  | "approved"
  | "rejected";

export interface StatusBadgeConfig {
  variant: BadgeVariant;
  className: string;
  label: string;
}

export const getStatusBadge = (status: string): StatusBadgeConfig => {
  const variants: Record<string, StatusBadgeConfig> = {
    approved: {
      variant: "default",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      label: "Approved",
    },
    pending: {
      variant: "outline",
      className:
        "border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400",
      label: "Pending",
    },
    rejected: {
      // Match the complaints dashboard rejected badge: subtle red background
      // with red text and an outline-style badge.
      variant: "outline",
      className:
        "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-800",
      label: "Rejected",
    },
    documentNotSubmitted: {
      variant: "secondary",
      className: "text-muted-foreground",
      label: "Not Submitted",
    },
  };

  return variants[status] || variants.documentNotSubmitted;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
    documentNotSubmitted: "Not Submitted",
  };
  return labels[status] || status;
};
