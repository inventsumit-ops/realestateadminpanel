import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { settingsApi } from '../../services/api/settingsApi'

// Async thunks
export const fetchGeneralSettings = createAsyncThunk(
  'settings/fetchGeneralSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getGeneralSettings()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch general settings')
    }
  }
)

export const updateGeneralSettings = createAsyncThunk(
  'settings/updateGeneralSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updateGeneralSettings(settingsData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update general settings')
    }
  }
)

export const fetchEmailSettings = createAsyncThunk(
  'settings/fetchEmailSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getEmailSettings()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch email settings')
    }
  }
)

export const updateEmailSettings = createAsyncThunk(
  'settings/updateEmailSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updateEmailSettings(settingsData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update email settings')
    }
  }
)

export const testEmailSettings = createAsyncThunk(
  'settings/testEmailSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.testEmailSettings()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to test email settings')
    }
  }
)

export const fetchS3Settings = createAsyncThunk(
  'settings/fetchS3Settings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getS3Settings()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch S3 settings')
    }
  }
)

export const updateS3Settings = createAsyncThunk(
  'settings/updateS3Settings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updateS3Settings(settingsData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update S3 settings')
    }
  }
)

export const testS3Connection = createAsyncThunk(
  'settings/testS3Connection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.testS3Connection()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to test S3 connection')
    }
  }
)

export const fetchSeoSettings = createAsyncThunk(
  'settings/fetchSeoSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getSeoSettings()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SEO settings')
    }
  }
)

export const updateSeoSettings = createAsyncThunk(
  'settings/updateSeoSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updateSeoSettings(settingsData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update SEO settings')
    }
  }
)

const initialState = {
  generalSettings: null,
  emailSettings: null,
  s3Settings: null,
  seoSettings: null,
  loading: false,
  testing: false,
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetSettings: (state) => {
      state.generalSettings = null
      state.emailSettings = null
      state.s3Settings = null
      state.seoSettings = null
    },
  },
  extraReducers: (builder) => {
    builder
      // General Settings
      .addCase(fetchGeneralSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGeneralSettings.fulfilled, (state, action) => {
        state.loading = false
        state.generalSettings = action.payload
      })
      .addCase(fetchGeneralSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateGeneralSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGeneralSettings.fulfilled, (state, action) => {
        state.loading = false
        state.generalSettings = action.payload
      })
      .addCase(updateGeneralSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Email Settings
      .addCase(fetchEmailSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmailSettings.fulfilled, (state, action) => {
        state.loading = false
        state.emailSettings = action.payload
      })
      .addCase(fetchEmailSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateEmailSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEmailSettings.fulfilled, (state, action) => {
        state.loading = false
        state.emailSettings = action.payload
      })
      .addCase(updateEmailSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(testEmailSettings.pending, (state) => {
        state.testing = true
        state.error = null
      })
      .addCase(testEmailSettings.fulfilled, (state) => {
        state.testing = false
      })
      .addCase(testEmailSettings.rejected, (state, action) => {
        state.testing = false
        state.error = action.payload
      })
      // S3 Settings
      .addCase(fetchS3Settings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchS3Settings.fulfilled, (state, action) => {
        state.loading = false
        state.s3Settings = action.payload
      })
      .addCase(fetchS3Settings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateS3Settings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateS3Settings.fulfilled, (state, action) => {
        state.loading = false
        state.s3Settings = action.payload
      })
      .addCase(updateS3Settings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(testS3Connection.pending, (state) => {
        state.testing = true
        state.error = null
      })
      .addCase(testS3Connection.fulfilled, (state) => {
        state.testing = false
      })
      .addCase(testS3Connection.rejected, (state, action) => {
        state.testing = false
        state.error = action.payload
      })
      // SEO Settings
      .addCase(fetchSeoSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSeoSettings.fulfilled, (state, action) => {
        state.loading = false
        state.seoSettings = action.payload
      })
      .addCase(fetchSeoSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateSeoSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSeoSettings.fulfilled, (state, action) => {
        state.loading = false
        state.seoSettings = action.payload
      })
      .addCase(updateSeoSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer
