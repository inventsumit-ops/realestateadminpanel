import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reviewsApi } from '../../services/api/reviewsApi'

// Async thunks
export const fetchPropertyReviews = createAsyncThunk(
  'reviews/fetchPropertyReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.getPropertyReviews(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property reviews')
    }
  }
)

export const fetchAgentReviews = createAsyncThunk(
  'reviews/fetchAgentReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.getAgentReviews(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent reviews')
    }
  }
)

export const approveReview = createAsyncThunk(
  'reviews/approveReview',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.approveReview(id)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve review')
    }
  }
)

export const rejectReview = createAsyncThunk(
  'reviews/rejectReview',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.rejectReview(id, reason)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject review')
    }
  }
)

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await reviewsApi.deleteReview(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review')
    }
  }
)

const initialState = {
  propertyReviews: [],
  agentReviews: [],
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
    rating: '',
    propertyId: '',
    agentId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: {
    totalPropertyReviews: 0,
    totalAgentReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    averageRating: 0,
  },
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetReviews: (state) => {
      state.propertyReviews = []
      state.agentReviews = []
      state.pagination = initialState.pagination
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Property Reviews
      .addCase(fetchPropertyReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyReviews.fulfilled, (state, action) => {
        state.loading = false
        state.propertyReviews = action.payload.reviews
        state.pagination = action.payload.pagination
      })
      .addCase(fetchPropertyReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Agent Reviews
      .addCase(fetchAgentReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAgentReviews.fulfilled, (state, action) => {
        state.loading = false
        state.agentReviews = action.payload.reviews
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAgentReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Approve Review
      .addCase(approveReview.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const propertyIndex = state.propertyReviews.findIndex(review => review._id === id)
        if (propertyIndex !== -1) {
          state.propertyReviews[propertyIndex] = { ...state.propertyReviews[propertyIndex], ...updatedData }
        }
        const agentIndex = state.agentReviews.findIndex(review => review._id === id)
        if (agentIndex !== -1) {
          state.agentReviews[agentIndex] = { ...state.agentReviews[agentIndex], ...updatedData }
        }
      })
      // Reject Review
      .addCase(rejectReview.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const propertyIndex = state.propertyReviews.findIndex(review => review._id === id)
        if (propertyIndex !== -1) {
          state.propertyReviews[propertyIndex] = { ...state.propertyReviews[propertyIndex], ...updatedData }
        }
        const agentIndex = state.agentReviews.findIndex(review => review._id === id)
        if (agentIndex !== -1) {
          state.agentReviews[agentIndex] = { ...state.agentReviews[agentIndex], ...updatedData }
        }
      })
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false
        state.propertyReviews = state.propertyReviews.filter(review => review._id !== action.payload)
        state.agentReviews = state.agentReviews.filter(review => review._id !== action.payload)
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, resetReviews, setStats } = reviewsSlice.actions
export default reviewsSlice.reducer
