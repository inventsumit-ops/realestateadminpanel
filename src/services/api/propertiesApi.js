import { adminApi } from './adminApi'

export const propertiesApi = {
  getProperties: async (params = {}) => {
    const response = await adminApi.get('/properties', { params })
    return response.data
  },

  getPropertyById: async (id) => {
    const response = await adminApi.get(`/properties/${id}`)
    return response.data
  },

  createProperty: async (propertyData) => {
    const response = await adminApi.post('/properties', propertyData)
    return response.data
  },

  updateProperty: async (id, propertyData) => {
    const response = await adminApi.put(`/properties/${id}`, propertyData)
    return response.data
  },

  deleteProperty: async (id) => {
    await adminApi.delete(`/properties/${id}`)
  },

  getPendingProperties: async (params = {}) => {
    const response = await adminApi.get('/properties/pending', { params })
    return response.data
  },

  approveProperty: async (id) => {
    const response = await adminApi.patch(`/properties/${id}/approve`)
    return response.data
  },

  rejectProperty: async (id, reason) => {
    const response = await adminApi.patch(`/properties/${id}/reject`, { reason })
    return response.data
  },

  togglePropertyStatus: async (id) => {
    const response = await adminApi.patch(`/properties/${id}/toggle-status`)
    return response.data
  },
}
