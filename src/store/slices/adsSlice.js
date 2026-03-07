import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adsApi } from '../../services/api/adsApi'

// Async thunks
export const fetchAds = createAsyncThunk(
  'ads/fetchAds',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adsApi.getAds(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ads')
    }
  }
)

export const fetchAdById = createAsyncThunk(
  'ads/fetchAdById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adsApi.getAdById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ad')
    }
  }
)

export const createAd = createAsyncThunk(
  'ads/createAd',
  async (adData, { rejectWithValue }) => {
    try {
      const response = await adsApi.createAd(adData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create ad')
    }
  }
)

export const updateAd = createAsyncThunk(
  'ads/updateAd',
  async ({ id, adData }, { rejectWithValue }) => {
    try {
      const response = await adsApi.updateAd(id, adData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ad')
    }
  }
)

export const deleteAd = createAsyncThunk(
  'ads/deleteAd',
  async (id, { rejectWithValue }) => {
    try {
      await adsApi.deleteAd(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete ad')
    }
  }
)

export const toggleAdStatus = createAsyncThunk(
  'ads/toggleAdStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adsApi.toggleAdStatus(id)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle ad status')
    }
  }
)

const initialState = {
  ads: [],
  currentAd: null,
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
    type: '',
    position: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
  },
}

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentAd: (state) => {
      state.currentAd = null
    },
    resetAds: (state) => {
      state.ads = []
      state.pagination = initialState.pagination
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Ads
      .addCase(fetchAds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false
        state.ads = action.payload.ads
        state.pagination = action.payload.pagination
        state.stats = action.payload.stats || initialState.stats
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Ad By ID
      .addCase(fetchAdById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAd = action.payload
      })
      .addCase(fetchAdById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Ad
      .addCase(createAd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.loading = false
        state.ads.unshift(action.payload)
      })
      .addCase(createAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Ad
      .addCase(updateAd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.loading = false
        const index = state.ads.findIndex(ad => ad._id === action.payload._id)
        if (index !== -1) {
          state.ads[index] = action.payload
        }
        if (state.currentAd && state.currentAd._id === action.payload._id) {
          state.currentAd = action.payload
        }
      })
      .addCase(updateAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Ad
      .addCase(deleteAd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.loading = false
        state.ads = state.ads.filter(ad => ad._id !== action.payload)
      })
      .addCase(deleteAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Toggle Ad Status
      .addCase(toggleAdStatus.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.ads.findIndex(ad => ad._id === id)
        if (index !== -1) {
          state.ads[index] = { ...state.ads[index], ...updatedData }
        }
      })
  },
})

export const { clearError, setFilters, clearCurrentAd, resetAds, setStats } = adsSlice.actions
export default adsSlice.reducer
