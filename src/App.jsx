import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AuthInitializer from './components/AuthInitializer'
import Dashboard from './pages/dashboard/Dashboard'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// User pages
import UsersList from './pages/users/UsersList'
import EditUser from './pages/users/EditUser'
import ViewUser from './pages/users/ViewUser'

// Agent pages
import AgentsList from './pages/agents/AgentsList'
import CreateAgent from './pages/agents/CreateAgent'
import EditAgent from './pages/agents/EditAgent'
import ViewAgent from './pages/agents/ViewAgent'

// Property pages
import PropertiesList from './pages/properties/PropertiesList'
import CreateProperty from './pages/properties/CreateProperty'
import EditProperty from './pages/properties/EditProperty'
import ViewProperty from './pages/properties/ViewProperty'
import PendingProperties from './pages/properties/PendingProperties'

// Media pages
import MediaLibrary from './pages/media/MediaLibrary'
import UploadMedia from './pages/media/UploadMedia'

// Other pages
import AmenitiesList from './pages/amenities/AmenitiesList'
import CreateAmenity from './pages/amenities/CreateAmenity'
import EditAmenity from './pages/amenities/EditAmenity'

import InquiriesList from './pages/inquiries/InquiriesList'
import ViewInquiry from './pages/inquiries/ViewInquiry'

import AppointmentsList from './pages/appointments/AppointmentsList'
import CalendarView from './pages/appointments/CalendarView'

import PropertyReviews from './pages/reviews/PropertyReviews'
import AgentReviews from './pages/reviews/AgentReviews'

import BlogsList from './pages/blogs/BlogsList'
import CreateBlog from './pages/blogs/CreateBlog'
import EditBlog from './pages/blogs/EditBlog'

import AdsList from './pages/ads/AdsList'
import CreateAd from './pages/ads/CreateAd'
import EditAd from './pages/ads/EditAd'

import UserReports from './pages/reports/UserReports'
import PropertyReports from './pages/reports/PropertyReports'
import RevenueReports from './pages/reports/RevenueReports'

import GeneralSettings from './pages/settings/GeneralSettings'
import EmailSettings from './pages/settings/EmailSettings'
import S3Settings from './pages/settings/S3Settings'
import SeoSettings from './pages/settings/SeoSettings'

// Profile
import Profile from './pages/profile/Profile'

function App() {
  return (
    <>
      <AuthInitializer />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* User Routes */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/edit/:id" element={<EditUser />} />
        <Route path="users/view/:id" element={<ViewUser />} />
        
        {/* Agent Routes */}
        <Route path="agents" element={<AgentsList />} />
        <Route path="agents/create" element={<CreateAgent />} />
        <Route path="agents/edit/:id" element={<EditAgent />} />
        <Route path="agents/view/:id" element={<ViewAgent />} />
        
        {/* Property Routes */}
        <Route path="properties" element={<PropertiesList />} />
        <Route path="properties/create" element={<CreateProperty />} />
        <Route path="properties/edit/:id" element={<EditProperty />} />
        <Route path="properties/view/:id" element={<ViewProperty />} />
        <Route path="properties/pending" element={<PendingProperties />} />
        
        {/* Media Routes */}
        <Route path="media" element={<MediaLibrary />} />
        <Route path="media/upload" element={<UploadMedia />} />
        
        {/* Amenities Routes */}
        <Route path="amenities" element={<AmenitiesList />} />
        <Route path="amenities/create" element={<CreateAmenity />} />
        <Route path="amenities/edit/:id" element={<EditAmenity />} />
        
        {/* Inquiries Routes */}
        <Route path="inquiries" element={<InquiriesList />} />
        <Route path="inquiries/view/:id" element={<ViewInquiry />} />
        
        {/* Appointments Routes */}
        <Route path="appointments" element={<AppointmentsList />} />
        <Route path="appointments/calendar" element={<CalendarView />} />
        
        {/* Reviews Routes */}
        <Route path="reviews/properties" element={<PropertyReviews />} />
        <Route path="reviews/agents" element={<AgentReviews />} />
        
        {/* Blogs Routes */}
        <Route path="blogs" element={<BlogsList />} />
        <Route path="blogs/create" element={<CreateBlog />} />
        <Route path="blogs/edit/:id" element={<EditBlog />} />
        
        {/* Ads Routes */}
        <Route path="ads" element={<AdsList />} />
        <Route path="ads/create" element={<CreateAd />} />
        <Route path="ads/edit/:id" element={<EditAd />} />
        
        {/* Reports Routes */}
        <Route path="reports/users" element={<UserReports />} />
        <Route path="reports/properties" element={<PropertyReports />} />
        <Route path="reports/revenue" element={<RevenueReports />} />
        
        {/* Settings Routes */}
        <Route path="settings" element={<GeneralSettings />} />
        <Route path="settings/email" element={<EmailSettings />} />
        <Route path="settings/s3" element={<S3Settings />} />
        <Route path="settings/seo" element={<SeoSettings />} />
        
        {/* Profile Route */}
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  )
}

export default App
