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

export const fetchPosts = createAsyncThunk("socialPost/fetchPosts", async () => {
  const response = await fetch("/api/social-posts");
  const data = await response.json();
  return data.posts;
});

export const createPost = createAsyncThunk("socialPost/createPost", async (postData: Partial<SocialPost>) => {
  const response = await fetch("/api/social-posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  const data = await response.json();
  return data.post;
});

export const updatePost = createAsyncThunk("socialPost/updatePost", async ({ id, data }: { id: string; data: Partial<SocialPost> }) => {
  const response = await fetch(`/api/social-posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result.post;
});

export const deletePost = createAsyncThunk("socialPost/deletePost", async (id: string) => {
  await fetch(`/api/social-posts/${id}`, { method: "DELETE" });
  return id;
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