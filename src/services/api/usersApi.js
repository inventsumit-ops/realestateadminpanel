import { adminApi } from './adminApi'

export const usersApi = {
  getUsers: async (params = {}) => {
    const response = await adminApi.get('/users', { params })
    return response.data
  },

  getUserById: async (id) => {
    const response = await adminApi.get(`/users/${id}`)
    return response.data
  },

  createUser: async (userData) => {
    const response = await adminApi.post('/users', userData)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await adminApi.put(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id) => {
    await adminApi.delete(`/users/${id}`)
  },

  toggleUserStatus: async (id) => {
    const response = await adminApi.patch(`/users/${id}/toggle-status`)
    return response.data
  },
}
