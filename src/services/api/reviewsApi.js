import { adminApi } from './adminApi'

export const reviewsApi = {
  // Property Reviews
  getPropertyReviews: async (params = {}) => {
    const response = await adminApi.get('/reviews/properties', { params })
    return response.data
  },

  getPropertyReviewById: async (id) => {
    const response = await adminApi.get(`/reviews/properties/${id}`)
    return response.data
  },

  createPropertyReview: async (reviewData) => {
    const response = await adminApi.post('/reviews/properties', reviewData)
    return response.data
  },

  updatePropertyReview: async (id, reviewData) => {
    const response = await adminApi.put(`/reviews/properties/${id}`, reviewData)
    return response.data
  },

  deletePropertyReview: async (id) => {
    await adminApi.delete(`/reviews/properties/${id}`)
  },

  // Agent Reviews
  getAgentReviews: async (params = {}) => {
    const response = await adminApi.get('/reviews/agents', { params })
    return response.data
  },

  getAgentReviewById: async (id) => {
    const response = await adminApi.get(`/reviews/agents/${id}`)
    return response.data
  },

  createAgentReview: async (reviewData) => {
    const response = await adminApi.post('/reviews/agents', reviewData)
    return response.data
  },

  updateAgentReview: async (id, reviewData) => {
    const response = await adminApi.put(`/reviews/agents/${id}`, reviewData)
    return response.data
  },

  deleteAgentReview: async (id) => {
    await adminApi.delete(`/reviews/agents/${id}`)
  },

  // Review Moderation
  approveReview: async (id, type) => {
    const response = await adminApi.patch(`/reviews/${type}/${id}/approve`)
    return response.data
  },

  rejectReview: async (id, type, reason) => {
    const response = await adminApi.patch(`/reviews/${type}/${id}/reject`, { reason })
    return response.data
  },

  // Legacy functions for backward compatibility
  approvePropertyReview: async (id) => {
    const response = await adminApi.patch(`/reviews/${id}/approve`)
    return response.data
  },

  rejectPropertyReview: async (id, reason) => {
    const response = await adminApi.patch(`/reviews/${id}/reject`, { reason })
    return response.data
  },

  deleteReview: async (id) => {
    await adminApi.delete(`/reviews/${id}`)
  },
}
