/**
 * EXAMPLE: How to use Redux Auth in Login/Signup Components
 *
 * This file shows examples of how to use the auth slice when making
 * API calls to your backend for login and signup.
 */

import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  authFailure,
  authStart,
  loginSuccess,
  signupSuccess,
  type UserData,
} from "./authSlice";

// Example: Login Component Usage
export const useLogin = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, user, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const handleLogin = async (email: string, password: string) => {
    try {
      dispatch(authStart()); // Set loading state

      // Make API call to your backend
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        user?: UserData;
        message?: string;
      };

      if (response.ok) {
        // Store user data in Redux
        // Assuming backend returns: { id, name, email, token, ... }
        const userPayload: UserData = (data.user ??
          (data as unknown)) as UserData;
        dispatch(loginSuccess(userPayload));
      } else {
        dispatch(authFailure(data.message || "Login failed"));
      }
    } catch {
      dispatch(authFailure("Network error. Please try again."));
    }
  };

  return { handleLogin, isLoading, error, user, isAuthenticated };
};

// Example: Signup Component Usage
export const useSignup = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, user, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const handleSignup = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      dispatch(authStart()); // Set loading state

      // Make API call to your backend
      const response = await fetch("http://localhost:3000/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await response.json()) as {
        user?: UserData;
        message?: string;
      };

      if (response.ok) {
        // Store user data in Redux
        // Assuming backend returns: { id, name, email, token, ... }
        const userPayload: UserData = (data.user ??
          (data as unknown)) as UserData;
        dispatch(signupSuccess(userPayload));
      } else {
        dispatch(authFailure(data.message || "Signup failed"));
      }
    } catch {
      dispatch(authFailure("Network error. Please try again."));
    }
  };

  return { handleSignup, isLoading, error, user, isAuthenticated };
};

// Example: Accessing user data in any component
// Example component usage moved to a dedicated file to satisfy fast-refresh rules.
// See: components/auth/UserProfileExample.tsx
