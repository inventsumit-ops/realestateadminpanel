import { adminApi } from './adminApi'

export const adsApi = {
  getAds: async (params = {}) => {
    const response = await adminApi.get('/ads', { params })
    return response.data
  },

  getAdById: async (id) => {
    const response = await adminApi.get(`/ads/${id}`)
    return response.data
  },

  createAd: async (adData) => {
    const response = await adminApi.post('/ads', adData)
    return response.data
  },

  updateAd: async (id, adData) => {
    const response = await adminApi.put(`/ads/${id}`, adData)
    return response.data
  },

  deleteAd: async (id) => {
    await adminApi.delete(`/ads/${id}`)
  },

  toggleAdStatus: async (id) => {
    const response = await adminApi.patch(`/ads/${id}/toggle-status`)
    return response.data
  },
}
