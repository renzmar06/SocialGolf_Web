import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Booking {
  _id: string;
  serviceName: string;
  serviceType: string;
  duration: number;
  price: number;
  maxParticipants: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BookingState {
  data: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  data: [],
  loading: false,
  error: null,
};

export const saveBooking = createAsyncThunk(
  'booking/save',
  async (bookingData: Omit<Booking, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/bookings', bookingData);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to save booking');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save booking');
    }
  }
);

export const fetchBookings = createAsyncThunk(
  'booking/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/bookings');
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch bookings');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const deleteBooking = createAsyncThunk(
  'booking/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/bookings/${id}`);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to delete booking');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete booking');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'booking/update',
  async ({ id, data }: { id: string; data: Partial<Booking> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/bookings/${id}`, data);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to update booking');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload.data);
      })
      .addCase(saveBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(booking => booking._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(booking => booking._id !== action.payload);
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = bookingSlice.actions;
export default bookingSlice.reducer;