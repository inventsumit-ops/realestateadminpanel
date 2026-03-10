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
  Badge,
  Rate,
  Tooltip,
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
  CheckOutlined,
  CloseOutlined,
  StarOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const AgentsList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState(null)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch agents data
  const {
    data: agentsData,
    isLoading,
  } = useQuery({
    queryKey: ['agents', currentPage, pageSize, searchTerm, verifiedFilter, statusFilter],
    queryFn: () => adminApi.getAgents({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      verified: verifiedFilter,
      is_active: statusFilter,
    }),
    keepPreviousData: true,
  })

  // Verify agent mutation
  const verifyAgentMutation = useMutation({
    mutationFn: adminApi.verifyAgent,
    onSuccess: () => {
      message.success('Agent verified successfully')
      queryClient.invalidateQueries(['agents'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to verify agent')
    },
  })

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: adminApi.createAgent,
    onSuccess: () => {
      message.success('Agent created successfully')
      setCreateModalVisible(false)
      setImageUrl(null)
      form.resetFields()
      queryClient.invalidateQueries(['agents'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create agent')
    },
  })

  const handleVerifyAgent = (agentId) => {
    verifyAgentMutation.mutate(agentId)
  }

  const handleCreateAgent = (values) => {
    const agentData = {
      ...values,
      profile_image: imageUrl,
    }
    createAgentMutation.mutate(agentData)
  }

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: ({ agentId, agentData }) => adminApi.updateAgent(agentId, agentData),
    onSuccess: () => {
      message.success('Agent updated successfully')
      setEditModalVisible(false)
      setEditImageUrl(null)
      form.resetFields()
      queryClient.invalidateQueries(['agents'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update agent')
    },
  })

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent)
    setViewModalVisible(true)
  }

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent)
    setEditImageUrl(agent.user_id?.profile_image)
    form.setFieldsValue({
      name: agent.user_id?.name || '',
      email: agent.user_id?.email || '',
      phone: agent.user_id?.phone || '',
      agency_name: agent.agency_name || '',
      license_number: agent.license_number || '',
      specialization: agent.specialties?.[0] || '',
      experience_years: agent.experience_years || 0,
      is_active: agent.is_active,
      bio: agent.user_profile?.bio || '',
      address: agent.user_profile?.address || '',
      city: agent.user_profile?.city || '',
      country: agent.user_profile?.country || '',
    })
    setEditModalVisible(true)
  }

  const handleUpdateAgent = (values) => {
    const agentData = {
      ...values,
      specialties: values.specialization ? [values.specialization] : [],
      profile_image: editImageUrl,
      user_profile: {
        bio: values.bio,
        address: values.address,
        city: values.city,
        country: values.country,
      },
    }
    // Remove fields that are not part of the agent schema or are handled separately
    delete agentData.specialization
    delete agentData.bio
    delete agentData.address
    delete agentData.city
    delete agentData.country

    updateAgentMutation.mutate({ 
      agentId: selectedAgent._id, 
      agentData: agentData 
    })
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

  const columns = [
    {
      title: 'Agent',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (user) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={user?.profile_image} />
          <div>
            <div style={{ fontWeight: 500 }}>{user?.name || 'No name'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{user?.email || 'No email'}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>{user?.phone || 'No phone'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Agency',
      dataIndex: 'agency_name',
      key: 'agency_name',
      render: (agency) => agency || 'Independent',
    },
    {
      title: 'License',
      dataIndex: 'license_number',
      key: 'license_number',
      render: (license) => license || 'Not provided',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <Rate disabled defaultValue={rating?.average || 0} style={{ fontSize: '14px' }} />
          <span style={{ fontSize: '12px', color: '#666' }}>
            ({rating?.count || 0} reviews)
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Badge
            status={record.verified ? 'success' : 'warning'}
            text={record.verified ? 'Verified' : 'Unverified'}
          />
          <Badge
            status={record.is_active ? 'success' : 'error'}
            text={record.is_active ? 'Active' : 'Inactive'}
          />
        </Space>
      ),
    },
    {
      title: 'Properties',
      dataIndex: 'properties_count',
      key: 'properties_count',
      render: (count) => count || 0,
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
            title="View Agent"
            onClick={() => handleViewAgent(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit Agent"
            onClick={() => handleEditAgent(record)}
          />
          {!record.verified && (
            <Tooltip title="Verify Agent">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleVerifyAgent(record._id)}
                loading={verifyAgentMutation.isLoading}
                style={{ color: '#52C41A' }}
              />
            </Tooltip>
          )}
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            title="Delete Agent"
            danger
          />
        </Space>
      ),
    },
  ]

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleVerifiedFilter = (value) => {
    setVerifiedFilter(value)
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
        <Title level={2} style={{ margin: 0 }}>Agents Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Add Agent
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search agents..."
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && setSearchTerm('')}
          />
          <Select
            placeholder="Filter by verification"
            allowClear
            style={{ width: 150 }}
            onChange={handleVerifiedFilter}
            value={verifiedFilter || undefined}
          >
            <Option value="true">Verified</Option>
            <Option value="false">Unverified</Option>
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

        {/* Agents Table */}
        <Table
          columns={columns}
          dataSource={agentsData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: agentsData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} agents`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No agents found' }}
        />
      </Card>

      {/* Create Agent Modal */}
      <Modal
        title="Create New Agent"
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

      {/* View Agent Modal */}
      <Modal
        title="Agent Details"
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
        {selectedAgent && (
          <Row gutter={[24, 24]}>
            {/* Agent Profile Card */}
            <Col xs={24} lg={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    src={selectedAgent.user_id?.profile_image}
                    style={{ marginBottom: 16 }}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedAgent.user_id?.name || 'No Name'}
                  </Title>
                  <Tag color={selectedAgent.verified ? 'green' : 'orange'} style={{ marginBottom: 16 }}>
                    {selectedAgent.verified ? 'VERIFIED' : 'UNVERIFIED'}
                  </Tag>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <Tag 
                      color={selectedAgent.is_active ? 'green' : 'red'}
                      icon={selectedAgent.is_active ? <CheckOutlined /> : <CloseOutlined />}
                    >
                      {selectedAgent.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Tag>
                  </div>
                </div>

                <Divider />

                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Agent ID">
                    <Typography.Text copyable style={{ fontSize: 12 }}>{selectedAgent._id}</Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Joined">
                    {selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleDateString() : 'Unknown'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Experience">
                    {selectedAgent.experience_years || 0} years
                  </Descriptions.Item>
                  <Descriptions.Item label="License">
                    {selectedAgent.license_number || 'Not provided'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Agency">
                    {selectedAgent.agency_name || 'Independent'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Agent Information Card */}
            <Col xs={24} lg={16}>
              <Card title="Personal Information">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Typography.Text strong>Full Name</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Typography.Text>{selectedAgent.user_id?.name || 'Not provided'}</Typography.Text>
                        </div>
                      </div>
                    </Space>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Typography.Text strong>Email Address</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Typography.Text copyable>{selectedAgent.user_id?.email || 'Not provided'}</Typography.Text>
                        </div>
                      </div>
                    </Space>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Typography.Text strong>Phone Number</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Typography.Text>{selectedAgent.user_id?.phone || 'Not provided'}</Typography.Text>
                        </div>
                      </div>
                    </Space>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Typography.Text strong>Specialization</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue">
                            {(selectedAgent.specialties?.[0] || 'general').toUpperCase()}
                          </Tag>
                        </div>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Address Information */}
              <Card title="Address Information" style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Typography.Text strong>Address</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Typography.Text>{selectedAgent.user_profile?.address || 'Not provided'}</Typography.Text>
                        </div>
                      </div>
                    </Space>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Typography.Text strong>City</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Typography.Text>{selectedAgent.user_profile?.city || 'Not provided'}</Typography.Text>
                        </div>
                      </div>
                    </Space>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Typography.Text strong>Country</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Typography.Text>{selectedAgent.user_profile?.country || 'Not provided'}</Typography.Text>
                        </div>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Additional Information */}
              {(selectedAgent.user_profile?.bio || selectedAgent.user_id?.profile_image) && (
                <Card title="Additional Information" style={{ marginTop: 16 }}>
                  {selectedAgent.user_profile?.bio && (
                    <div style={{ marginBottom: 16 }}>
                      <Typography.Text strong>Bio/Description</Typography.Text>
                      <div style={{ marginTop: 4 }}>
                        <Typography.Text>{selectedAgent.user_profile.bio}</Typography.Text>
                      </div>
                    </div>
                  )}

                  {selectedAgent.user_id?.profile_image && (
                    <div>
                      <Typography.Text strong>Profile Image</Typography.Text>
                      <div style={{ marginTop: 8 }}>
                        <Image
                          width={200}
                          src={selectedAgent.user_id.profile_image}
                          alt={selectedAgent.user_id.name}
                          style={{ borderRadius: 8 }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </Col>
          </Row>
        )}
      </Modal>

      {/* Edit Agent Modal */}
      <Modal
        title="Edit Agent"
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
            loading={updateAgentMutation.isLoading}
          >
            Update Agent
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateAgent}
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
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  Click to upload profile picture (JPG/PNG, max 2MB)
                </Typography.Text>
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
            <Col xs={24} lg={16}>
              <Divider orientation="left">Account Information</Divider>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="agency_name"
                    label="Agency Name"
                  >
                    <Input placeholder="Enter agency name" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="license_number"
                    label="License Number"
                  >
                    <Input placeholder="Enter license number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="specialization"
                    label="Specialization"
                  >
                    <Select placeholder="Select specialization">
                      <Option value="residential">Residential</Option>
                      <Option value="commercial">Commercial</Option>
                      <Option value="luxury">Luxury</Option>
                      <Option value="rental">Rental</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
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

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
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

                <Col xs={24} md={12}>
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
                  placeholder="Enter agent bio or description"
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
                  placeholder="Enter agent address"
                />
              </Form.Item>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="city"
                    label="City"
                  >
                    <Input placeholder="Enter city" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                  >
                    <Input placeholder="Enter country" />
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

export default AgentsList
