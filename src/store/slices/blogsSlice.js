import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { blogsApi } from '../../services/api/blogsApi'

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await blogsApi.getBlogs(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs')
    }
  }
)

export const fetchBlogById = createAsyncThunk(
  'blogs/fetchBlogById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogsApi.getBlogById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog')
    }
  }
)

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await blogsApi.createBlog(blogData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog')
    }
  }
)

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await blogsApi.updateBlog(id, blogData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog')
    }
  }
)

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      await blogsApi.deleteBlog(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog')
    }
  }
)

export const toggleBlogStatus = createAsyncThunk(
  'blogs/toggleBlogStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogsApi.toggleBlogStatus(id)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle blog status')
    }
  }
)

const initialState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: '',
    category: '',
    author: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  },
}

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null
    },
    resetBlogs: (state) => {
      state.blogs = []
      state.pagination = initialState.pagination
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false
        state.blogs = action.payload.blogs
        state.pagination = action.payload.pagination
        state.stats = action.payload.stats || initialState.stats
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Blog By ID
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false
        state.currentBlog = action.payload
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false
        state.blogs.unshift(action.payload)
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false
        const index = state.blogs.findIndex(blog => blog._id === action.payload._id)
        if (index !== -1) {
          state.blogs[index] = action.payload
        }
        if (state.currentBlog && state.currentBlog._id === action.payload._id) {
          state.currentBlog = action.payload
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload)
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Toggle Blog Status
      .addCase(toggleBlogStatus.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.blogs.findIndex(blog => blog._id === id)
        if (index !== -1) {
          state.blogs[index] = { ...state.blogs[index], ...updatedData }
        }
      })
  },
})

export const { clearError, setFilters, clearCurrentBlog, resetBlogs, setStats } = blogsSlice.actions
export default blogsSlice.reducer
