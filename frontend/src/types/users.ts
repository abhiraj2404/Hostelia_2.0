// User Management TypeScript Types

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "warden" | "admin";
  rollNo?: string;
  year?: "UG-1" | "UG-2" | "UG-3" | "UG-4";
  hostel?: "BH-1" | "BH-2" | "BH-3" | "BH-4";
  roomNo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Student extends User {
  role: "student";
  rollNo: string;
  year: "UG-1" | "UG-2" | "UG-3" | "UG-4";
  hostel: "BH-1" | "BH-2" | "BH-3" | "BH-4";
  roomNo: string;
}

export interface Warden extends User {
  role: "warden";
  hostel: "BH-1" | "BH-2" | "BH-3" | "BH-4";
}

export interface UserManagementFilters {
  hostel?: "BH-1" | "BH-2" | "BH-3" | "BH-4" | "all";
  year?: "UG-1" | "UG-2" | "UG-3" | "UG-4" | "all";
  query?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  rollNo?: string;
  year?: "UG-1" | "UG-2" | "UG-3" | "UG-4";
  hostel?: "BH-1" | "BH-2" | "BH-3" | "BH-4";
  roomNo?: string;
}

export interface WardenAppointData {
  userId: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

