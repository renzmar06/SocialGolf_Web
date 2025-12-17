// src/store/slices/eventSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Event {
  _id: string;
  title: string;
  eventType: string;
  format: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  price: number;
  maxParticipants: string;
  description: string;
  rules: string;
  prizes: string;
  coverImage: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse {
  success: boolean;
  data?: Event[] | Event;
  message?: string;
  error?: string;
}

interface EventState {
  data: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  data: [],
  loading: false,
  error: null,
};

export const saveEvent = createAsyncThunk(
  'event/save',
  async (eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/events', eventData);
      // New format: { success: true, data: event }
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to save event');
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save event');
    }
  }
);

export const fetchEvents = createAsyncThunk(
  'event/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/events');
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch events');
      }
      return response.data.data; // This should be the array
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'event/update',
  async ({ id, data }: { id: string; data: Partial<Event> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/events/${id}`, data);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to update event');
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'event/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/events/${id}`);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to delete event');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Safety: ensure payload is an array
        if (Array.isArray(action.payload)) {
          state.data = action.payload;
        } else {
          console.warn('fetchEvents fulfilled but payload is not array:', action.payload);
          state.data = [];
        }
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = []; // Important: reset to empty array on error
      })

      // SAVE
      .addCase(saveEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload as Event);
      })

      // UPDATE
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEvent = action.payload as Event;
        const index = state.data.findIndex((e) => e._id === updatedEvent._id);
        if (index !== -1) {
          state.data[index] = updatedEvent;
        }
      })

      // DELETE
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((e) => e._id !== action.payload);
      })

      // Common pending/rejected for save/update/delete
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
  (action): action is PayloadAction<string> => action.type.endsWith('/rejected'),
  (state, action) => {
    state.loading = false;
    state.error = action.payload ?? 'An unexpected error occurred';
  }
)
  },
});

export const { clearError } = eventSlice.actions;
export default eventSlice.reducer;