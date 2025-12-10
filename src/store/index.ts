import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import eventReducer from "./slices/eventSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    event: eventReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;