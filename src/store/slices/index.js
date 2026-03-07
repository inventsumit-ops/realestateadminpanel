// Export all actions from slices
export {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  clearError as clearUsersError,
  setFilters as setUsersFilters,
  clearCurrentUser,
  resetUsers,
} from './usersSlice'

export {
  fetchAgents,
  fetchAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
  approveAgent,
  clearError as clearAgentsError,
  setFilters as setAgentsFilters,
  clearCurrentAgent,
  resetAgents,
  setStats as setAgentsStats,
} from './agentsSlice'

export {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  fetchPendingProperties,
  approveProperty,
  rejectProperty,
  togglePropertyStatus,
  clearError as clearPropertiesError,
  setFilters as setPropertiesFilters,
  clearCurrentProperty,
  resetProperties,
  setStats as setPropertiesStats,
} from './propertiesSlice'

export {
  fetchMedia,
  uploadMedia,
  deleteMedia,
  updateMedia,
  clearError as clearMediaError,
  setFilters as setMediaFilters,
  resetMedia,
} from './mediaSlice'

export {
  fetchAmenities,
  fetchAmenityById,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  clearError as clearAmenitiesError,
  setFilters as setAmenitiesFilters,
  clearCurrentAmenity,
  resetAmenities,
} from './amenitiesSlice'

export {
  fetchInquiries,
  fetchInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  respondToInquiry,
  clearError as clearInquiriesError,
  setFilters as setInquiriesFilters,
  clearCurrentInquiry,
  resetInquiries,
  setStats as setInquiriesStats,
} from './inquiriesSlice'

export {
  fetchAppointments,
  fetchAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  fetchCalendarEvents,
  clearError as clearAppointmentsError,
  setFilters as setAppointmentsFilters,
  clearCurrentAppointment,
  resetAppointments,
  setStats as setAppointmentsStats,
} from './appointmentsSlice'

export {
  fetchPropertyReviews,
  fetchAgentReviews,
  approveReview,
  rejectReview,
  deleteReview,
  clearError as clearReviewsError,
  setFilters as setReviewsFilters,
  resetReviews,
  setStats as setReviewsStats,
} from './reviewsSlice'

export {
  fetchBlogs,
  fetchBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  clearError as clearBlogsError,
  setFilters as setBlogsFilters,
  clearCurrentBlog,
  resetBlogs,
  setStats as setBlogsStats,
} from './blogsSlice'

export {
  fetchAds,
  fetchAdById,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
  clearError as clearAdsError,
  setFilters as setAdsFilters,
  clearCurrentAd,
  resetAds,
  setStats as setAdsStats,
} from './adsSlice'

export {
  fetchUserReports,
  fetchPropertyReports,
  fetchRevenueReports,
  exportReport,
  clearError as clearReportsError,
  setFilters as setReportsFilters,
  clearReports,
} from './reportsSlice'

export {
  fetchGeneralSettings,
  updateGeneralSettings,
  fetchEmailSettings,
  updateEmailSettings,
  testEmailSettings,
  fetchS3Settings,
  updateS3Settings,
  testS3Connection,
  fetchSeoSettings,
  updateSeoSettings,
  clearError as clearSettingsError,
  resetSettings,
} from './settingsSlice'
