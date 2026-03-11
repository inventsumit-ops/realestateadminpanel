import api from './authApi'

// Admin API endpoints
export const adminApi = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  // Users Management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  },

  // Properties Management
  getProperties: async (params = {}) => {
    const response = await api.get('/admin/properties', { params })
    return response.data
  },

  createProperty: async (propertyData) => {
    const response = await api.post('/admin/properties', propertyData)
    return response.data
  },

  approveProperty: async (propertyId) => {
    const response = await api.put(`/admin/properties/${propertyId}/approve`)
    return response.data
  },

  rejectProperty: async (propertyId, reason) => {
    const response = await api.put(`/admin/properties/${propertyId}/reject`, { reason })
    return response.data
  },

  deleteProperty: async (propertyId) => {
    const response = await api.delete(`/admin/properties/${propertyId}`)
    return response.data
  },

  // Agents Management
  getAgents: async (params = {}) => {
    const response = await api.get('/admin/agents', { params })
    return response.data
  },

  createAgent: async (agentData) => {
    const response = await api.post('/admin/agents', agentData)
    return response.data
  },

  verifyAgent: async (agentId) => {
    const response = await api.put(`/admin/agents/${agentId}/verify`)
    return response.data
  },

  updateAgent: async (agentId, agentData) => {
    const response = await api.put(`/admin/agents/${agentId}`, agentData)
    return response.data
  },

  deleteAgent: async (agentId) => {
    const response = await api.delete(`/admin/agents/${agentId}`)
    return response.data
  },

  // Reports and Analytics
  getReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params })
    return response.data
  },

  getAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params })
    return response.data
  },

  // Activity Logs
  getLogs: async (params = {}) => {
    const response = await api.get('/admin/logs', { params })
    return response.data
  },

  // Advertisements
  getAdvertisements: async (params = {}) => {
    const response = await api.get('/admin/ads', { params })
    return response.data
  },

  createAdvertisement: async (adData) => {
    const response = await api.post('/admin/ads', adData)
    return response.data
  },

  updateAdvertisement: async (adId, adData) => {
    const response = await api.put(`/admin/ads/${adId}`, adData)
    return response.data
  },

  deleteAdvertisement: async (adId) => {
    const response = await api.delete(`/admin/ads/${adId}`)
    return response.data
  },

  // Inquiries Management
  getInquiries: async (params = {}) => {
    const response = await api.get('/admin/inquiries', { params })
    return response.data
  },

  createInquiry: async (inquiryData) => {
    const response = await api.post('/admin/inquiries', inquiryData)
    return response.data
  },

  updateInquiryStatus: async (inquiryId, status) => {
    const response = await api.put(`/admin/inquiries/${inquiryId}/status`, { status })
    return response.data
  },

  deleteInquiry: async (inquiryId) => {
    const response = await api.delete(`/admin/inquiries/${inquiryId}`)
    return response.data
  },

  // Appointments Management
  getAppointments: async (params = {}) => {
    const response = await api.get('/admin/appointments', { params })
    return response.data
  },

  createAppointment: async (appointmentData) => {
    const response = await api.post('/admin/appointments', appointmentData)
    return response.data
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.put(`/admin/appointments/${appointmentId}/status`, { status })
    return response.data
  },

  deleteAppointment: async (appointmentId) => {
    const response = await api.delete(`/admin/appointments/${appointmentId}`)
    return response.data
  },

  // Blogs Management
  getBlogs: async (params = {}) => {
    const response = await api.get('/admin/blogs', { params })
    return response.data
  },

  createBlog: async (blogData) => {
    const response = await api.post('/admin/blogs', blogData)
    return response.data
  },

  updateBlog: async (blogId, blogData) => {
    const response = await api.put(`/admin/blogs/${blogId}`, blogData)
    return response.data
  },

  deleteBlog: async (blogId) => {
    const response = await api.delete(`/admin/blogs/${blogId}`)
    return response.data
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings')
    return response.data
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', { settings })
    return response.data
  },

  // Generic methods for custom endpoints
  get: async (endpoint, params) => {
    const response = await api.get(`/admin${endpoint}`, { params })
    return response.data
  },

  post: async (endpoint, data) => {
    const response = await api.post(`/admin${endpoint}`, data)
    return response.data
  },

  put: async (endpoint, data) => {
    const response = await api.put(`/admin${endpoint}`, data)
    return response.data
  },

  delete: async (endpoint) => {
    const response = await api.delete(`/admin${endpoint}`)
    return response.data
  },
}

export default adminApi
