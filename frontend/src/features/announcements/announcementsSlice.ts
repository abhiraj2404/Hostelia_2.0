import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/lib/api-client";
import type { RootState } from "@/store";

// Types
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
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  message: string;
  file?: File;
}

interface AnnouncementsState {
  items: Announcement[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null;
  
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteError: string | null;
}

const initialState: AnnouncementsState = {
  items: [],
  status: "idle",
  error: null,
  
  createStatus: "idle",
  createError: null,
  
  deleteStatus: "idle",
  deleteError: null,
};

// Async thunks
export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAnnouncements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/announcement");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch announcements"
      );
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (announcementData: CreateAnnouncementData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("title", announcementData.title);
      formData.append("message", announcementData.message);
      
      if (announcementData.file) {
        formData.append("announcementFile", announcementData.file);
      }

      const response = await apiClient.post("/announcement", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create announcement"
      );
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  "announcements/deleteAnnouncement",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/announcement/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete announcement"
      );
    }
  }
);

const announcementsSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    clearCreateStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
    clearDeleteStatus: (state) => {
      state.deleteStatus = "idle";
      state.deleteError = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch announcements
      .addCase(fetchAnnouncements.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action: PayloadAction<Announcement[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      
      // Create announcement
      .addCase(createAnnouncement.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload);
        state.createError = null;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload as string;
      })
      
      // Delete announcement
      .addCase(deleteAnnouncement.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteStatus = "succeeded";
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.deleteError = null;
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearCreateStatus, clearDeleteStatus, clearErrors } = announcementsSlice.actions;

// Selectors
export const selectAnnouncementsState = (state: RootState) => state.announcements;
export const selectAllAnnouncements = (state: RootState) => state.announcements.items;
export const selectAnnouncementsStatus = (state: RootState) => state.announcements.status;

export default announcementsSlice.reducer;
