import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "@/store";
import type { Complaint } from "@/features/complaints/complaintsSlice";
import type {
  DashboardMetrics,
  MessMenu,
  Student,
  FeeSubmission,
  MessFeedback,
  DetailedTab,
  PaginationState,
  ComplaintsFilters,
  StudentsFilters,
  FeesFilters,
  MessFilters,
} from "@/types/dashboard";

// Announcement type
export interface Announcement {
  _id: string;
  title: string;
  message: string;
  postedBy: {
    name: string;
    email: string;
    role: string;
  };
  fileUrl?: string;
  createdAt: string;
}

// Dashboard state
interface DashboardState {
  // Student dashboard
  metrics: DashboardMetrics | null;
  recentComplaints: Complaint[];
  recentAnnouncements: Announcement[];
  messMenu: MessMenu | null;
  
  // Warden/Admin detailed views
  detailedView: {
    activeTab: DetailedTab;
    isExpanded: boolean;
  };
  
  // Detailed data
  detailedComplaints: {
    items: Complaint[];
    filters: ComplaintsFilters;
    pagination: PaginationState;
    loading: boolean;
  };
  
  detailedStudents: {
    items: Student[];
    filters: StudentsFilters;
    pagination: PaginationState;
    loading: boolean;
  };
  
  detailedFees: {
    items: FeeSubmission[];
    filters: FeesFilters;
    pagination: PaginationState;
    loading: boolean;
  };
  
  detailedMessFeedback: {
    items: MessFeedback[];
    filters: MessFilters;
    pagination: PaginationState;
    loading: boolean;
  };
  
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  recentComplaints: [],
  recentAnnouncements: [],
  messMenu: null,
  
  detailedView: {
    activeTab: 'students',
    isExpanded: false,
  },
  
  detailedComplaints: {
    items: [],
    filters: {},
    pagination: { page: 1, limit: 20, total: 0 },
    loading: false,
  },
  
  detailedStudents: {
    items: [],
    filters: {},
    pagination: { page: 1, limit: 10, total: 0 },
    loading: false,
  },
  
  detailedFees: {
    items: [],
    filters: {},
    pagination: { page: 1, limit: 20, total: 0 },
    loading: false,
  },
  
  detailedMessFeedback: {
    items: [],
    filters: {},
    pagination: { page: 1, limit: 20, total: 0 },
    loading: false,
  },
  
  loading: false,
  error: null,
};

