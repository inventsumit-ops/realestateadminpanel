import { adminApi } from './adminApi'

export const settingsApi = {
  getGeneralSettings: async () => {
    const response = await adminApi.get('/settings/general')
    return response.data
  },

  updateGeneralSettings: async (settingsData) => {
    const response = await adminApi.put('/settings/general', settingsData)
    return response.data
  },

  getEmailSettings: async () => {
    const response = await adminApi.get('/settings/email')
    return response.data
  },

  updateEmailSettings: async (settingsData) => {
    const response = await adminApi.put('/settings/email', settingsData)
    return response.data
  },

  testEmailSettings: async () => {
    const response = await adminApi.post('/settings/email/test')
    return response.data
  },

  getS3Settings: async () => {
    const response = await adminApi.get('/settings/s3')
    return response.data
  },

  updateS3Settings: async (settingsData) => {
    const response = await adminApi.put('/settings/s3', settingsData)
    return response.data
  },

  testS3Connection: async () => {
    const response = await adminApi.post('/settings/s3/test')
    return response.data
  },

  getSeoSettings: async () => {
    const response = await adminApi.get('/settings/seo')
    return response.data
  },

  updateSeoSettings: async (settingsData) => {
    const response = await adminApi.put('/settings/seo', settingsData)
    return response.data
  },
}
