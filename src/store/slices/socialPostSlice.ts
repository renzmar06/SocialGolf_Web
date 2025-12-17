import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface SocialPost {
  _id: string;
  content: string;
  postType: string;
  images: string[];
  status: "draft" | "published";
  author: { _id: string; name: string; email: string };
  views: number;
  likes: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}

interface SocialPostState {
  posts: SocialPost[];
  loading: boolean;
  error: string | null;
}

const initialState: SocialPostState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk("socialPost/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/social-posts");
    const data = await response.json();
    if (!data.success) {
      return rejectWithValue(data.message || "Failed to fetch posts");
    }
    return data.posts;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch posts");
  }
});

export const createPost = createAsyncThunk("socialPost/createPost", async (postData: Partial<SocialPost>, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/social-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    if (!data.success) {
      return rejectWithValue(data.message || "Failed to create post");
    }
    return data.post;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create post");
  }
});

export const updatePost = createAsyncThunk("socialPost/updatePost", async ({ id, data }: { id: string; data: Partial<SocialPost> }, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/social-posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) {
      return rejectWithValue(result.message || "Failed to update post");
    }
    return result.post;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update post");
  }
});

export const deletePost = createAsyncThunk("socialPost/deletePost", async (id: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/social-posts/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!data.success) {
      return rejectWithValue(data.message || "Failed to delete post");
    }
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete post");
  }
});

const socialPostSlice = createSlice({
  name: "socialPost",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch posts";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      });
  },
});

export default socialPostSlice.reducer;