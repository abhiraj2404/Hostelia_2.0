import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/lib/api-client";
import type { RootState } from "@/store";

// Types
export interface TransitEntry {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNo: string;
    hostel: string;
    roomNo: string;
  };
  purpose: string;
  transitStatus: "ENTRY" | "EXIT";
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransitData {
  purpose: string;
  transitStatus: "ENTRY" | "EXIT";
  date?: Date;
  time?: string;
}

interface TransitState {
  entries: TransitEntry[];
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  listError: string | null;

  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null;
  lastCreatedEntry: TransitEntry | null;
}

const initialState: TransitState = {
  entries: [],
  listStatus: "idle",
  listError: null,

  createStatus: "idle",
  createError: null,
  lastCreatedEntry: null,
};

// Async thunks
export const fetchTransitEntries = createAsyncThunk(
  "transit/fetchEntries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/transit");
      return response.data.transitEntries;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transit entries"
      );
    }
  }
);

export const createTransitEntry = createAsyncThunk(
  "transit/createEntry",
  async (transitData: CreateTransitData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/transit", transitData);
      return response.data.transit;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create transit entry"
      );
    }
  }
);

const transitSlice = createSlice({
  name: "transit",
  initialState,
  reducers: {
    clearCreateStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearListError: (state) => {
      state.listError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transit entries
      .addCase(fetchTransitEntries.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(
        fetchTransitEntries.fulfilled,
        (state, action: PayloadAction<TransitEntry[]>) => {
          state.listStatus = "succeeded";
          state.entries = action.payload;
          state.listError = null;
        }
      )
      .addCase(fetchTransitEntries.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload as string;
      })

      // Create transit entry
      .addCase(createTransitEntry.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(
        createTransitEntry.fulfilled,
        (state, action: PayloadAction<TransitEntry>) => {
          state.createStatus = "succeeded";
          state.lastCreatedEntry = action.payload;
          state.createError = null;
          // Add the new entry to the list
          state.entries.unshift(action.payload);
        }
      )
      .addCase(createTransitEntry.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload as string;
      });
  },
});

export const { clearCreateStatus, clearCreateError, clearListError } =
  transitSlice.actions;

// Selectors
export const selectTransitState = (state: RootState) => state.transit;
export const selectTransitEntries = (state: RootState) => state.transit.entries;
export const selectCreateStatus = (state: RootState) =>
  state.transit.createStatus;
export const selectListStatus = (state: RootState) => state.transit.listStatus;

export default transitSlice.reducer;
