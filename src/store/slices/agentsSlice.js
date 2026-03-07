import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { agentsApi } from '../../services/api/agentsApi'

// Async thunks
export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await agentsApi.getAgents(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agents')
    }
  }
)

export const fetchAgentById = createAsyncThunk(
  'agents/fetchAgentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await agentsApi.getAgentById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent')
    }
  }
)

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (agentData, { rejectWithValue }) => {
    try {
      const response = await agentsApi.createAgent(agentData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create agent')
    }
  }
)

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async ({ id, agentData }, { rejectWithValue }) => {
    try {
      const response = await agentsApi.updateAgent(id, agentData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update agent')
    }
  }
)

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id, { rejectWithValue }) => {
    try {
      await agentsApi.deleteAgent(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete agent')
    }
  }
)

export const toggleAgentStatus = createAsyncThunk(
  'agents/toggleAgentStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await agentsApi.toggleAgentStatus(id)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle agent status')
    }
  }
)

export const approveAgent = createAsyncThunk(
  'agents/approveAgent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await agentsApi.approveAgent(id)
      return { id, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve agent')
    }
  }
)

const initialState = {
  agents: [],
  currentAgent: null,
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
    verified: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: {
    total: 0,
    active: 0,
    pending: 0,
    verified: 0,
  },
}

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentAgent: (state) => {
      state.currentAgent = null
    },
    resetAgents: (state) => {
      state.agents = []
      state.pagination = initialState.pagination
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Agents
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false
        state.agents = action.payload.agents
        state.pagination = action.payload.pagination
        state.stats = action.payload.stats || initialState.stats
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Agent By ID
      .addCase(fetchAgentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAgent = action.payload
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Agent
      .addCase(createAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.loading = false
        state.agents.unshift(action.payload)
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Agent
      .addCase(updateAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.agents.findIndex(agent => agent._id === action.payload._id)
        if (index !== -1) {
          state.agents[index] = action.payload
        }
        if (state.currentAgent && state.currentAgent._id === action.payload._id) {
          state.currentAgent = action.payload
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Agent
      .addCase(deleteAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.loading = false
        state.agents = state.agents.filter(agent => agent._id !== action.payload)
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Toggle Agent Status
      .addCase(toggleAgentStatus.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.agents.findIndex(agent => agent._id === id)
        if (index !== -1) {
          state.agents[index] = { ...state.agents[index], ...updatedData }
        }
      })
      // Approve Agent
      .addCase(approveAgent.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload
        const index = state.agents.findIndex(agent => agent._id === id)
        if (index !== -1) {
          state.agents[index] = { ...state.agents[index], ...updatedData }
        }
      })
  },
})

export const { clearError, setFilters, clearCurrentAgent, resetAgents, setStats } = agentsSlice.actions
export default agentsSlice.reducer
