import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Promotion {
  _id: string;
  title: string;
  description: string;
  promoType: string;
  promoCode?: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  visibility: string;
  maxRedemptions?: number;
  coverImage?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PromotionState {
  data: Promotion[];
  loading: boolean;
  error: string | null;
}

const initialState: PromotionState = {
  data: [],
  loading: false,
  error: null,
};

export const savePromotion = createAsyncThunk(
  'promotion/save',
  async (promotionData: Omit<Promotion, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/promotions', promotionData);
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save promotion');
    }
  }
);

export const fetchPromotions = createAsyncThunk(
  'promotion/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/promotions');
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotions');
    }
  }
);

export const deletePromotion = createAsyncThunk(
  'promotion/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/promotions/${id}`);
      if (response.data.success) {
        return id;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete promotion');
    }
  }
);

export const updatePromotion = createAsyncThunk(
  'promotion/update',
  async ({ id, data }: { id: string; data: Partial<Promotion> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/promotions/${id}`, data);
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update promotion');
    }
  }
);

const promotionSlice = createSlice({
  name: 'promotion',
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
      .addCase(fetchPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(savePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(savePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(promotion => promotion._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(promotion => promotion._id !== action.payload);
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = promotionSlice.actions;
export default promotionSlice.reducer;