import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reportsApi } from '../../services/api/reportsApi'

// Async thunks
export const fetchUserReports = createAsyncThunk(
  'reports/fetchUserReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getUserReports(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reports')
    }
  }
)

export const fetchPropertyReports = createAsyncThunk(
  'reports/fetchPropertyReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getPropertyReports(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property reports')
    }
  }
)

export const fetchRevenueReports = createAsyncThunk(
  'reports/fetchRevenueReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getRevenueReports(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue reports')
    }
  }
)

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async ({ type, params = {} }, { rejectWithValue }) => {
    try {
      const response = await reportsApi.exportReport(type, params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report')
    }
  }
)

const initialState = {
  userReports: null,
  propertyReports: null,
  revenueReports: null,
  loading: false,
  exporting: false,
  error: null,
  filters: {
    dateRange: '',
    period: 'monthly',
    format: 'pdf',
  },
}

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearReports: (state) => {
      state.userReports = null
      state.propertyReports = null
      state.revenueReports = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Reports
      .addCase(fetchUserReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.loading = false
        state.userReports = action.payload
      })
      .addCase(fetchUserReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Property Reports
      .addCase(fetchPropertyReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyReports.fulfilled, (state, action) => {
        state.loading = false
        state.propertyReports = action.payload
      })
      .addCase(fetchPropertyReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Revenue Reports
      .addCase(fetchRevenueReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRevenueReports.fulfilled, (state, action) => {
        state.loading = false
        state.revenueReports = action.payload
      })
      .addCase(fetchRevenueReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Export Report
      .addCase(exportReport.pending, (state) => {
        state.exporting = true
        state.error = null
      })
      .addCase(exportReport.fulfilled, (state) => {
        state.exporting = false
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.exporting = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, clearReports } = reportsSlice.actions
export default reportsSlice.reducer
