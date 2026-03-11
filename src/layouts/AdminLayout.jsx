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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api/adminApi'
import { amenitiesApi } from '../services/api/amenitiesApi'
import Header from './Header'

const { Content, Sider } = Layout
const { Title } = Typography
const { Option } = Select

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false)
  const [createAgentModalVisible, setCreateAgentModalVisible] = useState(false)
  const [createPropertyModalVisible, setCreatePropertyModalVisible] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [propertyImages, setPropertyImages] = useState([])
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Fetch agents for dropdown
  const {
    data: agentsData,
    isLoading: agentsLoading,
  } = useQuery({
    queryKey: ['agents'],
    queryFn: () => adminApi.getAgents({ limit: 100 }), // Get all agents
  })

  // Fetch amenities for dropdown
  const {
    data: amenitiesData,
    isLoading: amenitiesLoading,
  } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => amenitiesApi.getAmenities({ limit: 100, is_active: true }), // Get only active amenities
  })

  // Listen for custom events to open modals from child components
  React.useEffect(() => {
    const handleOpenCreatePropertyModal = () => {
      setCreatePropertyModalVisible(true)
    }

    window.addEventListener('openCreatePropertyModal', handleOpenCreatePropertyModal)
    
    return () => {
      window.removeEventListener('openCreatePropertyModal', handleOpenCreatePropertyModal)
    }
  }, [])

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

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: adminApi.createAgent,
    onSuccess: () => {
      message.success('Agent created successfully')
      setCreateAgentModalVisible(false)
      setImageUrl(null)
      form.resetFields()
      queryClient.invalidateQueries(['agents'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create agent')
    },
  })

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: adminApi.createProperty,
    onSuccess: () => {
      message.success('Property created successfully')
      setCreatePropertyModalVisible(false)
      setPropertyImages([])
      form.resetFields()
      queryClient.invalidateQueries(['properties'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create property')
    },
  })

  const handleCreateAgent = (values) => {
    const agentData = {
      ...values,
      profile_image: imageUrl,
    }
    createAgentMutation.mutate(agentData)
  }

  const handleCreateProperty = (values) => {
    const propertyData = {
      ...values,
      images: propertyImages,
    }
    createPropertyMutation.mutate(propertyData)
  }

  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url)
      message.success('Profile image uploaded successfully')
    } else if (info.file.status === 'error') {
      message.error('Failed to upload profile image')
    }
  }

  const handlePropertyImagesChange = (info) => {
    if (info.file.status === 'done') {
      setPropertyImages(prev => [...prev, info.file.response.url])
      message.success('Property image uploaded successfully')
    } else if (info.file.status === 'error') {
      message.error('Failed to upload property image')
    }
  }

  const handleRemovePropertyImage = (index) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index))
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

  const propertyImagesUploadProps = {
    name: 'property_images',
    action: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload/image`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    beforeUpload,
    onChange: handlePropertyImagesChange,
    showUploadList: false,
    multiple: true,
  }

  const handleMenuClick = ({ key }) => {
    if (key === '/admin/users/create') {
      setCreateUserModalVisible(true)
    } else if (key === '/admin/agents/create') {
      setCreateAgentModalVisible(true)
    } else if (key === '/admin/properties/create') {
      setCreatePropertyModalVisible(true)
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

      {/* Create Agent Modal */}
      <Modal
        title="Create New Agent"
        open={createAgentModalVisible}
        onCancel={() => {
          setCreateAgentModalVisible(false)
          setImageUrl(null)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreateAgentModalVisible(false)
            setImageUrl(null)
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
            loading={createAgentMutation.isLoading}
          >
            Create Agent
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAgent}
          initialValues={{
            is_active: true,
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
                  { required: true, message: 'Please enter agent\'s full name' },
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
                    name="agency_name"
                    label="Agency Name"
                  >
                    <Input placeholder="Enter agency name (optional)" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="license_number"
                    label="License Number"
                  >
                    <Input placeholder="Enter license number (optional)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="specialization"
                    label="Specialization"
                  >
                    <Select placeholder="Select specialization (optional)">
                      <Option value="residential">Residential</Option>
                      <Option value="commercial">Commercial</Option>
                      <Option value="luxury">Luxury</Option>
                      <Option value="rental">Rental</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="experience_years"
                    label="Experience (Years)"
                  >
                    <Input 
                      type="number" 
                      placeholder="Enter years of experience"
                      min={0}
                      max={50}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="is_active"
                    label="Account Status"
                    rules={[{ required: true, message: 'Please select account status' }]}
                  >
                    <Select placeholder="Select account status">
                      <Option value={true}>Active</Option>
                      <Option value={false}>Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  {/* Empty column for balance */}
                </Col>
              </Row>

              <Divider orientation="left">Additional Information</Divider>

              <Form.Item
                name="bio"
                label="Bio/Description"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter agent bio or description (optional)"
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
                  placeholder="Enter agent address (optional)"
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

      {/* Create Property Modal */}
      <Modal
        title="Create New Property"
        open={createPropertyModalVisible}
        onCancel={() => {
          setCreatePropertyModalVisible(false)
          setPropertyImages([])
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreatePropertyModalVisible(false)
            setPropertyImages([])
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
            loading={createPropertyMutation.isLoading}
          >
            Create Property
          </Button>
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProperty}
          initialValues={{
            status: 'available',
            property_type: 'apartment',
            is_approved: false,
          }}
        >
          <Row gutter={[16, 0]}>
            {/* Left Column - Basic Property Info */}
            <Col xs={24} lg={12}>
              <Divider orientation="left">Basic Information</Divider>
              
              <Form.Item
                name="title"
                label="Property Title"
                rules={[
                  { required: true, message: 'Please enter property title' },
                  { max: 200, message: 'Title cannot exceed 200 characters' },
                ]}
              >
                <Input placeholder="Enter property title" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: 'Please enter property description' },
                  { min: 50, message: 'Description must be at least 50 characters' },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter detailed property description"
                  maxLength={1000}
                  showCount
                />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="agent_id"
                    label="Assign Agent"
                    rules={[{ required: true, message: 'Please select an agent' }]}
                  >
                    <Select
                      placeholder="Select an agent"
                      loading={agentsLoading}
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {agentsData?.data?.map(agent => (
                        <Option key={agent._id} value={agent._id}>
                          {agent.user_id?.name || 'Unknown Agent'} - {agent.agency_name || 'No Agency'}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="property_type"
                    label="Property Type"
                    rules={[{ required: true, message: 'Please select property type' }]}
                  >
                    <Select placeholder="Select property type">
                      <Option value="apartment">Apartment</Option>
                      <Option value="house">House</Option>
                      <Option value="villa">Villa</Option>
                      <Option value="condo">Condo</Option>
                      <Option value="land">Land</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select placeholder="Select status">
                      <Option value="available">Available</Option>
                      <Option value="pending">Pending</Option>
                      <Option value="sold">Sold</Option>
                      <Option value="rented">Rented</Option>
                      <Option value="off_market">Off Market</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  {/* Empty column for balance */}
                </Col>
              </Row>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="price"
                    label="Price ($)"
                    rules={[{ required: true, message: 'Please enter property price' }]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter price"
                      min={0}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="bedrooms"
                    label="Bedrooms"
                    rules={[{ required: true, message: 'Please enter number of bedrooms' }]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter bedrooms"
                      min={0}
                      max={20}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="bathrooms"
                    label="Bathrooms"
                    rules={[{ required: true, message: 'Please enter number of bathrooms' }]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter bathrooms"
                      min={0}
                      max={20}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="area"
                    label="Area (sq ft)"
                    rules={[{ required: true, message: 'Please enter property area' }]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter area in sq ft"
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Right Column - Location and Images */}
            <Col xs={24} lg={12}>
              <Divider orientation="left">Location Information</Divider>
              
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please enter property location' }]}
              >
                <Input placeholder="Enter property location" />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="latitude"
                    label="Latitude"
                    rules={[{ required: true, message: 'Please enter latitude' }]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter latitude"
                      step="any"
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        if (!isNaN(value) && value >= -90 && value <= 90) {
                          // You can add map update logic here if needed
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="longitude"
                    label="Longitude"
                    rules={[{ required: true, message: 'Please enter longitude' }]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter longitude"
                      step="any"
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        if (!isNaN(value) && value >= -180 && value <= 180) {
                          // You can add map update logic here if needed
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Full Address"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Enter full address (optional)"
                />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="city"
                    label="City"
                  >
                    <Input placeholder="Enter city" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="state"
                    label="State"
                  >
                    <Input placeholder="Enter state" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="zipcode"
                    label="Zip Code"
                  >
                    <Input placeholder="Enter zip code" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                  >
                    <Input placeholder="Enter country" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Property Images</Divider>
              
              <div style={{ marginBottom: 16 }}>
                <Upload {...propertyImagesUploadProps}>
                  <Button icon={<UploadOutlined />}>
                    Upload Property Images
                  </Button>
                </Upload>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Click to upload property images (JPG/PNG, max 2MB each)
                </div>
              </div>

              {propertyImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                  {propertyImages.map((image, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleRemovePropertyImage(index)}
                        style={{ position: 'absolute', top: 2, right: 2 }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Divider orientation="left">Additional Details</Divider>
              
              <Form.Item
                name="amenities"
                label="Property Amenities"
              >
                <Select
                  mode="multiple"
                  placeholder="Select amenities for this property"
                  loading={amenitiesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{ width: '100%' }}
                >
                  {amenitiesData?.map(amenity => (
                    <Option key={amenity._id} value={amenity._id}>
                      {amenity.icon && <span style={{ marginRight: 8 }}>{amenity.icon}</span>}
                      {amenity.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="features"
                label="Features"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Enter property features (comma separated)"
                />
              </Form.Item>

              <Form.Item
                name="is_approved"
                label="Approval Status"
                rules={[{ required: true, message: 'Please select approval status' }]}
              >
                <Select placeholder="Select approval status">
                  <Option value={true}>Approved</Option>
                  <Option value={false}>Pending Approval</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  )
}

export default AdminLayout
