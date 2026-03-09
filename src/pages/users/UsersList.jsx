import React, { useState } from 'react'
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Input,
  Select,
  message,
  Popconfirm,
  Modal,
  Form,
  Upload,
  Row,
  Col,
  Divider,
  Descriptions,
  Image,
} from 'antd'
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch users data
  const {
    data: usersData,
    isLoading,
  } = useQuery({
    queryKey: ['users', currentPage, pageSize, searchTerm, roleFilter, statusFilter],
    queryFn: () => adminApi.getUsers({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      role: roleFilter || 'user', // Only show users, not agents or admins
      status: statusFilter,
    }),
    keepPreviousData: true,
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      message.success('User deleted successfully')
      queryClient.invalidateQueries(['users'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete user')
    },
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      message.success('User created successfully')
      setCreateModalVisible(false)
      setImageUrl(null)
      form.resetFields()
      queryClient.invalidateQueries(['users'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  const handleDeleteUser = (userId) => {
    deleteUserMutation.mutate(userId)
  }

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

  const handleEditImageChange = (info) => {
    if (info.file.status === 'done') {
      setEditImageUrl(info.file.response.url)
      message.success('Profile image updated successfully')
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

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setViewModalVisible(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditImageUrl(user.profile_image)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      bio: user.bio,
      address: user.address,
      city: user.city,
      country: user.country,
    })
    setEditModalVisible(true)
  }

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={record.profile_image} />
          <div>
            <div style={{ fontWeight: 500 }}>{text || 'No name'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email || 'No email'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colorMap = {
          admin: 'red',
          agent: 'blue',
          user: 'green',
        }
        return (
          <Tag color={colorMap[role] || 'default'}>
            {(role || 'user').toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'No phone',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Unknown',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="View User"
            onClick={() => handleViewUser(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit User"
            onClick={() => handleEditUser(record)}
          />
          {record.role !== 'admin' && (
            <Popconfirm
              title="Are you sure you want to delete this user?"
              description="This action cannot be undone."
              onConfirm={() => handleDeleteUser(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                title="Delete User"
                loading={deleteUserMutation.isLoading}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleRoleFilter = (value) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Users Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Add User
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search users..."
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && setSearchTerm('')}
          />
          <Select
            placeholder="Filter by role"
            allowClear
            style={{ width: 150 }}
            onChange={handleRoleFilter}
            value={roleFilter || undefined}
          >
            <Option value="admin">Admin</Option>
            <Option value="agent">Agent</Option>
            <Option value="user">User</Option>
          </Select>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            value={statusFilter || undefined}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </div>

        {/* Users Table */}
        <Table
          columns={columns}
          dataSource={usersData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: usersData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No users found' }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          setImageUrl(null)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreateModalVisible(false)
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

      {/* View User Modal */}
      <Modal
        title="User Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedUser && (
          <Row gutter={[24, 24]}>
            {/* User Profile Card */}
            <Col xs={24} lg={8}>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  src={selectedUser.profile_image}
                  style={{ marginBottom: 16 }}
                />
                <Title level={4} style={{ margin: 0 }}>
                  {selectedUser.name || 'No Name'}
                </Title>
                <Tag color={
                  selectedUser.role === 'admin' ? 'red' :
                  selectedUser.role === 'agent' ? 'blue' : 'green'
                } style={{ marginBottom: 16 }}>
                  {(selectedUser.role || 'user').toUpperCase()}
                </Tag>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <Tag 
                    color={selectedUser.isActive ? 'green' : 'red'}
                    icon={selectedUser.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Tag>
                </div>
              </div>

              <Divider />

              <Descriptions column={1} size="small">
                <Descriptions.Item label="User ID">
                  <Text copyable style={{ fontSize: 12 }}>{selectedUser._id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Joined">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Last Login">
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                </Descriptions.Item>
                <Descriptions.Item label="Email Verified">
                  <Tag color={selectedUser.isEmailVerified ? 'green' : 'orange'}>
                    {selectedUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>

            {/* User Information Card */}
            <Col xs={24} lg={16}>
              <Descriptions title="Personal Information" column={2} size="small">
                <Descriptions.Item label="Full Name" span={2}>
                  {selectedUser.name || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Email Address" span={2}>
                  <Text copyable>{selectedUser.email || 'Not provided'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number" span={2}>
                  {selectedUser.phone || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="User Role" span={2}>
                  <Tag color={
                    selectedUser.role === 'admin' ? 'red' :
                    selectedUser.role === 'agent' ? 'blue' : 'green'
                  }>
                    {(selectedUser.role || 'user').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Descriptions title="Address Information" column={2} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Address" span={2}>
                  {selectedUser.address || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="City" span={1}>
                  {selectedUser.city || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Country" span={1}>
                  {selectedUser.country || 'Not provided'}
                </Descriptions.Item>
              </Descriptions>

              {selectedUser.bio && (
                <Descriptions title="Additional Information" column={1} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Bio/Description">
                    {selectedUser.bio}
                  </Descriptions.Item>
                </Descriptions>
              )}

              {selectedUser.profile_image && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Profile Image</Text>
                  <div style={{ marginTop: 8 }}>
                    <Image
                      width={150}
                      src={selectedUser.profile_image}
                      alt={selectedUser.name}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                </div>
              )}
            </Col>
          </Row>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setEditImageUrl(null)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditModalVisible(false)
            setEditImageUrl(null)
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
            Update User
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const userData = {
                ...values,
                profile_image: editImageUrl,
              }
              
              await adminApi.updateUser(selectedUser._id, userData)
              message.success('User updated successfully!')
              setEditModalVisible(false)
              setEditImageUrl(null)
              form.resetFields()
              queryClient.invalidateQueries(['users'])
            } catch (error) {
              message.error(error.response?.data?.message || 'Failed to update user')
            }
          }}
        >
          <Row gutter={[24, 0]}>
            {/* Left Column - Profile Image and Basic Info */}
            <Col xs={24} lg={8}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Upload
                  name="profile_image"
                  action={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload/image`}
                  headers={{
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                  }}
                  beforeUpload={beforeUpload}
                  onChange={handleEditImageChange}
                  showUploadList={false}
                >
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
                      background: editImageUrl ? `url(${editImageUrl}) center/cover` : '#fafafa'
                    }}
                  >
                    {editImageUrl ? (
                      <img src={editImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <UserOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
                        <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>Upload Photo</div>
                      </div>
                    )}
                  </div>
                </Upload>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Click to upload profile picture (JPG/PNG, max 2MB)
                </Text>
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
            <Col xs={24} lg={16}>
              <Divider orientation="left">Account Information</Divider>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="role"
                    label="User Role"
                  >
                    <Select placeholder="User role (read-only)" disabled>
                      <Option value="user">User</Option>
                      <Option value="agent">Agent</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
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

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="city"
                    label="City"
                  >
                    <Input placeholder="Enter city (optional)" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
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
    </div>
  )
}

export default UsersList
