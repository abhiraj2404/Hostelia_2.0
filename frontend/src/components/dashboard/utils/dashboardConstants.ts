import type { QuickAction } from "@/types/dashboard";
import {
  Bell,
  DollarSign,
  FileText,
  MessageSquare,
  Plus,
  Receipt,
  Utensils,
} from "lucide-react";

// Quick Actions for Student
export const studentQuickActions: QuickAction[] = [
  {
    label: "Create Complaint",
    path: "/complaints/new",
    icon: Plus,
    primary: true,
  },
  {
    label: "Submit Fee Receipts",
    path: "/fees",
    icon: Receipt,
  },
  {
    label: "Give Mess Feedback",
    path: "/mess",
    icon: MessageSquare,
  },
  {
    label: "View Announcements",
    path: "/announcements",
    icon: Bell,
  },
];

// Metric icons
export const metricIcons = {
  complaints: FileText,
  fees: DollarSign,
  menu: Utensils,
  mess: Utensils,
  students: Bell, // Using Bell temporarily
};

// Status badge colors
export const statusColors = {
  resolved: "bg-green-50 dark:bg-green-950/20 text-green-600",
  pending: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600",
  rejected: "bg-red-50 dark:bg-red-950/20 text-red-600",
};

// Fee status badge variants
export const feeStatusConfig = {
  documentNotSubmitted: {
    label: "Not Submitted",
    variant: "secondary" as const,
    color: "text-muted-foreground",
  },
  pending: {
    label: "Pending Review",
    variant: "outline" as const,
    color: "text-yellow-600",
  },
  accepted: {
    label: "Accepted",
    variant: "default" as const,
    color: "text-green-600",
  },
  approved: {
    label: "Approved",
    variant: "default" as const,
    color: "text-green-600",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

// Helper functions
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Guard against future timestamps or clock skew so we never show negative days
  const rawDiffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffDays = rawDiffDays < 0 ? 0 : rawDiffDays;

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export const getCurrentDay = (): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};