// Async thunks - Student
export const fetchStudentDashboardData = createAsyncThunk(
  "dashboard/fetchStudentDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("[Dashboard] Fetching student dashboard data...");
      
      // Fetch core data in parallel
      const [complaintsRes, feeRes, announcementsRes, menuRes] = await Promise.all([
        apiClient.get("/problem"),
        apiClient.get("/fee"),
        apiClient.get("/announcement"),
        apiClient.get("/mess/menu"),
      ]);

      console.log("[Dashboard] API Responses:", {
        complaints: complaintsRes.data,
        fees: feeRes.data,
        announcements: announcementsRes.data,
        menu: menuRes.data,
      });

      // Extract fee status from array response
      const feeData = feeRes.data.data?.[0] || feeRes.data.feeStatus;

      return {
        complaints: complaintsRes.data.problems || [],
        feeStatus: feeData,
        announcements: announcementsRes.data.data || [],
        messMenu: menuRes.data.menu,
      };
    } catch (error: any) {
      console.error("[Dashboard] Error fetching data:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch dashboard data";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchWardenDashboardData = createAsyncThunk(
  "dashboard/fetchWardenDashboardData",
  async (hostel: string, { rejectWithValue }) => {
    try {
      console.log(`[Dashboard] Fetching warden dashboard data for ${hostel}...`);
      
      // Note: Backend automatically filters by warden's hostel, no need to pass hostel param
      const [studentsRes, complaintsRes, feesRes, feedbackRes] = await Promise.all([
        apiClient.get(`/user/students/all`),
        apiClient.get(`/problem`),
        apiClient.get(`/fee`),
        apiClient.get(`/mess/feedback`).catch(() => ({ data: { feedbacks: [] } })),
      ]);

      const students = studentsRes.data.students || [];
      const complaints = complaintsRes.data.problems || [];
      const feedbacks = feedbackRes.data.feedbacks || [];
      
      console.log("[Warden Dashboard] Data loaded:", {
        studentsCount: students.length,
        complaintsCount: complaints.length,
        feedbackCount: feedbacks.length
      });

      const fees = feesRes.data.data || [];
      
      // Calculate fee stats
      const feeStats = fees.reduce((acc: any, fee: FeeSubmission) => {
        // Hostel Fee
        if (fee.hostelFee?.status) {
          acc.hostelFee.total++;
          if (fee.hostelFee.status === 'pending') acc.hostelFee.pending++;
        }
        // Mess Fee
        if (fee.messFee?.status) {
          acc.messFee.total++;
          if (fee.messFee.status === 'pending') acc.messFee.pending++;
        }
        return acc;
      }, {
        hostelFee: { total: 0, pending: 0 },
        messFee: { total: 0, pending: 0 }
      });
      
      return {
        students: students.length,
        complaints: {
          total: complaints.length,
          pending: complaints.filter((c: Complaint) => c.status === "Pending").length,
          resolved: complaints.filter((c: Complaint) => c.status === "Resolved").length,
          rejected: complaints.filter((c: Complaint) => c.status === "Rejected").length,
        },
        fees: feeStats,
        messFeedback: {
          total: feedbacks.length,
          avgRating: feedbacks.length > 0
            ? feedbacks.reduce((sum: number, f: MessFeedback) => sum + f.rating, 0) / feedbacks.length
            : 0,
        },
      };
    } catch (error: any) {
      console.error("[Dashboard] Error fetching warden data:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard data");
    }
  }
);

// Async thunks - Admin
export const fetchAdminDashboardData = createAsyncThunk(
  "dashboard/fetchAdminDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("[Dashboard] Fetching admin dashboard data...");
      
      // Fetch all data without hostel filtering
      const [studentsRes, complaintsRes, feesRes, feedbackRes] = await Promise.all([
        apiClient.get(`/user/students/all`),
        apiClient.get(`/problem`),
        apiClient.get(`/fee`),
        apiClient.get(`/mess/feedback`).catch(() => ({ data: { feedbacks: [] } })),
      ]);

      const students = studentsRes.data.students || [];
      const complaints = complaintsRes.data.problems || [];
      const feedbacks = feedbackRes.data.feedbacks || [];
      
      
      console.log("[Admin Dashboard] Data loaded:", {
        studentsCount: studentsRes.data.count || students.length,
        complaintsCount: complaints.length,
        feedbackCount: feedbackRes.data.count || feedbacks.length
      });

      const fees = feesRes.data.data || [];
      
      // Calculate fee stats
      const feeStats = fees.reduce((acc: any, fee: FeeSubmission) => {
        // Hostel Fee
        if (fee.hostelFee?.status) {
          acc.hostelFee.total++;
          if (fee.hostelFee.status === 'pending') acc.hostelFee.pending++;
        }
        // Mess Fee
        if (fee.messFee?.status) {
          acc.messFee.total++;
          if (fee.messFee.status === 'pending') acc.messFee.pending++;
        }
        return acc;
      }, {
        hostelFee: { total: 0, pending: 0 },
        messFee: { total: 0, pending: 0 }
      });
      
      return {
        students: studentsRes.data.count || students.length,
        complaints: {
          total: complaints.length,
          pending: complaints.filter((c: Complaint) => c.status === "Pending").length,
          resolved: complaints.filter((c: Complaint) => c.status === "Resolved").length,
          rejected: complaints.filter((c: Complaint) => c.status === "Rejected").length,
        },
        fees: feeStats,
        messFeedback: {
          total: feedbacks.length,
          avgRating: feedbacks.length > 0
            ? feedbacks.reduce((sum: number, f: MessFeedback) => sum + f.rating, 0) / feedbacks.length
            : 0,
        },
      };
    } catch (error: any) {
      console.error("[Dashboard] Error fetching admin data:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard data");
    }
  }
);

