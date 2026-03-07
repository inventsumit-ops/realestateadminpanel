import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { propertiesApi } from '../../services/api/propertiesApi'

// Async thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.getProperties(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties')
    }
  }
)

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.getPropertyById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property')
    }
  }
)

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.createProperty(propertyData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create property')
    }
  }
)

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, propertyData }, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.updateProperty(id, propertyData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property')
    }
  }
)

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      await propertiesApi.deleteProperty(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property')
    }
  }
)

export const fetchPendingProperties = createAsyncThunk(
  'properties/fetchPendingProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.getPendingProperties(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending properties')
    }
  }
)

export const approveProperty = createAsyncThunk(
  'properties/approveProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.approveProperty(id)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve property')
    }
  }
)

export const rejectProperty = createAsyncThunk(
  'properties/rejectProperty',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.rejectProperty(id, reason)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject property')
    }
  }
)

export const togglePropertyStatus = createAsyncThunk(
  'properties/togglePropertyStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.togglePropertyStatus(id)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle property status')
    }
  }
)

const initialState = {
  properties: [],
  pendingProperties: [],
  currentProperty: null,
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
    type: '',
    status: '',
    agentId: '',
    priceRange: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: {
    total: 0,
    active: 0,
    pending: 0,
    sold: 0,
    featured: 0,
  },
}

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null
    },
    resetProperties: (state) => {
      state.properties = []
      state.pagination = initialState.pagination
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false
        state.properties = action.payload.properties
        state.pagination = action.payload.pagination
        state.stats = action.payload.stats || initialState.stats
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Property By ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProperty = action.payload
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Property
      .addCase(createProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false
        state.properties.unshift(action.payload)
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false
        const index = state.properties.findIndex(property => property._id === action.payload._id)
        if (index !== -1) {
          state.properties[index] = action.payload
        }
        if (state.currentProperty && state.currentProperty._id === action.payload._id) {
          state.currentProperty = action.payload
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false
        state.properties = state.properties.filter(property => property._id !== action.payload)
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Pending Properties
      .addCase(fetchPendingProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingProperties.fulfilled, (state, action) => {
        state.loading = false
        state.pendingProperties = action.payload.properties
      })
      .addCase(fetchPendingProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Approve Property
      .addCase(approveProperty.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.properties.findIndex(property => property._id === id)
        if (index !== -1) {
          state.properties[index] = { ...state.properties[index], ...updatedData }
        }
        const pendingIndex = state.pendingProperties.findIndex(property => property._id === id)
        if (pendingIndex !== -1) {
          state.pendingProperties.splice(pendingIndex, 1)
        }
      })
      // Reject Property
      .addCase(rejectProperty.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.properties.findIndex(property => property._id === id)
        if (index !== -1) {
          state.properties[index] = { ...state.properties[index], ...updatedData }
        }
        const pendingIndex = state.pendingProperties.findIndex(property => property._id === id)
        if (pendingIndex !== -1) {
          state.pendingProperties.splice(pendingIndex, 1)
        }
      })
      // Toggle Property Status
      .addCase(togglePropertyStatus.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.properties.findIndex(property => property._id === id)
        if (index !== -1) {
          state.properties[index] = { ...state.properties[index], ...updatedData }
        }
      })
  },
})

export const { clearError, setFilters, clearCurrentProperty, resetProperties, setStats } = propertiesSlice.actions
export default propertiesSlice.reducer
