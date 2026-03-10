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
  Modal,
  Form,
  Upload,
  Row,
  Col,
  Divider,
  message,
  Input,
  Select,
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
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api/adminApi'
import Header from './Header'

const { Content, Sider } = Layout
const { Title } = Typography
const { Option } = Select

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

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

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      message.success('User created successfully')
      setCreateUserModalVisible(false)
      setImageUrl(null)
      form.resetFields()
      queryClient.invalidateQueries(['users'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  const handleCreateUser = (values) => {
    const userData = {
      ...values,
      profile_image: imageUrl,
    }
    createUserMutation.mutate(userData)
  }

  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url)
      message.success('Profile image uploaded successfully')
    } else if (info.file.status === 'error') {
      message.error('Failed to upload profile image')
    }
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!')
      return false
    }
    return true
  }

  const uploadProps = {
    name: 'profile_image',
    action: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload/image`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    beforeUpload,
    onChange: handleImageChange,
    showUploadList: false,
  }

  const handleMenuClick = ({ key }) => {
    if (key === '/admin/users/create') {
      setCreateUserModalVisible(true)
    } else {
      navigate(key)
    }
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

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={createUserModalVisible}
        onCancel={() => {
          setCreateUserModalVisible(false)
          setImageUrl(null)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreateUserModalVisible(false)
            setImageUrl(null)
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
            loading={createUserMutation.isLoading}
          >
            Create User
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          initialValues={{
            role: 'user',
            isActive: true,
          }}
        >
          <Row gutter={[16, 0]}>
            {/* Left Column - Profile Image and Basic Info */}
            <Col xs={24} lg={10}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Upload {...uploadProps}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      border: '2px dashed #d9d9d9',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      margin: '0 auto',
                      overflow: 'hidden',
                      background: imageUrl ? `url(${imageUrl}) center/cover` : '#fafafa'
                    }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <UserOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
                        <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>Upload Photo</div>
                      </div>
                    )}
                  </div>
                </Upload>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Click to upload profile picture (JPG/PNG, max 2MB)
                </div>
              </div>

              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter user\'s full name' },
                  { max: 100, message: 'Name cannot exceed 100 characters' },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter full name"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Enter email address"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[+]?[\d\s-()]+$/, message: 'Please enter a valid phone number' },
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Enter phone number"
                />
              </Form.Item>
            </Col>

            {/* Right Column - Account Details */}
            <Col xs={24} lg={14}>
              <Divider orientation="left">Account Details</Divider>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Enter password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Passwords do not match'))
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirm password"
                />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="role"
                    label="User Role"
                    rules={[{ required: true, message: 'Please select user role' }]}
                  >
                    <Select placeholder="Select user role">
                      <Option value="user">User</Option>
                      <Option value="agent">Agent</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="isActive"
                    label="Account Status"
                    rules={[{ required: true, message: 'Please select account status' }]}
                  >
                    <Select placeholder="Select account status">
                      <Option value={true}>Active</Option>
                      <Option value={false}>Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Additional Information</Divider>

              <Form.Item
                name="bio"
                label="Bio/Description"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter user bio or description (optional)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Enter user address (optional)"
                />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="city"
                    label="City"
                  >
                    <Input placeholder="Enter city (optional)" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                  >
                    <Input placeholder="Enter country (optional)" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  )
}

export default AdminLayout
