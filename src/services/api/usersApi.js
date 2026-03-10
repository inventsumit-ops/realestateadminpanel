import { adminApi } from './adminApi'

export const usersApi = {
  getUsers: async (params = {}) => {
    const response = await adminApi.get('/admin/users', { params })
    return response.data
  },

  getUserById: async (id) => {
    const response = await adminApi.get(`/admin/users/${id}`)
    return response.data
  },

  createUser: async (userData) => {
    const response = await adminApi.post('/admin/users', userData)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await adminApi.put(`/admin/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id) => {
    await adminApi.delete(`/admin/users/${id}`)
  },

  toggleUserStatus: async (id) => {
    const response = await adminApi.patch(`/admin/users/${id}/toggle-status`)
    return response.data
  },
}
