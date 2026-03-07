import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import usersSlice from './slices/usersSlice'
import agentsSlice from './slices/agentsSlice'
import propertiesSlice from './slices/propertiesSlice'
import mediaSlice from './slices/mediaSlice'
import amenitiesSlice from './slices/amenitiesSlice'
import inquiriesSlice from './slices/inquiriesSlice'
import appointmentsSlice from './slices/appointmentsSlice'
import reviewsSlice from './slices/reviewsSlice'
import blogsSlice from './slices/blogsSlice'
import adsSlice from './slices/adsSlice'
import reportsSlice from './slices/reportsSlice'
import settingsSlice from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    agents: agentsSlice,
    properties: propertiesSlice,
    media: mediaSlice,
    amenities: amenitiesSlice,
    inquiries: inquiriesSlice,
    appointments: appointmentsSlice,
    reviews: reviewsSlice,
    blogs: blogsSlice,
    ads: adsSlice,
    reports: reportsSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store
