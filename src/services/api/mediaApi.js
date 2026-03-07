import { adminApi } from './adminApi'

export const mediaApi = {
  getMedia: async (params = {}) => {
    const response = await adminApi.get('/media', { params })
    return response.data
  },

  uploadMedia: async (formData) => {
    const response = await adminApi.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteMedia: async (id) => {
    await adminApi.delete(`/media/${id}`)
  },

  updateMedia: async (id, mediaData) => {
    const response = await adminApi.put(`/media/${id}`, mediaData)
    return response.data
  },
}
