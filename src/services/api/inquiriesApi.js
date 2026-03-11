import { adminApi } from './adminApi'

export const inquiriesApi = {
  getInquiries: async (params = {}) => {
    const response = await adminApi.get('/inquiries', { params })
    return response.data
  },

  getInquiryById: async (id) => {
    const response = await adminApi.get(`/inquiries/${id}`)
    return response.data
  },

  updateInquiryStatus: async (id, status) => {
    const response = await adminApi.patch(`/inquiries/${id}/status`, { status })
    return response.data
  },

  deleteInquiry: async (id) => {
    await adminApi.delete(`/inquiries/${id}`)
  },

  respondToInquiry: async (id, response) => {
    const apiResponse = await adminApi.post(`/inquiries/${id}/respond`, { response })
    return apiResponse.data
  },
}
