import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/lib/api-client";
import type { RootState } from "@/store";

// Types
export interface MenuItem {
  [day: string]: {
    Breakfast: string[];
    Lunch: string[];
    Snacks: string[];
    Dinner: string[];
  };
}

export interface FeedbackData {
  date: string;
  mealType: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  rating: number;
  comment?: string;
}

export interface SubmittedFeedback extends FeedbackData {
  _id: string;
  day: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface MessState {
  menu: MenuItem | null;
  menuStatus: "idle" | "loading" | "succeeded" | "failed";
  menuError: string | null;
  
  feedbackStatus: "idle" | "loading" | "succeeded" | "failed";
  feedbackError: string | null;
  lastSubmittedFeedback: SubmittedFeedback | null;
}

const initialState: MessState = {
  menu: null,
  menuStatus: "idle",
  menuError: null,
  
  feedbackStatus: "idle",
  feedbackError: null,
  lastSubmittedFeedback: null,
};

// Async thunks
export const fetchMenu = createAsyncThunk(
  "mess/fetchMenu",
  async (_, { rejectWithValue }) => {
    try {
      // Use apiClient to include auth token
      const response = await apiClient.get("/mess/menu");
      return response.data.menu;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch menu"
      );
    }
  }
);

export const submitFeedback = createAsyncThunk(
  "mess/submitFeedback",
  async (feedbackData: FeedbackData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/mess/feedback", feedbackData);
      return response.data.feedback;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit feedback"
      );
    }
  }
);

const messSlice = createSlice({
  name: "mess",
  initialState,
  reducers: {
    clearFeedbackStatus: (state) => {
      state.feedbackStatus = "idle";
      state.feedbackError = null;
    },
    clearFeedbackError: (state) => {
      state.feedbackError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch menu
      .addCase(fetchMenu.pending, (state) => {
        state.menuStatus = "loading";
        state.menuError = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        state.menuStatus = "succeeded";
        state.menu = action.payload;
        state.menuError = null;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.menuStatus = "failed";
        state.menuError = action.payload as string;
      })
      
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.feedbackStatus = "loading";
        state.feedbackError = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action: PayloadAction<SubmittedFeedback>) => {
        state.feedbackStatus = "succeeded";
        state.lastSubmittedFeedback = action.payload;
        state.feedbackError = null;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.feedbackStatus = "failed";
        state.feedbackError = action.payload as string;
      });
  },
});

export const { clearFeedbackStatus, clearFeedbackError } = messSlice.actions;

// Selectors
export const selectMessState = (state: RootState) => state.mess;
export const selectMenu = (state: RootState) => state.mess.menu;
export const selectMenuStatus = (state: RootState) => state.mess.menuStatus;
export const selectFeedbackStatus = (state: RootState) => state.mess.feedbackStatus;

export default messSlice.reducer;
