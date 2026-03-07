import { adminApi } from './adminApi'

export const appointmentsApi = {
  getAppointments: async (params = {}) => {
    const response = await adminApi.get('/appointments', { params })
    return response.data
  },

  getAppointmentById: async (id) => {
    const response = await adminApi.get(`/appointments/${id}`)
    return response.data
  },

  createAppointment: async (appointmentData) => {
    const response = await adminApi.post('/appointments', appointmentData)
    return response.data
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await adminApi.put(`/appointments/${id}`, appointmentData)
    return response.data
  },

  deleteAppointment: async (id) => {
    await adminApi.delete(`/appointments/${id}`)
  },

  updateAppointmentStatus: async (id, status) => {
    const response = await adminApi.patch(`/appointments/${id}/status`, { status })
    return response.data
  },

  getCalendarEvents: async (params = {}) => {
    const response = await adminApi.get('/appointments/calendar', { params })
    return response.data
  },
}
