import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
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

// Persist configuration for auth slice
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Only persist these auth fields
}

// Create persisted reducer for auth
const persistedAuthReducer = persistReducer(persistConfig, authSlice)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
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
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
})

export const persistor = persistStore(store)

export default store
