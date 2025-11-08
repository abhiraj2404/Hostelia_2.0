import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the user data structure
export interface UserData {
  id?: string;
  name?: string;
  email: string;
  token?: string;
  [key: string]: any; // Allow for additional fields from backend
}

// Define the auth state
interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Load initial state from localStorage if available
const loadInitialState = (): AuthState => {
  try {
    const storedUser = localStorage.getItem("user");
    // const storedToken = localStorage.getItem("token");

    // if (storedUser && storedToken) {
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        // user: { ...user, token: storedToken },
        user: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action for successful login
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist to localStorage
      // if (action.payload.token) {
      //   localStorage.setItem("token", action.payload.token);
      // }
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // Action for successful signup
    signupSuccess: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist to localStorage
      // if (action.payload.token) {
      //   localStorage.setItem("token", action.payload.token);
      // }
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // Action when login/signup starts (for loading state)
    authStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Action when login/signup fails
    authFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },

    // Action to update user data (e.g., profile updates)
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    // Action to logout
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    // Action to clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginSuccess,
  signupSuccess,
  authStart,
  authFailure,
  updateUser,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
