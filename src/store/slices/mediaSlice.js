import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mediaApi } from '../../services/api/mediaApi'

// Async thunks
export const fetchMedia = createAsyncThunk(
  'media/fetchMedia',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mediaApi.getMedia(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch media')
    }
  }
)

export const uploadMedia = createAsyncThunk(
  'media/uploadMedia',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mediaApi.uploadMedia(formData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload media')
    }
  }
)

export const deleteMedia = createAsyncThunk(
  'media/deleteMedia',
  async (id, { rejectWithValue }) => {
    try {
      await mediaApi.deleteMedia(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete media')
    }
  }
)

export const updateMedia = createAsyncThunk(
  'media/updateMedia',
  async ({ id, mediaData }, { rejectWithValue }) => {
    try {
      const response = await mediaApi.updateMedia(id, mediaData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update media')
    }
  }
)

const initialState = {
  media: [],
  loading: false,
  error: null,
  uploading: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    type: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
}

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetMedia: (state) => {
      state.media = []
      state.pagination = initialState.pagination
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Media
      .addCase(fetchMedia.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.loading = false
        state.media = action.payload.media
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Upload Media
      .addCase(uploadMedia.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.uploading = false
        state.media.unshift(action.payload)
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })
      // Delete Media
      .addCase(deleteMedia.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.loading = false
        state.media = state.media.filter(item => item._id !== action.payload)
      })
      .addCase(deleteMedia.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Media
      .addCase(updateMedia.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMedia.fulfilled, (state, action) => {
        state.loading = false
        const index = state.media.findIndex(item => item._id === action.payload._id)
        if (index !== -1) {
          state.media[index] = action.payload
        }
      })
      .addCase(updateMedia.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, resetMedia } = mediaSlice.actions
export default mediaSlice.reducer
