import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pages = [
  // Users
  { path: 'src/pages/users/ViewUser.jsx', name: 'ViewUser' },
  
  // Agents
  { path: 'src/pages/agents/AgentsList.jsx', name: 'AgentsList' },
  { path: 'src/pages/agents/CreateAgent.jsx', name: 'CreateAgent' },
  { path: 'src/pages/agents/EditAgent.jsx', name: 'EditAgent' },
  { path: 'src/pages/agents/ViewAgent.jsx', name: 'ViewAgent' },
  
  // Properties
  { path: 'src/pages/properties/PropertiesList.jsx', name: 'PropertiesList' },
  { path: 'src/pages/properties/CreateProperty.jsx', name: 'CreateProperty' },
  { path: 'src/pages/properties/EditProperty.jsx', name: 'EditProperty' },
  { path: 'src/pages/properties/ViewProperty.jsx', name: 'ViewProperty' },
  { path: 'src/pages/properties/PendingProperties.jsx', name: 'PendingProperties' },
  
  // Media
  { path: 'src/pages/media/MediaLibrary.jsx', name: 'MediaLibrary' },
  { path: 'src/pages/media/UploadMedia.jsx', name: 'UploadMedia' },
  
  // Amenities
  { path: 'src/pages/amenities/AmenitiesList.jsx', name: 'AmenitiesList' },
  { path: 'src/pages/amenities/CreateAmenity.jsx', name: 'CreateAmenity' },
  { path: 'src/pages/amenities/EditAmenity.jsx', name: 'EditAmenity' },
  
  // Inquiries
  { path: 'src/pages/inquiries/InquiriesList.jsx', name: 'InquiriesList' },
  { path: 'src/pages/inquiries/ViewInquiry.jsx', name: 'ViewInquiry' },
  
  // Appointments
  { path: 'src/pages/appointments/AppointmentsList.jsx', name: 'AppointmentsList' },
  { path: 'src/pages/appointments/CalendarView.jsx', name: 'CalendarView' },
  
  // Reviews
  { path: 'src/pages/reviews/PropertyReviews.jsx', name: 'PropertyReviews' },
  { path: 'src/pages/reviews/AgentReviews.jsx', name: 'AgentReviews' },
  
  // Blogs
  { path: 'src/pages/blogs/BlogsList.jsx', name: 'BlogsList' },
  { path: 'src/pages/blogs/CreateBlog.jsx', name: 'CreateBlog' },
  { path: 'src/pages/blogs/EditBlog.jsx', name: 'EditBlog' },
  
  // Ads
  { path: 'src/pages/ads/AdsList.jsx', name: 'AdsList' },
  { path: 'src/pages/ads/CreateAd.jsx', name: 'CreateAd' },
  { path: 'src/pages/ads/EditAd.jsx', name: 'EditAd' },
  
  // Reports
  { path: 'src/pages/reports/UserReports.jsx', name: 'UserReports' },
  { path: 'src/pages/reports/PropertyReports.jsx', name: 'PropertyReports' },
  { path: 'src/pages/reports/RevenueReports.jsx', name: 'RevenueReports' },
  
  // Settings
  { path: 'src/pages/settings/GeneralSettings.jsx', name: 'GeneralSettings' },
  { path: 'src/pages/settings/EmailSettings.jsx', name: 'EmailSettings' },
  { path: 'src/pages/settings/S3Settings.jsx', name: 'S3Settings' },
  { path: 'src/pages/settings/SeoSettings.jsx', name: 'SeoSettings' },
]

const pageTemplate = (name) => `import React from 'react'
import { Typography, Card } from 'antd'

const { Title } = Typography

const ${name} = () => {
  return (
    <div>
      <Title level={2}>${name.replace(/([A-Z])/g, ' $1').trim()}</Title>
      <Card>
        <p>${name.replace(/([A-Z])/g, ' $1').trim()} page - Coming soon...</p>
      </Card>
    </div>
  )
}

export default ${name}
`

pages.forEach(page => {
  const fullPath = path.join(__dirname, page.path)
  const content = pageTemplate(page.name)
  
  // Ensure directory exists
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(fullPath, content)
  console.log(`Created: ${page.path}`)
})

console.log('All placeholder pages created successfully!')