// Note: For wardens, backend automatically filters by their assigned hostel
export const fetchDetailedComplaints = createAsyncThunk(
  "dashboard/fetchDetailedComplaints",
  async (params: { hostel?: string; page?: number; filters?: ComplaintsFilters }, { rejectWithValue }) => {
    try {
      const { page = 1, filters = {} } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.hostel && filters.hostel !== 'all' && { hostel: filters.hostel }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
      });

      const res = await apiClient.get(`/problem?${queryParams}`);
      return {
        items: res.data.problems || [],
        total: res.data.total || res.data.problems?.length || 0,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch complaints");
    }
  }
);

export const fetchDetailedStudents = createAsyncThunk(
  "dashboard/fetchDetailedStudents",
  async (params: { hostel?: string; page?: number; filters?: StudentsFilters }, { rejectWithValue }) => {
    try {
      const { page = 1, filters = {} } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.hostel && filters.hostel !== 'all' && { hostel: filters.hostel }),
        ...(filters.year && filters.year !== 'all' && { year: filters.year }),
        ...(filters.query && { search: filters.query }),
      });

      const queryString = queryParams.toString();
      const res = await apiClient.get(`/user/students/all${queryString ? '?' + queryString : ''}`);
      const students = res.data.students || [];
      
      console.log('[Students] Fetched:', { count: students.length, page, filters });
      
      return {
        items: students,
        total: res.data.count || students.length,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch students");
    }
  }
);

export const fetchDetailedFees = createAsyncThunk(
  "dashboard/fetchDetailedFees",
  async (params: { hostel?: string; page?: number; filters?: FeesFilters }, { rejectWithValue }) => {
    try {
      const { page = 1, filters = {} } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.hostel && filters.hostel !== 'all' && { hostel: filters.hostel }),
        ...(filters.feeType && { feeType: filters.feeType }),
        ...(filters.status && { status: filters.status }),
      });

      const res = await apiClient.get(`/fee?${queryParams}`);
      return {
        items: res.data.data || [],
        total: res.data.total || res.data.data?.length || 0,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fees");
    }
  }
);

