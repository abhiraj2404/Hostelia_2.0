import {
  AlertTriangle,
  Bug,
  CheckCircle,
  Clock,
  Hammer,
  HelpCircle,
  Paintbrush,
  Sofa,
  Sparkles,
  Trash2,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

export type ComplaintMetric = {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

export type ComplaintStatusOption = {
  label: string;
  value: "Pending" | "Resolved" | "Rejected" | "ToBeConfirmed" | "all";
};

export type ComplaintCategoryOption = {
  label: string;
  value:
    | "Electrical"
    | "Plumbing"
    | "Painting"
    | "Carpentry"
    | "Cleaning"
    | "Internet"
    | "Furniture"
    | "Pest Control"
    | "Other"
    | "all";
  icon?: LucideIcon;
};

export const complaintStatusOptions: ComplaintStatusOption[] = [
  { label: "All Status", value: "all" },
  { label: "Under Review", value: "Pending" },
  { label: "Awaiting Confirmation", value: "ToBeConfirmed" },
  { label: "Resolved", value: "Resolved" },
  { label: "Rejected", value: "Rejected" },
];

export const complaintCategoryOptions: ComplaintCategoryOption[] = [
  { label: "All Categories", value: "all" },
  { label: "Electrical", value: "Electrical", icon: Zap },
  { label: "Plumbing", value: "Plumbing", icon: Wrench },
  { label: "Painting", value: "Painting", icon: Paintbrush },
  { label: "Carpentry", value: "Carpentry", icon: Hammer },
  { label: "Cleaning", value: "Cleaning", icon: Trash2 },
  { label: "Internet", value: "Internet", icon: Wifi },
  { label: "Furniture", value: "Furniture", icon: Sofa },
  { label: "Pest Control", value: "Pest Control", icon: Bug },
  { label: "Other", value: "Other", icon: HelpCircle },
];

export const createComplaintMetrics = (counts: {
  total: number;
  pending: number;
  resolved: number;
  awaiting: number;
  rejected: number;
}): ComplaintMetric[] => [
  {
    label: "Total Complaints",
    value: counts.total,
    helper: "All submissions",
    icon: Sparkles,
    tone: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Under Review",
    value: counts.pending,
    helper: "Being processed",
    icon: Clock,
    tone: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Awaiting Confirmation",
    value: counts.awaiting,
    helper: "Student verification",
    icon: AlertTriangle,
    tone: "bg-purple-500/10 text-purple-600",
  },
  {
    label: "Resolved",
    value: counts.resolved,
    helper: "Completed",
    icon: CheckCircle,
    tone: "bg-emerald-500/10 text-emerald-600",
  },
];

export const formatComplaintDate = (value: string | null) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const getComplaintCategoryIcon = (category: string) => {
  const option = complaintCategoryOptions.find((opt) => opt.value === category);
  const Icon = option?.icon ?? HelpCircle;
  return React.createElement(Icon, { className: "h-6 w-6 text-primary" });
};
