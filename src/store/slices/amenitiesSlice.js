import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { amenitiesApi } from '../../services/api/amenitiesApi'

// Async thunks
export const fetchAmenities = createAsyncThunk(
  'amenities/fetchAmenities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await amenitiesApi.getAmenities(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch amenities')
    }
  }
)

export const fetchAmenityById = createAsyncThunk(
  'amenities/fetchAmenityById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await amenitiesApi.getAmenityById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch amenity')
    }
  }
)

export const createAmenity = createAsyncThunk(
  'amenities/createAmenity',
  async (amenityData, { rejectWithValue }) => {
    try {
      const response = await amenitiesApi.createAmenity(amenityData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create amenity')
    }
  }
)

export const updateAmenity = createAsyncThunk(
  'amenities/updateAmenity',
  async ({ id, amenityData }, { rejectWithValue }) => {
    try {
      const response = await amenitiesApi.updateAmenity(id, amenityData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update amenity')
    }
  }
)

export const deleteAmenity = createAsyncThunk(
  'amenities/deleteAmenity',
  async (id, { rejectWithValue }) => {
    try {
      await amenitiesApi.deleteAmenity(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete amenity')
    }
  }
)

const initialState = {
  amenities: [],
  currentAmenity: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    category: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
}

const amenitiesSlice = createSlice({
  name: 'amenities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentAmenity: (state) => {
      state.currentAmenity = null
    },
    resetAmenities: (state) => {
      state.amenities = []
      state.pagination = initialState.pagination
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Amenities
      .addCase(fetchAmenities.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.loading = false
        state.amenities = action.payload.amenities
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Amenity By ID
      .addCase(fetchAmenityById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAmenityById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAmenity = action.payload
      })
      .addCase(fetchAmenityById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Amenity
      .addCase(createAmenity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAmenity.fulfilled, (state, action) => {
        state.loading = false
        state.amenities.unshift(action.payload)
      })
      .addCase(createAmenity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Amenity
      .addCase(updateAmenity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAmenity.fulfilled, (state, action) => {
        state.loading = false
        const index = state.amenities.findIndex(amenity => amenity._id === action.payload._id)
        if (index !== -1) {
          state.amenities[index] = action.payload
        }
        if (state.currentAmenity && state.currentAmenity._id === action.payload._id) {
          state.currentAmenity = action.payload
        }
      })
      .addCase(updateAmenity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Amenity
      .addCase(deleteAmenity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.loading = false
        state.amenities = state.amenities.filter(amenity => amenity._id !== action.payload)
      })
      .addCase(deleteAmenity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, clearCurrentAmenity, resetAmenities } = amenitiesSlice.actions
export default amenitiesSlice.reducer
