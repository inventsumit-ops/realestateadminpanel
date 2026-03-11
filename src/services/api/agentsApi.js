import { adminApi } from './adminApi'

export const agentsApi = {
  getAgents: async (params = {}) => {
    const response = await adminApi.get('/agents', { params })
    return response.data
  },

  getAgentById: async (id) => {
    const response = await adminApi.get(`/agents/${id}`)
    return response.data
  },

  createAgent: async (agentData) => {
    const response = await adminApi.post('/agents', agentData)
    return response.data
  },

  updateAgent: async (id, agentData) => {
    const response = await adminApi.put(`/agents/${id}`, agentData)
    return response.data
  },

  deleteAgent: async (id) => {
    await adminApi.delete(`/agents/${id}`)
  },

  toggleAgentStatus: async (id) => {
    const response = await adminApi.patch(`/agents/${id}/toggle-status`)
    return response.data
  },

  approveAgent: async (id) => {
    const response = await adminApi.patch(`/agents/${id}/approve`)
    return response.data
  },
}
