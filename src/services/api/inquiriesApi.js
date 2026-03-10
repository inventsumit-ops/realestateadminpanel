import { adminApi } from './adminApi'

export const inquiriesApi = {
  getInquiries: async (params = {}) => {
    const response = await adminApi.get('/admin/inquiries', { params })
    return response.data
  },

  getInquiryById: async (id) => {
    const response = await adminApi.get(`/admin/inquiries/${id}`)
    return response.data
  },

  updateInquiryStatus: async (id, status) => {
    const response = await adminApi.patch(`/admin/inquiries/${id}/status`, { status })
    return response.data
  },

  deleteInquiry: async (id) => {
    await adminApi.delete(`/admin/inquiries/${id}`)
  },

  respondToInquiry: async (id, response) => {
    const apiResponse = await adminApi.post(`/admin/inquiries/${id}/respond`, { response })
    return apiResponse.data
  },
}
