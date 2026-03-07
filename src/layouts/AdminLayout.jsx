import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Typography,
  Space,
  Badge,
  Tooltip,
} from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  MessageOutlined,
  CalendarOutlined,
  StarOutlined,
  FileTextOutlined,
  BulbOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import Header from './Header'

const { Content, Sider } = Layout
const { Title } = Typography

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users',
      children: [
        {
          key: '/admin/users',
          label: 'All Users',
        },
        {
          key: '/admin/users/create',
          label: 'Create User',
        },
      ],
    },
    {
      key: '/admin/agents',
      icon: <TeamOutlined />,
      label: 'Agents',
      children: [
        {
          key: '/admin/agents',
          label: 'All Agents',
        },
        {
          key: '/admin/agents/create',
          label: 'Create Agent',
        },
      ],
    },
    {
      key: '/admin/properties',
      icon: <HomeOutlined />,
      label: 'Properties',
      children: [
        {
          key: '/admin/properties',
          label: 'All Properties',
        },
        {
          key: '/admin/properties/create',
          label: 'Create Property',
        },
        {
          key: '/admin/properties/pending',
          label: 'Pending Properties',
        },
      ],
    },
    {
      key: '/admin/media',
      icon: <PictureOutlined />,
      label: 'Media',
      children: [
        {
          key: '/admin/media',
          label: 'Media Library',
        },
        {
          key: '/admin/media/upload',
          label: 'Upload Media',
        },
      ],
    },
    {
      key: '/admin/amenities',
      icon: <AppstoreOutlined />,
      label: 'Amenities',
    },
    {
      key: '/admin/inquiries',
      icon: <MessageOutlined />,
      label: 'Inquiries',
    },
    {
      key: '/admin/appointments',
      icon: <CalendarOutlined />,
      label: 'Appointments',
      children: [
        {
          key: '/admin/appointments',
          label: 'All Appointments',
        },
        {
          key: '/admin/appointments/calendar',
          label: 'Calendar View',
        },
      ],
    },
    {
      key: '/admin/reviews',
      icon: <StarOutlined />,
      label: 'Reviews',
      children: [
        {
          key: '/admin/reviews/properties',
          label: 'Property Reviews',
        },
        {
          key: '/admin/reviews/agents',
          label: 'Agent Reviews',
        },
      ],
    },
    {
      key: '/admin/blogs',
      icon: <FileTextOutlined />,
      label: 'Blogs',
      children: [
        {
          key: '/admin/blogs',
          label: 'All Blogs',
        },
        {
          key: '/admin/blogs/create',
          label: 'Create Blog',
        },
      ],
    },
    {
      key: '/admin/ads',
      icon: <BulbOutlined />,
      label: 'Advertisements',
      children: [
        {
          key: '/admin/ads',
          label: 'All Ads',
        },
        {
          key: '/admin/ads/create',
          label: 'Create Ad',
        },
      ],
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      children: [
        {
          key: '/admin/reports/users',
          label: 'User Reports',
        },
        {
          key: '/admin/reports/properties',
          label: 'Property Reports',
        },
        {
          key: '/admin/reports/revenue',
          label: 'Revenue Reports',
        },
      ],
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        {
          key: '/admin/settings',
          label: 'General Settings',
        },
        {
          key: '/admin/settings/email',
          label: 'Email Settings',
        },
        {
          key: '/admin/settings/s3',
          label: 'S3 Settings',
        },
        {
          key: '/admin/settings/seo',
          label: 'SEO Settings',
        },
      ],
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const getSelectedKeys = () => {
    const pathname = location.pathname
    return [pathname]
  }

  const getOpenKeys = () => {
    const pathname = location.pathname
    const openKeys = []
    
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          pathname === child.key || pathname.startsWith(child.key + '/')
        )
        if (hasActiveChild) {
          openKeys.push(item.key)
        }
      }
    })
    
    return openKeys
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          zIndex: 1000,
        }}
      >
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--sidebar-bg)'
        }}>
          <Title level={3} style={{ 
            margin: 0, 
            color: 'var(--primary-color)',
            fontSize: collapsed ? '18px' : '24px'
          }}>
            {collapsed ? 'RE' : 'Real Estate'}
          </Title>
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            background: 'var(--sidebar-bg)'
          }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 260 }}>
        <Header 
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: 'var(--background-color)',
          borderRadius: '8px',
        }}>
          <div className="fade-in">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
