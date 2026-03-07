import { adminApi } from './adminApi'

export const reviewsApi = {
  getPropertyReviews: async (params = {}) => {
    const response = await adminApi.get('/reviews/properties', { params })
    return response.data
  },

  getAgentReviews: async (params = {}) => {
    const response = await adminApi.get('/reviews/agents', { params })
    return response.data
  },

  approveReview: async (id) => {
    const response = await adminApi.patch(`/reviews/${id}/approve`)
    return response.data
  },

  rejectReview: async (id, reason) => {
    const response = await adminApi.patch(`/reviews/${id}/reject`, { reason })
    return response.data
  },

  deleteReview: async (id) => {
    await adminApi.delete(`/reviews/${id}`)
  },
}
