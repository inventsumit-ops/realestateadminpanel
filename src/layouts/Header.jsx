import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Avatar,
  Dropdown,
  Button,
  Space,
  Badge,
  Tooltip,
  Input,
  theme,
} from 'antd'
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '../services/api/authApi'

const { Header: AntHeader } = Layout
const { Title } = Typography
const { Search } = Input

const Header = ({ collapsed, onToggle }) => {
  const navigate = useNavigate()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // Fetch current user data
  const {
    data: userData,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
  })

  const currentUser = userData?.data

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('token')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/admin/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ]

  const notificationMenuItems = [
    {
      key: '1',
      label: (
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            New Property Listing
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            A new property has been submitted for approval
          </div>
          <div style={{ color: '#999', fontSize: '11px', marginTop: 4 }}>
            5 minutes ago
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            User Registration
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            3 new users have registered today
          </div>
          <div style={{ color: '#999', fontSize: '11px', marginTop: 4 }}>
            1 hour ago
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            System Update
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            System maintenance scheduled for tonight
          </div>
          <div style={{ color: '#999', fontSize: '11px', marginTop: 4 }}>
            2 hours ago
          </div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'view-all',
      label: (
        <div style={{ textAlign: 'center', color: '#87CEEB' }}>
          View all notifications
        </div>
      ),
      onClick: () => navigate('/admin/notifications'),
    },
  ]

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--header-border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 999,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{
            fontSize: '16px',
            width: 40,
            height: 40,
            color: 'var(--text-primary)',
          }}
        />
        
        <Search
          placeholder="Search properties, users, agents..."
          allowClear
          style={{
            width: 300,
          }}
          prefix={<SearchOutlined style={{ color: '#87CEEB' }} />}
          onSearch={(value) => {
            // Implement search functionality
            console.log('Searching for:', value)
          }}
        />
      </div>

      <Space size="middle">
        <Dropdown
          menu={{ items: notificationMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{
                fontSize: '18px',
                width: 40,
                height: 40,
                color: 'var(--text-primary)',
              }}
            />
          </Badge>
        </Dropdown>

        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={currentUser?.profile_image}
              style={{
                backgroundColor: 'var(--primary-color)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: 'var(--text-primary)',
                lineHeight: '1.2'
              }}>
                {currentUser?.name || 'Admin User'}
              </span>
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-secondary)',
                lineHeight: '1.2'
              }}>
                {currentUser?.email || 'admin@realestate.com'}
              </span>
            </div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header
