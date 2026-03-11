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
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'
import { amenitiesApi } from '../../services/api/amenitiesApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const PropertiesList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [editPropertyImages, setEditPropertyImages] = useState([])
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

  // Fetch properties data
  const {
    data: propertiesData,
    isLoading,
  } = useQuery({
    queryKey: ['properties', currentPage, pageSize, searchTerm, statusFilter, typeFilter, approvalFilter],
    queryFn: () => adminApi.getProperties({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
      property_type: typeFilter,
      is_approved: approvalFilter,
    }),
    keepPreviousData: true,
  })

  // Property mutations
  const approvePropertyMutation = useMutation({
    mutationFn: adminApi.approveProperty,
    onSuccess: () => {
      message.success('Property approved successfully')
      queryClient.invalidateQueries(['properties'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to approve property')
    },
  })

  const rejectPropertyMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectProperty(id, reason),
    onSuccess: () => {
      message.success('Property rejected successfully')
      queryClient.invalidateQueries(['properties'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to reject property')
    },
  })

  const deletePropertyMutation = useMutation({
    mutationFn: adminApi.deleteProperty,
    onSuccess: () => {
      message.success('Property deleted successfully')
      queryClient.invalidateQueries(['properties'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete property')
    },
  })

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateProperty(id, data),
    onSuccess: () => {
      message.success('Property updated successfully')
      setEditModalVisible(false)
      setEditPropertyImages([])
      form.resetFields()
      queryClient.invalidateQueries(['properties'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update property')
    },
  })

  const handleApproveProperty = (propertyId) => {
    approvePropertyMutation.mutate(propertyId)
  }

  const handleRejectProperty = (propertyId) => {
    rejectPropertyMutation.mutate({ id: propertyId, reason: 'Rejected by admin' })
  }

  const handleDeleteProperty = (propertyId) => {
    deletePropertyMutation.mutate(propertyId)
  }

  const handleViewProperty = (property) => {
    setSelectedProperty(property)
    setViewModalVisible(true)
  }

  const handleEditProperty = (property) => {
    setSelectedProperty(property)
    setEditPropertyImages(property.images || [])
    form.setFieldsValue({
      title: property.title,
      description: property.description,
      property_type: property.property_type,
      status: property.status,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      location: property.location,
      latitude: property.latitude,
      longitude: property.longitude,
      address: property.address,
      city: property.city,
      state: property.state,
      zipcode: property.zipcode,
      country: property.country,
      features: property.features,
      is_approved: property.is_approved,
      agent_id: property.agent_id?._id,
      amenities: property.amenities?.map(amenity => amenity._id) || [],
    })
    setEditModalVisible(true)
  }

  const handleUpdateProperty = (values) => {
    const propertyData = {
      ...values,
      images: editPropertyImages,
    }
    updatePropertyMutation.mutate({ id: selectedProperty._id, data: propertyData })
  }

  const handleEditPropertyImagesChange = (info) => {
    if (info.file.status === 'done') {
      setEditPropertyImages(prev => [...prev, info.file.response.url])
      message.success('Property image uploaded successfully')
    } else if (info.file.status === 'error') {
      message.error('Failed to upload property image')
    }
  }

  const handleRemoveEditPropertyImage = (index) => {
    setEditPropertyImages(prev => prev.filter((_, i) => i !== index))
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

  const columns = [
    {
      title: 'Property',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <div>
            <div style={{ fontWeight: 500 }}>{text || 'Untitled'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.location || 'No location'}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              {record.property_type || 'Unknown type'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#52C41A' }}>
          ${price ? price.toLocaleString() : '0'}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Agent',
      dataIndex: 'agent_id',
      key: 'agent_id',
      render: (agent) => (
        <Space>
          <Avatar size="small" icon={<HomeOutlined />} src={agent?.user_id?.profile_image} />
          <div>
            <div>{agent?.user_id?.name || 'Unknown Agent'}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {agent?.agency_name || 'No agency'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          available: 'green',
          pending: 'orange',
          sold: 'blue',
          rented: 'purple',
          off_market: 'red',
        }
        return (
          <Tag color={colorMap[status] || 'default'}>
            {(status || 'unknown').toUpperCase().replace('_', ' ')}
          </Tag>
        )
      },
    },
    {
      title: 'Approval',
      dataIndex: 'isApproved',
      key: 'isApproved',
      render: (isApproved, record) => (
        <Space>
          <Badge
            status={isApproved ? 'success' : 'warning'}
            text={isApproved ? 'Approved' : 'Pending'}
          />
          {!isApproved && (
            <Space size="small">
              <Tooltip title="Approve Property">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleApproveProperty(record._id)}
                  loading={approvePropertyMutation.isLoading}
                />
              </Tooltip>
              <Tooltip title="Reject Property">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleRejectProperty(record._id)}
                  loading={rejectPropertyMutation.isLoading}
                />
              </Tooltip>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'views_count',
      key: 'views_count',
      render: (views) => (
        <Space>
          <EyeOutlined />
          <span>{views ? views.toLocaleString() : '0'}</span>
        </Space>
      ),
    },
    {
      title: 'Listed',
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
            title="View Property"
            onClick={() => handleViewProperty(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit Property"
            onClick={() => handleEditProperty(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this property?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteProperty(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Property"
              loading={deletePropertyMutation.isLoading}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleTypeFilter = (value) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleApprovalFilter = (value) => {
    setApprovalFilter(value)
    setCurrentPage(1)
  }

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Properties Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            // Trigger the create property modal from AdminLayout
            const event = new CustomEvent('openCreatePropertyModal')
            window.dispatchEvent(event)
          }}
        >
          Add Property
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search properties..."
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && setSearchTerm('')}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            value={statusFilter || undefined}
          >
            <Option value="available">Available</Option>
            <Option value="pending">Pending</Option>
            <Option value="sold">Sold</Option>
            <Option value="rented">Rented</Option>
            <Option value="off_market">Off Market</Option>
          </Select>
          <Select
            placeholder="Filter by type"
            allowClear
            style={{ width: 150 }}
            onChange={handleTypeFilter}
            value={typeFilter || undefined}
          >
            <Option value="apartment">Apartment</Option>
            <Option value="house">House</Option>
            <Option value="villa">Villa</Option>
            <Option value="condo">Condo</Option>
            <Option value="land">Land</Option>
          </Select>
          <Select
            placeholder="Filter by approval"
            allowClear
            style={{ width: 150 }}
            onChange={handleApprovalFilter}
            value={approvalFilter || undefined}
          >
            <Option value="true">Approved</Option>
            <Option value="false">Pending</Option>
          </Select>
        </div>

        {/* Properties Table */}
        <Table
          columns={columns}
          dataSource={propertiesData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: propertiesData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} properties`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No properties found' }}
        />
      </Card>

      {/* View Property Modal */}
      <Modal
        title="Property Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        {selectedProperty && (
          <Row gutter={[24, 24]}>
            {/* Property Images */}
            <Col xs={24} lg={12}>
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>Property Images</Title>
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                    {selectedProperty.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Property ${index + 1}`}
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No images available
                  </div>
                )}
              </div>
            </Col>

            {/* Property Information */}
            <Col xs={24} lg={12}>
              <Descriptions title="Basic Information" column={2} size="small">
                <Descriptions.Item label="Property ID" span={2}>
                  <Typography.Text copyable style={{ fontSize: 12 }}>{selectedProperty._id}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Title" span={2}>
                  {selectedProperty.title || 'No title'}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Tag color="blue">{(selectedProperty.property_type || 'unknown').toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={
                    selectedProperty.status === 'active' ? 'green' :
                    selectedProperty.status === 'pending' ? 'orange' :
                    selectedProperty.status === 'sold' ? 'blue' :
                    selectedProperty.status === 'rented' ? 'purple' : 'default'
                  }>
                    {(selectedProperty.status || 'unknown').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Price" span={2}>
                  <span style={{ fontWeight: 600, color: '#52C41A' }}>
                    ${selectedProperty.price ? selectedProperty.price.toLocaleString() : '0'}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Bedrooms">
                  {selectedProperty.bedrooms || '0'}
                </Descriptions.Item>
                <Descriptions.Item label="Bathrooms">
                  {selectedProperty.bathrooms || '0'}
                </Descriptions.Item>
                <Descriptions.Item label="Area" span={2}>
                  {selectedProperty.area ? `${selectedProperty.area.toLocaleString()} sq ft` : 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions title="Location Information" column={2} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Location" span={2}>
                  {selectedProperty.location || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>
                  {selectedProperty.address || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="City">
                  {selectedProperty.city || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {selectedProperty.state || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Zip Code">
                  {selectedProperty.zipcode || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Country">
                  {selectedProperty.country || 'Not provided'}
                </Descriptions.Item>
              </Descriptions>

              {selectedProperty.description && (
                <Descriptions title="Description" column={1} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Details">
                    {selectedProperty.description}
                  </Descriptions.Item>
                </Descriptions>
              )}

              {selectedProperty.features && (
                <Descriptions title="Features" column={1} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Amenities">
                    {selectedProperty.features}
                  </Descriptions.Item>
                </Descriptions>
              )}

              <Descriptions title="Additional Information" column={2} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Approval Status">
                  <Tag color={selectedProperty.is_approved ? 'green' : 'orange'}>
                    {selectedProperty.is_approved ? 'Approved' : 'Pending'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Views">
                  {selectedProperty.views_count ? selectedProperty.views_count.toLocaleString() : '0'}
                </Descriptions.Item>
                <Descriptions.Item label="Listed Date">
                  {selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleDateString() : 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Agent">
                  {selectedProperty.agent_id?.user_id?.name || 'Unknown Agent'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Edit Property Modal */}
      <Modal
        title="Edit Property"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setEditPropertyImages([])
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditModalVisible(false)
            setEditPropertyImages([])
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
            loading={updatePropertyMutation.isLoading}
          >
            Update Property
          </Button>
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProperty}
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
                <Upload
                  name="property_images"
                  action={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload/image`}
                  headers={{
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                  }}
                  beforeUpload={beforeUpload}
                  onChange={handleEditPropertyImagesChange}
                  showUploadList={false}
                  multiple={true}
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Property Images
                  </Button>
                </Upload>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Click to upload property images (JPG/PNG, max 2MB each)
                </div>
              </div>

              {editPropertyImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                  {editPropertyImages.map((image, index) => (
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
                        onClick={() => handleRemoveEditPropertyImage(index)}
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
    </div>
  )
}

export default PropertiesList
