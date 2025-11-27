import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import type { User, Student, Warden, UserFormData, WardenAppointData, UserManagementFilters } from "@/types/users";

interface UsersState {
  students: Student[];
  wardens: Warden[];
  studentsLoading: boolean;
  wardensLoading: boolean;
  updateLoading: Record<string, boolean>; // userId -> loading state
  deleteLoading: Record<string, boolean>; // userId -> loading state
  appointLoading: boolean;
  removeLoading: Record<string, boolean>; // userId -> loading state
  studentsFilters: UserManagementFilters;
  wardensFilters: UserManagementFilters;
  studentsPagination: {
    page: number;
    limit: number;
    total: number;
  };
  wardensPagination: {
    page: number;
    limit: number;
    total: number;
  };
  error: string | null;
}

const initialState: UsersState = {
  students: [],
  wardens: [],
  studentsLoading: false,
  wardensLoading: false,
  updateLoading: {},
  deleteLoading: {},
  appointLoading: false,
  removeLoading: {},
  studentsFilters: {},
  wardensFilters: {},
  studentsPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  wardensPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  error: null,
};

// Fetch all students (admin gets all, warden gets their hostel only)
export const fetchStudents = createAsyncThunk<
  Student[],
  void,
  { rejectValue: string }
>("users/fetchStudents", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/user/students/all");
    if (response.data?.success) {
      return response.data.students || [];
    }
    return rejectWithValue(response.data?.message || "Failed to fetch students");
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to fetch students");
  }
});

// Fetch all wardens (admin only)
export const fetchWardens = createAsyncThunk<
  Warden[],
  void,
  { rejectValue: string }
>("users/fetchWardens", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/user/wardens/all");
    if (response.data?.success) {
      return response.data.wardens || [];
    }
    return rejectWithValue(response.data?.message || "Failed to fetch wardens");
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to fetch wardens");
  }
});

// Update user details
export const updateUser = createAsyncThunk<
  User,
  { userId: string; data: Partial<UserFormData> },
  { rejectValue: string }
>("users/updateUser", async ({ userId, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/user/update/${userId}`, data);
    if (response.data?.success) {
      return response.data.user;
    }
    return rejectWithValue(response.data?.message || "Failed to update user");
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to update user");
  }
});

// Delete user
export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    const response = await apiClient.delete(`/user/${userId}`);
    if (response.data?.success) {
      return userId;
    }
    return rejectWithValue(response.data?.message || "Failed to delete user");
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to delete user");
  }
});

// Appoint student as warden
export const appointWarden = createAsyncThunk<
  Warden,
  WardenAppointData,
  { rejectValue: string }
>("users/appointWarden", async (data, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/warden/appoint", data);
    if (response.data?.success) {
      return response.data.warden;
    }
    return rejectWithValue(response.data?.message || "Failed to appoint warden");
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to appoint warden");
  }
});

// Remove warden (downgrade to student)
export const removeWarden = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/removeWarden", async (userId, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/warden/remove", { userId });
    if (response.data?.success) {
      return response.data.user;
    }
    return rejectWithValue(response.data?.message || "Failed to remove warden");
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return rejectWithValue(errorMessage || "Failed to remove warden");
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setStudentsFilters: (state, action: PayloadAction<UserManagementFilters>) => {
      state.studentsFilters = action.payload;
      state.studentsPagination.page = 1; // Reset to first page on filter change
    },
    setWardensFilters: (state, action: PayloadAction<UserManagementFilters>) => {
      state.wardensFilters = action.payload;
      state.wardensPagination.page = 1; // Reset to first page on filter change
    },
    setStudentsPage: (state, action: PayloadAction<number>) => {
      state.studentsPagination.page = action.payload;
    },
    setWardensPage: (state, action: PayloadAction<number>) => {
      state.wardensPagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch students
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.studentsLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.students = action.payload;
        state.studentsPagination.total = action.payload.length;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.error = action.payload || "Failed to fetch students";
      });

    // Fetch wardens
    builder
      .addCase(fetchWardens.pending, (state) => {
        state.wardensLoading = true;
        state.error = null;
      })
      .addCase(fetchWardens.fulfilled, (state, action) => {
        state.wardensLoading = false;
        state.wardens = action.payload;
        state.wardensPagination.total = action.payload.length;
      })
      .addCase(fetchWardens.rejected, (state, action) => {
        state.wardensLoading = false;
        state.error = action.payload || "Failed to fetch wardens";
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state, action) => {
        state.updateLoading[action.meta.arg.userId] = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const userId = action.meta.arg.userId;
        state.updateLoading[userId] = false;
        
        // Update in students array if exists
        const studentIndex = state.students.findIndex((s) => s._id === userId);
        if (studentIndex >= 0) {
          state.students[studentIndex] = action.payload as Student;
        }
        
        // Update in wardens array if exists
        const wardenIndex = state.wardens.findIndex((w) => w._id === userId);
        if (wardenIndex >= 0) {
          state.wardens[wardenIndex] = action.payload as Warden;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        const userId = action.meta.arg.userId;
        state.updateLoading[userId] = false;
        state.error = action.payload || "Failed to update user";
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state, action) => {
        state.deleteLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.deleteLoading[userId] = false;
        
        // Remove from students array
        state.students = state.students.filter((s) => s._id !== userId);
        state.studentsPagination.total = state.students.length;
        
        // Remove from wardens array
        state.wardens = state.wardens.filter((w) => w._id !== userId);
        state.wardensPagination.total = state.wardens.length;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.deleteLoading[userId] = false;
        state.error = action.payload || "Failed to delete user";
      });

    // Appoint warden
    builder
      .addCase(appointWarden.pending, (state) => {
        state.appointLoading = true;
        state.error = null;
      })
      .addCase(appointWarden.fulfilled, (state, action) => {
        state.appointLoading = false;
        // Remove from students array
        state.students = state.students.filter((s) => s._id !== action.payload._id);
        state.studentsPagination.total = state.students.length;
        // Add to wardens array
        state.wardens.push(action.payload);
        state.wardensPagination.total = state.wardens.length;
      })
      .addCase(appointWarden.rejected, (state, action) => {
        state.appointLoading = false;
        state.error = action.payload || "Failed to appoint warden";
      });

    // Remove warden
    builder
      .addCase(removeWarden.pending, (state, action) => {
        state.removeLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(removeWarden.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        state.removeLoading[userId] = false;
        // Remove from wardens array
        state.wardens = state.wardens.filter((w) => w._id !== userId);
        state.wardensPagination.total = state.wardens.length;
        // Note: The user is now a student, but we don't add them back to students
        // because they need to be fetched separately if needed
      })
      .addCase(removeWarden.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.removeLoading[userId] = false;
        state.error = action.payload || "Failed to remove warden";
      });
  },
});

export const {
  setStudentsFilters,
  setWardensFilters,
  setStudentsPage,
  setWardensPage,
  clearError,
} = usersSlice.actions;

// Selectors
export const selectUsersState = (state: { users: UsersState }) => state.users;
export const selectStudents = (state: { users: UsersState }) => state.users.students;
export const selectWardens = (state: { users: UsersState }) => state.users.wardens;
export const selectStudentsLoading = (state: { users: UsersState }) => state.users.studentsLoading;
export const selectWardensLoading = (state: { users: UsersState }) => state.users.wardensLoading;

export default usersSlice.reducer;

