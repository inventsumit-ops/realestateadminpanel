import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { inquiriesApi } from '../../services/api/inquiriesApi'

// Async thunks
export const fetchInquiries = createAsyncThunk(
  'inquiries/fetchInquiries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await inquiriesApi.getInquiries(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inquiries')
    }
  }
)

export const fetchInquiryById = createAsyncThunk(
  'inquiries/fetchInquiryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inquiriesApi.getInquiryById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inquiry')
    }
  }
)

export const updateInquiryStatus = createAsyncThunk(
  'inquiries/updateInquiryStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await inquiriesApi.updateInquiryStatus(id, status)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inquiry status')
    }
  }
)

export const deleteInquiry = createAsyncThunk(
  'inquiries/deleteInquiry',
  async (id, { rejectWithValue }) => {
    try {
      await inquiriesApi.deleteInquiry(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete inquiry')
    }
  }
)

export const respondToInquiry = createAsyncThunk(
  'inquiries/respondToInquiry',
  async ({ id, response }, { rejectWithValue }) => {
    try {
      const apiResponse = await inquiriesApi.respondToInquiry(id, response)
      return { id, ...apiResponse }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to inquiry')
    }
  }
)

const initialState = {
  inquiries: [],
  currentInquiry: null,
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
    propertyId: '',
    dateRange: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: {
    total: 0,
    pending: 0,
    responded: 0,
    closed: 0,
  },
}

const inquiriesSlice = createSlice({
  name: 'inquiries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentInquiry: (state) => {
      state.currentInquiry = null
    },
    resetInquiries: (state) => {
      state.inquiries = []
      state.pagination = initialState.pagination
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inquiries
      .addCase(fetchInquiries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInquiries.fulfilled, (state, action) => {
        state.loading = false
        state.inquiries = action.payload.inquiries
        state.pagination = action.payload.pagination
        state.stats = action.payload.stats || initialState.stats
      })
      .addCase(fetchInquiries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Inquiry By ID
      .addCase(fetchInquiryById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInquiryById.fulfilled, (state, action) => {
        state.loading = false
        state.currentInquiry = action.payload
      })
      .addCase(fetchInquiryById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Inquiry Status
      .addCase(updateInquiryStatus.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.inquiries.findIndex(inquiry => inquiry._id === id)
        if (index !== -1) {
          state.inquiries[index] = { ...state.inquiries[index], ...updatedData }
        }
        if (state.currentInquiry && state.currentInquiry._id === id) {
          state.currentInquiry = { ...state.currentInquiry, ...updatedData }
        }
      })
      // Delete Inquiry
      .addCase(deleteInquiry.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteInquiry.fulfilled, (state, action) => {
        state.loading = false
        state.inquiries = state.inquiries.filter(inquiry => inquiry._id !== action.payload)
      })
      .addCase(deleteInquiry.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Respond to Inquiry
      .addCase(respondToInquiry.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.inquiries.findIndex(inquiry => inquiry._id === id)
        if (index !== -1) {
          state.inquiries[index] = { ...state.inquiries[index], ...updatedData }
        }
        if (state.currentInquiry && state.currentInquiry._id === id) {
          state.currentInquiry = { ...state.currentInquiry, ...updatedData }
        }
      })
  },
})

export const { clearError, setFilters, clearCurrentInquiry, resetInquiries, setStats } = inquiriesSlice.actions
export default inquiriesSlice.reducer
