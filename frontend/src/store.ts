import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import complaintsReducer from "./features/complaints/complaintsSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintsReducer,
    dashboard: dashboardReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
