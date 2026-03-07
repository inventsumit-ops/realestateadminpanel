import { adminApi } from './adminApi'

export const amenitiesApi = {
  getAmenities: async (params = {}) => {
    const response = await adminApi.get('/amenities', { params })
    return response.data
  },

  getAmenityById: async (id) => {
    const response = await adminApi.get(`/amenities/${id}`)
    return response.data
  },

  createAmenity: async (amenityData) => {
    const response = await adminApi.post('/amenities', amenityData)
    return response.data
  },

  updateAmenity: async (id, amenityData) => {
    const response = await adminApi.put(`/amenities/${id}`, amenityData)
    return response.data
  },

  deleteAmenity: async (id) => {
    await adminApi.delete(`/amenities/${id}`)
  },
}