export const fetchDetailedMessFeedback = createAsyncThunk(
  "dashboard/fetchDetailedMessFeedback",
  async (params: { hostel?: string; page?: number; filters?: MessFilters }, { rejectWithValue }) => {
    try {
      const { page = 1, filters = {} } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.hostel && filters.hostel !== 'all' && { hostel: filters.hostel }),
        ...(filters.mealType && { mealType: filters.mealType }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
      });

      const res = await apiClient.get(`/mess/feedback?${queryParams}`);
      return {
        items: res.data.feedbacks || [],
        total: res.data.total || res.data.feedbacks?.length || 0,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch feedback");
    }
  }
);

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    setActiveTab: (state, action: PayloadAction<DetailedTab>) => {
      state.detailedView.activeTab = action.payload;
    },
    toggleDetailedView: (state) => {
      state.detailedView.isExpanded = !state.detailedView.isExpanded;
    },
    setComplaintsFilters: (state, action: PayloadAction<ComplaintsFilters>) => {
      state.detailedComplaints.filters = action.payload;
      state.detailedComplaints.pagination.page = 1;
    },
    setStudentsFilters: (state, action: PayloadAction<StudentsFilters>) => {
      state.detailedStudents.filters = action.payload;
      state.detailedStudents.pagination.page = 1;
    },
    setFeesFilters: (state, action: PayloadAction<FeesFilters>) => {
      state.detailedFees.filters = action.payload;
      state.detailedFees.pagination.page = 1;
    },
    setMessFilters: (state, action: PayloadAction<MessFilters>) => {
      state.detailedMessFeedback.filters = action.payload;
      state.detailedMessFeedback.pagination.page = 1;
    },
    setComplaintsPage: (state, action: PayloadAction<number>) => {
      state.detailedComplaints.pagination.page = action.payload;
    },
    setStudentsPage: (state, action: PayloadAction<number>) => {
      state.detailedStudents.pagination.page = action.payload;
    },
    setFeesPage: (state, action: PayloadAction<number>) => {
      state.detailedFees.pagination.page = action.payload;
    },
    setMessPage: (state, action: PayloadAction<number>) => {
      state.detailedMessFeedback.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Student Dashboard
      .addCase(fetchStudentDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        
        const { complaints, feeStatus, announcements, messMenu } = action.payload;

        // Calculate metrics
        state.metrics = {
          complaints: {
            total: complaints.length,
            pending: complaints.filter((c: Complaint) => c.status === "Pending").length,
            resolved: complaints.filter((c: Complaint) => c.status === "Resolved").length,
            rejected: complaints.filter((c: Complaint) => c.status === "Rejected").length,
          },
          fees: {
            hostelFee: feeStatus.hostelFee,
            messFee: feeStatus.messFee,
          },
        };

        // Store recent data (limit to 2 complaints, 3 announcements)
        state.recentComplaints = complaints.slice(0, 2);
        state.recentAnnouncements = announcements.slice(0, 3);
        state.messMenu = messMenu;
      })
      .addCase(fetchStudentDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Warden Dashboard
      .addCase(fetchWardenDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWardenDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = {
          ...action.payload,
        } as DashboardMetrics;
      })
      .addCase(fetchWardenDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Admin Dashboard
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = {
          ...action.payload,
        } as DashboardMetrics;
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Detailed Complaints
      .addCase(fetchDetailedComplaints.pending, (state) => {
        state.detailedComplaints.loading = true;
      })
      .addCase(fetchDetailedComplaints.fulfilled, (state, action) => {
        state.detailedComplaints.loading = false;
        state.detailedComplaints.items = action.payload.items;
        state.detailedComplaints.pagination.total = action.payload.total;
      })
      .addCase(fetchDetailedComplaints.rejected, (state) => {
        state.detailedComplaints.loading = false;
      })
      
      // Detailed Students
      .addCase(fetchDetailedStudents.pending, (state) => {
        state.detailedStudents.loading = true;
      })
      .addCase(fetchDetailedStudents.fulfilled, (state, action) => {
        state.detailedStudents.loading = false;
        state.detailedStudents.items = action.payload.items;
        state.detailedStudents.pagination.total = action.payload.total;
      })
      .addCase(fetchDetailedStudents.rejected, (state) => {
        state.detailedStudents.loading = false;
      })
      
      // Detailed Fees
      .addCase(fetchDetailedFees.pending, (state) => {
        state.detailedFees.loading = true;
      })
      .addCase(fetchDetailedFees.fulfilled, (state, action) => {
        state.detailedFees.loading = false;
        state.detailedFees.items = action.payload.items;
        state.detailedFees.pagination.total = action.payload.total;
      })
      .addCase(fetchDetailedFees.rejected, (state) => {
        state.detailedFees.loading = false;
      })
      
      // Detailed Mess Feedback
      .addCase(fetchDetailedMessFeedback.pending, (state) => {
        state.detailedMessFeedback.loading = true;
      })
      .addCase(fetchDetailedMessFeedback.fulfilled, (state, action) => {
        state.detailedMessFeedback.loading = false;
        state.detailedMessFeedback.items = action.payload.items;
        state.detailedMessFeedback.pagination.total = action.payload.total;
      })
      .addCase(fetchDetailedMessFeedback.rejected, (state) => {
        state.detailedMessFeedback.loading = false;
      });
  },
});

export const {
  clearDashboardError,
  setActiveTab,
  toggleDetailedView,
  setComplaintsFilters,
  setStudentsFilters,
  setFeesFilters,
  setMessFilters,
  setComplaintsPage,
  setStudentsPage,
  setFeesPage,
  setMessPage,
} = dashboardSlice.actions;

// Selectors
export const selectDashboardState = (state: RootState) => state.dashboard;
export const selectDashboardMetrics = (state: RootState) => state.dashboard.metrics;
export const selectRecentComplaints = (state: RootState) => state.dashboard.recentComplaints;
export const selectRecentAnnouncements = (state: RootState) => state.dashboard.recentAnnouncements;
export const selectMessMenu = (state: RootState) => state.dashboard.messMenu;
export const selectDetailedView = (state: RootState) => state.dashboard.detailedView;
export const selectDetailedComplaints = (state: RootState) => state.dashboard.detailedComplaints;
export const selectDetailedStudents = (state: RootState) => state.dashboard.detailedStudents;
export const selectDetailedFees = (state: RootState) => state.dashboard.detailedFees;
export const selectDetailedMessFeedback = (state: RootState) => state.dashboard.detailedMessFeedback;

export default dashboardSlice.reducer;
