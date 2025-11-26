import { apiClient } from "@/lib/api-client";
import type { FeeSubmission } from "@/types/dashboard";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface FeesState {
  items: FeeSubmission[];
  loading: boolean;
  error: string | null;
  submitLoading: {
    hostel: boolean;
    mess: boolean;
  };
  updateLoading: Record<string, boolean>; // studentId -> loading state
  notificationLoading: Record<string, boolean>; // studentId -> loading state
}

const initialState: FeesState = {
  items: [],
  loading: false,
  error: null,
  submitLoading: {
    hostel: false,
    mess: false,
  },
  updateLoading: {},
  notificationLoading: {},
};

// Fetch all fees (role-based: student sees own, admin/warden see filtered)
export const fetchFees = createAsyncThunk<
  FeeSubmission[],
  void,
  { rejectValue: string }
>("fees/fetchFees", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/fee");
    if (response.data?.success) {
      return response.data.data || [];
    }
    return rejectWithValue(response.data?.message || "Failed to fetch fees");
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to fetch fees");
  }
});

// Submit hostel fee document
export const submitHostelFee = createAsyncThunk<
  FeeSubmission,
  File,
  { rejectValue: string }
>("fees/submitHostelFee", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("documentImage", file);

    const response = await apiClient.post("/fee/hostel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data?.success) {
      return response.data.data;
    }
    return rejectWithValue(
      response.data?.message || "Failed to submit hostel fee"
    );
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to submit hostel fee");
  }
});

// Submit mess fee document
export const submitMessFee = createAsyncThunk<
  FeeSubmission,
  File,
  { rejectValue: string }
>("fees/submitMessFee", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("documentImage", file);

    const response = await apiClient.post("/fee/mess", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data?.success) {
      return response.data.data;
    }
    return rejectWithValue(
      response.data?.message || "Failed to submit mess fee"
    );
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to submit mess fee");
  }
});

// Update fee status (admin only)
export const updateFeeStatus = createAsyncThunk<
  FeeSubmission,
  {
    studentId: string;
    hostelFeeStatus?:
      | "documentNotSubmitted"
      | "pending"
      | "approved"
      | "rejected";
    messFeeStatus?:
      | "documentNotSubmitted"
      | "pending"
      | "approved"
      | "rejected";
  },
  { rejectValue: string }
>(
  "fees/updateFeeStatus",
  async (
    { studentId, hostelFeeStatus, messFeeStatus },
    { rejectWithValue }
  ) => {
    try {
      const body: {
        hostelFeeStatus?:
          | "documentNotSubmitted"
          | "pending"
          | "approved"
          | "rejected";
        messFeeStatus?:
          | "documentNotSubmitted"
          | "pending"
          | "approved"
          | "rejected";
      } = {};
      if (hostelFeeStatus !== undefined) {
        body.hostelFeeStatus = hostelFeeStatus;
      }
      if (messFeeStatus !== undefined) {
        body.messFeeStatus = messFeeStatus;
      }

      const response = await apiClient.patch(`/fee/${studentId}/status`, body);

      if (response.data?.success) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to update fee status"
      );
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      return rejectWithValue(errorMessage || "Failed to update fee status");
    }
  }
);

// Send fee reminder notification (admin/warden)
export const sendFeeReminder = createAsyncThunk<
  { success: boolean; message: string },
  {
    studentId: string;
    emailType: "hostelFee" | "messFee" | "both";
    notes?: string;
  },
  { rejectValue: string }
>(
  "fees/sendFeeReminder",
  async ({ studentId, emailType, notes }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/fee/email/reminder", {
        studentId,
        emailType,
        notes,
      });

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Notification sent successfully",
        };
      }
      return rejectWithValue(
        response.data?.message || "Failed to send notification"
      );
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      return rejectWithValue(errorMessage || "Failed to send notification");
    }
  }
);

const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch fees
    builder
      .addCase(fetchFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch fees";
      });

    // Submit hostel fee
    builder
      .addCase(submitHostelFee.pending, (state) => {
        state.submitLoading.hostel = true;
        state.error = null;
      })
      .addCase(submitHostelFee.fulfilled, (state, action) => {
        state.submitLoading.hostel = false;
        // Update or add the fee submission
        const index = state.items.findIndex(
          (item) => item.studentId === action.payload.studentId
        );
        if (index >= 0) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(submitHostelFee.rejected, (state, action) => {
        state.submitLoading.hostel = false;
        state.error = action.payload || "Failed to submit hostel fee";
      });

    // Submit mess fee
    builder
      .addCase(submitMessFee.pending, (state) => {
        state.submitLoading.mess = true;
        state.error = null;
      })
      .addCase(submitMessFee.fulfilled, (state, action) => {
        state.submitLoading.mess = false;
        // Update or add the fee submission
        const index = state.items.findIndex(
          (item) => item.studentId === action.payload.studentId
        );
        if (index >= 0) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(submitMessFee.rejected, (state, action) => {
        state.submitLoading.mess = false;
        state.error = action.payload || "Failed to submit mess fee";
      });

    // Update fee status
    builder
      .addCase(updateFeeStatus.pending, (state, action) => {
        state.updateLoading[action.meta.arg.studentId] = true;
        state.error = null;
      })
      .addCase(updateFeeStatus.fulfilled, (state, action) => {
        const studentId = action.meta.arg.studentId;
        state.updateLoading[studentId] = false;
        // Update the fee submission
        const index = state.items.findIndex(
          (item) => item.studentId === action.payload.studentId
        );
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateFeeStatus.rejected, (state, action) => {
        const studentId = action.meta.arg.studentId;
        state.updateLoading[studentId] = false;
        state.error = action.payload || "Failed to update fee status";
      });

    // Send fee reminder
    builder
      .addCase(sendFeeReminder.pending, (state, action) => {
        state.notificationLoading[action.meta.arg.studentId] = true;
        state.error = null;
      })
      .addCase(sendFeeReminder.fulfilled, (state, action) => {
        const studentId = action.meta.arg.studentId;
        state.notificationLoading[studentId] = false;
      })
      .addCase(sendFeeReminder.rejected, (state, action) => {
        const studentId = action.meta.arg.studentId;
        state.notificationLoading[studentId] = false;
        state.error = action.payload || "Failed to send notification";
      });
  },
});

export const { clearError } = feesSlice.actions;
export default feesSlice.reducer;
