# Real Estate Admin Panel

A modern, scalable React + Vite admin panel for real estate management with a beautiful sky blue theme.

## 🚀 Features

### 🎨 Modern UI/UX
- **Sky Blue Theme**: Clean and professional color scheme
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Ant Design Components**: Modern and consistent UI components
- **Smooth Animations**: Elegant transitions and micro-interactions

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Users, properties, revenue, and inquiries
- **Interactive Charts**: Revenue trends, user growth, property types
- **Data Visualization**: Line charts, area charts, pie charts with Recharts
- **Performance Metrics**: Key performance indicators and growth tracking

### 🏢 Property Management
- **Property Listings**: Complete CRUD operations
- **Property Status**: Active, pending, sold, and archived properties
- **Advanced Search**: Filter by location, price, type, and status
- **Property Details**: Comprehensive property information management

### 👥 User & Agent Management
- **User Administration**: Complete user lifecycle management
- **Agent Profiles**: Professional agent information and performance
- **Role-based Access**: Different permissions for different user types
- **User Analytics**: User activity and engagement tracking

### 📸 Media Management
- **S3 Integration**: Direct upload to AWS S3
- **Multi-file Upload**: Drag & drop interface
- **Image Preview**: Thumbnail generation and gallery view
- **File Organization**: Folder-based media organization

### 📝 Content Management
- **Blog Management**: Create and manage real estate blog posts
- **Advertisement Management**: Promotional content management
- **Amenities Management**: Property features and amenities
- **SEO Optimization**: Meta tags and SEO settings

### 💬 Communication
- **Inquiry Management**: Handle customer inquiries efficiently
- **Appointment Scheduling**: Calendar-based appointment system
- **Review Management**: Property and agent review system
- **Email Integration**: Automated email notifications

### 📈 Reports & Analytics
- **User Reports**: User registration and activity reports
- **Property Reports**: Property performance and listing analytics
- **Revenue Reports**: Financial performance tracking
- **Custom Reports**: Flexible reporting system

### ⚙️ Settings & Configuration
- **General Settings**: Application configuration
- **Email Settings**: SMTP and notification configuration
- **S3 Settings**: Cloud storage configuration
- **SEO Settings**: Search engine optimization

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern React with latest features
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Ant Design**: UI component library
- **Recharts**: Data visualization library
- **React Hook Form**: Form management
- **Zustand**: State management
- **React Query**: Server state management
- **Axios**: HTTP client

### Backend Integration
- **RESTful API**: Standard API endpoints
- **AWS S3**: Cloud storage for media files
- **JWT Authentication**: Secure user authentication

## 📁 Project Structure

```
real-estate-admin/
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       └── theme.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   └── Loader.jsx
│   │   ├── forms/
│   │   ├── media/
│   │   │   ├── MediaUploader.jsx
│   │   │   ├── MediaPreview.jsx
│   │   │   └── MediaGallery.jsx
│   │   └── charts/
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── agents/
│   │   ├── properties/
│   │   ├── media/
│   │   ├── amenities/
│   │   ├── inquiries/
│   │   ├── appointments/
│   │   ├── reviews/
│   │   ├── blogs/
│   │   ├── ads/
│   │   ├── reports/
│   │   └── settings/
│   ├── services/
│   │   ├── api/
│   │   └── s3/
│   │       └── uploadService.js
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   ├── routes/
│   ├── App.jsx
│   ├── main.jsx
│   └── vite.config.js
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   - AWS S3 credentials
   - API base URL
   - Other configuration options

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
```

The build files will be in the `dist` directory.

## 🔧 Configuration

### AWS S3 Setup
1. Create an AWS S3 bucket
2. Configure CORS policy for the bucket
3. Update environment variables with your AWS credentials
4. Set appropriate bucket permissions

### API Configuration
Update `REACT_APP_API_BASE_URL` in your `.env` file to point to your backend API.

## 🎨 Theme Customization

The theme is defined in `src/assets/styles/theme.css`. You can customize:
- **Primary Colors**: Sky blue color scheme
- **Typography**: Font families and sizes
- **Spacing**: Layout spacing and margins
- **Shadows**: Box shadows for depth
- **Animations**: Transition effects

## 📱 Responsive Design

The admin panel is fully responsive:
- **Desktop**: Full-featured layout with sidebar
- **Tablet**: Collapsible sidebar navigation
- **Mobile**: Hamburger menu with bottom navigation

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for different user types
- **Input Validation**: Client-side validation for all forms
- **XSS Protection**: Built-in XSS protection
- **CSRF Protection**: CSRF token implementation

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic code splitting with Vite
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized image loading
- **Caching**: Strategic caching for better performance
- **Bundle Analysis**: Optimized bundle sizes

## 📊 Features Overview

### Dashboard
- Real-time statistics
- Interactive charts
- Recent activities
- Quick actions

### User Management
- User registration
- Profile management
- Role assignment
- Activity tracking

### Property Management
- Property listings
- Advanced search
- Status management
- Media uploads

### Media Management
- S3 integration
- Multi-file upload
- Image optimization
- Gallery view

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

The admin panel is continuously updated with:
- New features
- Security patches
- Performance improvements
- UI/UX enhancements

---

**Built with ❤️ using React, Vite, and Ant Design**
