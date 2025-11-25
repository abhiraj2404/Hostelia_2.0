import {
  FileText,
  DollarSign,
  Plus,
  Receipt,
  MessageSquare,
  Bell,
  Utensils,
} from "lucide-react";
import type { QuickAction } from "@/types/dashboard";

// Quick Actions for Student
export const studentQuickActions: QuickAction[] = [
  {
    label: "Create Complaint",
    path: "/complaints/new",
    icon: Plus,
    primary: true,
  },
  {
    label: "Submit Fee Payment",
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
export const feeStatusConfig: Record<string, {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  color: string;
}> = {
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
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
};
