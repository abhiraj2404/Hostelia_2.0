/**
 * EXAMPLE: How to use Redux Auth in Login/Signup Components
 *
 * This file shows examples of how to use the auth slice when making
 * API calls to your backend for login and signup.
 */

import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, signupSuccess, authStart, authFailure, logout } from "./authSlice";

// Example: Login Component Usage
export const useLogin = () => {
  const dispatch = useDispatch();
  const { isLoading, error, user, isAuthenticated } = useSelector((state: any) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    try {
      dispatch(authStart()); // Set loading state

      // Make API call to your backend
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in Redux
        // Assuming backend returns: { id, name, email, token, ... }
        dispatch(loginSuccess(data.user || data));
      } else {
        dispatch(authFailure(data.message || "Login failed"));
      }
    } catch (error) {
      dispatch(authFailure("Network error. Please try again."));
    }
  };

  return { handleLogin, isLoading, error, user, isAuthenticated };
};

// Example: Signup Component Usage
export const useSignup = () => {
  const dispatch = useDispatch();
  const { isLoading, error, user, isAuthenticated } = useSelector((state: any) => state.auth);

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      dispatch(authStart()); // Set loading state

      // Make API call to your backend
      const response = await fetch("http://localhost:3000/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in Redux
        // Assuming backend returns: { id, name, email, token, ... }
        dispatch(signupSuccess(data.user || data));
      } else {
        dispatch(authFailure(data.message || "Signup failed"));
      }
    } catch (error) {
      dispatch(authFailure("Network error. Please try again."));
    }
  };

  return { handleSignup, isLoading, error, user, isAuthenticated };
};

// Example: Accessing user data in any component
export const UserProfile = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name || user?.email}!</h1>
      <p>Email: {user?.email}</p>
      {user?.id && <p>User ID: {user.id}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
