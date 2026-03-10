import { adminApi } from './adminApi'

export const appointmentsApi = {
  getAppointments: async (params = {}) => {
    const response = await adminApi.get('/admin/appointments', { params })
    return response.data
  },

  getAppointmentById: async (id) => {
    const response = await adminApi.get(`/admin/appointments/${id}`)
    return response.data
  },

  createAppointment: async (appointmentData) => {
    const response = await adminApi.post('/admin/appointments', appointmentData)
    return response.data
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await adminApi.put(`/admin/appointments/${id}`, appointmentData)
    return response.data
  },

  deleteAppointment: async (id) => {
    await adminApi.delete(`/admin/appointments/${id}`)
  },

  updateAppointmentStatus: async (id, status) => {
    const response = await adminApi.patch(`/admin/appointments/${id}/status`, { status })
    return response.data
  },

  getCalendarEvents: async (params = {}) => {
    const response = await adminApi.get('/admin/appointments/calendar', { params })
    return response.data
  },
}
