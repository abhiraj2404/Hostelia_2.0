// User Management TypeScript Types

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "warden" | "collegeAdmin";
  rollNo?: string;
  hostelId?: string;
  messId?: string | null;
  roomNo?: string;
  collegeId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Student extends User {
  role: "student";
  rollNo: string;
  hostelId: string;
  messId?: string | null;
  roomNo: string;
}

export interface Warden extends User {
  role: "warden";
  hostelId: string;
}

export interface UserManagementFilters {
  hostel?: string;
  query?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  rollNo?: string;
  hostelId?: string;
  messId?: string | null;
  roomNo?: string;
}

export interface WardenCreateData {
  name: string;
  email: string;
  hostelId: string;
  password: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}
