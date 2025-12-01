// Dashboard TypeScript Types

// Fee Status Structure (for student dashboards)
export interface FeeStatus {
  status: "documentNotSubmitted" | "pending" | "approved" | "rejected";
  documentUrl?: string;
  submittedAt?: string;
  rejectionReason?: string;
}

// Fee Stats Structure (for warden/admin dashboards)
export interface FeeStats {
  total: number;
  pending: number;
}

// Type guard to check if fee is FeeStatus
export function isFeeStatus(fee: FeeStatus | FeeStats): fee is FeeStatus {
  return "status" in fee;
}

// Type guard to check if fee is FeeStats
export function isFeeStats(fee: FeeStatus | FeeStats): fee is FeeStats {
  return "total" in fee && "pending" in fee;
}

// Dashboard Metrics
export interface DashboardMetrics {
  complaints: {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
  };
  fees: {
    hostelFee: FeeStatus | FeeStats;
    messFee: FeeStatus | FeeStats;
    pending?: number; // Combined pending count for metric card
  };
  students?: number;
  messFeedback?: {
    total: number;
    avgRating: number;
  };
}

// Student
export interface Student {
  _id: string;
  name: string;
  email: string;
  rollNo?: string;
  hostel: string;
  roomNo: string;
  year: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

// Fee Submission
export interface FeeSubmission {
  _id: string;
  studentId: string; // Not populated - just ObjectId
  studentName: string;
  studentEmail: string;
  hostelFee: {
    status: "documentNotSubmitted" | "pending" | "approved" | "rejected";
    documentUrl?: string;
    submittedAt?: string;
    rejectionReason?: string;
  };
  messFee: {
    status: "documentNotSubmitted" | "pending" | "approved" | "rejected";
    documentUrl?: string;
    submittedAt?: string;
    rejectionReason?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Mess Feedback
export interface MessFeedback {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email?: string;
    rollNo?: string;
    hostel?: string;
    roomNo?: string;
    year?: string;
  };
  day: string;
  mealType: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Quick Action
export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  primary?: boolean;
  variant?: "default" | "outline" | "ghost";
}

// Metric Card Data
export interface MetricCardData {
  label: string;
  value: number | string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  onClick?: () => void;
  isActive?: boolean;
}

// Mess Menu
export interface MessMenu {
  [key: string]: Record<string, string[]>;
  Monday: Record<string, string[]>;
  Tuesday: Record<string, string[]>;
  Wednesday: Record<string, string[]>;
  Thursday: Record<string, string[]>;
  Friday: Record<string, string[]>;
  Saturday: Record<string, string[]>;
  Sunday: Record<string, string[]>;
}

// Detailed View Types
export type DetailedTab = "complaints" | "students" | "fees" | "mess" | "users" | "wardens";

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface ComplaintsFilters {
  hostel?: string;
  status?: string;
  category?: string;
}

export interface StudentsFilters {
  hostel?: string;
  year?: string;
  query?: string;
}

export interface FeesFilters {
  hostel?: string;
  feeType?: string;
  status?: string;
}

export interface MessFilters {
  hostel?: string;
  day?: string;
  mealType?: string;
  dateRange?: string;
}

export interface WardenFilters {
  hostel?: string;
  query?: string;
}

// Warden type (for dashboard detailed view)
export interface Warden {
  _id: string;
  name: string;
  email: string;
  hostel: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

