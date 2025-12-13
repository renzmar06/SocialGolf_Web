import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import eventReducer from "./slices/eventSlice";
import bookingReducer from "./slices/bookingSlice";
import socialPostReducer from "./slices/socialPostSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    event: eventReducer,
    booking: bookingReducer,
    socialPost: socialPostReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;