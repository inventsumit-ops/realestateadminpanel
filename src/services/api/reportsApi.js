import { adminApi } from './adminApi'

export const reportsApi = {
  getUserReports: async (params = {}) => {
    const response = await adminApi.get('/reports/users', { params })
    return response.data
  },

  getPropertyReports: async (params = {}) => {
    const response = await adminApi.get('/reports/properties', { params })
    return response.data
  },

  getRevenueReports: async (params = {}) => {
    const response = await adminApi.get('/reports/revenue', { params })
    return response.data
  },

  exportReport: async (type, params = {}) => {
    const response = await adminApi.get(`/reports/export/${type}`, { 
      params,
      responseType: 'blob'
    })
    return response.data
  },
}
