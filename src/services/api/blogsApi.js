import { adminApi } from './adminApi'

export const blogsApi = {
  getBlogs: async (params = {}) => {
    const response = await adminApi.get('/blogs', { params })
    return response.data
  },

  getBlogById: async (id) => {
    const response = await adminApi.get(`/blogs/${id}`)
    return response.data
  },

  createBlog: async (blogData) => {
    const response = await adminApi.post('/blogs', blogData)
    return response.data
  },

  updateBlog: async (id, blogData) => {
    const response = await adminApi.put(`/blogs/${id}`, blogData)
    return response.data
  },

  deleteBlog: async (id) => {
    await adminApi.delete(`/blogs/${id}`)
  },

  toggleBlogStatus: async (id) => {
    const response = await adminApi.patch(`/blogs/${id}/toggle-status`)
    return response.data
  },
}
