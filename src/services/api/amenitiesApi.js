import { adminApi } from './adminApi'

export const amenitiesApi = {
  getAmenities: async (params = {}) => {
    const response = await adminApi.get('/amenities', { params })
    return response.data
  },

  getAmenityById: async (id) => {
    const response = await adminApi.get(`/amenities/${id}`)
    return response.data
  },

  createAmenity: async (amenityData) => {
    // Transform frontend field names to backend field names
    const transformedData = {
      ...amenityData,
      is_active: amenityData.isActive !== false, // Convert isActive to is_active
      // Remove isActive from the data as backend doesn't expect it
      isActive: undefined
    }
    // Remove undefined fields
    Object.keys(transformedData).forEach(key => transformedData[key] === undefined && delete transformedData[key])
    
    console.log('🔄 API Call - Transformed data:', transformedData)
    
    const response = await adminApi.post('/amenities', transformedData)
    console.log('✅ API Response:', response.data)
    return response.data
  },

  updateAmenity: async (id, amenityData) => {
    // Transform frontend field names to backend field names
    const transformedData = {
      ...amenityData,
      is_active: amenityData.isActive !== false, // Convert isActive to is_active
      // Remove isActive from the data as backend doesn't expect it
      isActive: undefined
    }
    // Remove undefined fields
    Object.keys(transformedData).forEach(key => transformedData[key] === undefined && delete transformedData[key])
    
    const response = await adminApi.put(`/amenities/${id}`, transformedData)
    return response.data
  },

  deleteAmenity: async (id) => {
    await adminApi.delete(`/amenities/${id}`)
  },
}
