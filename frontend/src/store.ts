import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import complaintsReducer from "./features/complaints/complaintsSlice";
import messReducer from "./features/mess/messSlice";
import announcementsReducer from "./features/announcements/announcementsSlice";
import transitReducer from "./features/transit/transitSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintsReducer,
    mess: messReducer,
    announcements: announcementsReducer,
    transit: transitReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
