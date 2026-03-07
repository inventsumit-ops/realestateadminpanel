import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appointmentsApi } from '../../services/api/appointmentsApi'

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await appointmentsApi.getAppointments(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments')
    }
  }
)

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentsApi.getAppointmentById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment')
    }
  }
)

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentsApi.createAppointment(appointmentData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment')
    }
  }
)

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointmentData }, { rejectWithValue }) => {
    try {
      const response = await appointmentsApi.updateAppointment(id, appointmentData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment')
    }
  }
)

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id, { rejectWithValue }) => {
    try {
      await appointmentsApi.deleteAppointment(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete appointment')
    }
  }
)

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateAppointmentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await appointmentsApi.updateAppointmentStatus(id, status)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment status')
    }
  }
)

export const fetchCalendarEvents = createAsyncThunk(
  'appointments/fetchCalendarEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await appointmentsApi.getCalendarEvents(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calendar events')
    }
  }
)

const initialState = {
  appointments: [],
  calendarEvents: [],
  currentAppointment: null,
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
    agentId: '',
    propertyId: '',
    dateRange: '',
    sortBy: 'appointmentDate',
    sortOrder: 'asc',
  },
  stats: {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  },
}

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null
    },
    resetAppointments: (state) => {
      state.appointments = []
      state.pagination = initialState.pagination
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false
        state.appointments = action.payload.appointments
        state.pagination = action.payload.pagination
        state.stats = action.payload.stats || initialState.stats
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Appointment By ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAppointment = action.payload
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false
        state.appointments.unshift(action.payload)
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false
        const index = state.appointments.findIndex(appointment => appointment._id === action.payload._id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
        if (state.currentAppointment && state.currentAppointment._id === action.payload._id) {
          state.currentAppointment = action.payload
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false
        state.appointments = state.appointments.filter(appointment => appointment._id !== action.payload)
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Appointment Status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.appointments.findIndex(appointment => appointment._id === id)
        if (index !== -1) {
          state.appointments[index] = { ...state.appointments[index], ...updatedData }
        }
        if (state.currentAppointment && state.currentAppointment._id === id) {
          state.currentAppointment = { ...state.currentAppointment, ...updatedData }
        }
      })
      // Fetch Calendar Events
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action) => {
        state.loading = false
        state.calendarEvents = action.payload.events
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, clearCurrentAppointment, resetAppointments, setStats } = appointmentsSlice.actions
export default appointmentsSlice.reducer
