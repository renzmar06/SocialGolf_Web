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
      return response.data;
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
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'event/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/events/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'event/update',
  async ({ id, data }: { id: string; data: Partial<Event> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/events/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event');
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(saveEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(event => event._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = eventSlice.actions;
export default eventSlice.reducer;