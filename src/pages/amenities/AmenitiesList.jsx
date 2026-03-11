import React, { useState } from 'react'
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  App,
  Popconfirm,
  Modal,
  Form,
  Row,
  Col,
  Divider,
  Descriptions,
  Image,
  Switch,
  message,
} from 'antd'
import {
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesApi } from '../../services/api/amenitiesApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select
const { TextArea } = Input

const AmenitiesList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch amenities data
  const {
    data: amenitiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['amenities', currentPage, pageSize, searchTerm, categoryFilter, statusFilter],
    queryFn: () => amenitiesApi.getAmenities({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter,
    }),
    keepPreviousData: true,
  })

  // Delete amenity mutation
  const deleteAmenityMutation = useMutation({
    mutationFn: amenitiesApi.deleteAmenity,
    onSuccess: () => {
      message.success('Amenity deleted successfully')
      queryClient.invalidateQueries(['amenities'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete amenity')
    },
  })

  // Create amenity mutation
  const createAmenityMutation = useMutation({
    mutationFn: amenitiesApi.createAmenity,
    onSuccess: () => {
      message.success('Amenity created successfully')
      setCreateModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['amenities'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create amenity')
    },
  })

  // Update amenity mutation
  const updateAmenityMutation = useMutation({
    mutationFn: ({ id, data }) => amenitiesApi.updateAmenity(id, data),
    onSuccess: () => {
      message.success('Amenity updated successfully')
      setEditModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['amenities'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update amenity')
    },
  })

  const handleDeleteAmenity = (amenityId) => {
    deleteAmenityMutation.mutate(amenityId)
  }

  const handleCreateAmenity = (values) => {
    console.log('🚀 Creating amenity with values:', values)
    const amenityData = {
      ...values,
      isActive: values.isActive !== false, // Default to true if not specified
    }
    console.log('📤 Sending to API:', amenityData)
    createAmenityMutation.mutate(amenityData)
  }

  const handleViewAmenity = (amenity) => {
    setSelectedAmenity(amenity)
    setViewModalVisible(true)
  }

  const handleEditAmenity = (amenity) => {
    setSelectedAmenity(amenity)
    form.setFieldsValue({
      name: amenity.name,
      description: amenity.description,
      category: amenity.category,
      icon: amenity.icon,
      isActive: amenity.is_active, // Use backend field name
    })
    setEditModalVisible(true)
  }

  const handleUpdateAmenity = (values) => {
    const amenityData = {
      ...values,
      isActive: values.isActive !== false,
    }
    updateAmenityMutation.mutate({ id: selectedAmenity._id, data: amenityData })
  }

  const columns = [
    {
      title: 'Amenity',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            {record.icon || <HomeOutlined />}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{text || 'No name'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.description ? (record.description.length > 50 ? record.description.substring(0, 50) + '...' : record.description) : 'No description'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const colorMap = {
          'interior': 'blue',
          'exterior': 'green',
          'community': 'orange',
          'safety': 'red',
          'recreation': 'purple',
          'general': 'default',
        }
        return (
          <Tag color={colorMap[category] || 'default'}>
            {(category || 'general').toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active', // Backend field name
      key: 'isActive',
      render: (is_active) => (
        <Tag color={is_active ? 'green' : 'red'} icon={is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {is_active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Created',
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
            title="View Amenity"
            onClick={() => handleViewAmenity(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit Amenity"
            onClick={() => handleEditAmenity(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this amenity?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteAmenity(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Amenity"
              loading={deleteAmenityMutation.isLoading}
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

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value)
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
        <Title level={2} style={{ margin: 0 }}>Amenities Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Add Amenity
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search amenities..."
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && setSearchTerm('')}
          />
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 150 }}
            onChange={handleCategoryFilter}
            value={categoryFilter || undefined}
          >
            <Option value="interior">Interior</Option>
            <Option value="exterior">Exterior</Option>
            <Option value="community">Community</Option>
            <Option value="safety">Safety</Option>
            <Option value="recreation">Recreation</Option>
            <Option value="general">General</Option>
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

        {/* Amenities Table */}
        {error ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Typography.Text type="danger">
              Error loading amenities: {error.message || 'Unknown error'}
            </Typography.Text>
            <br />
            <Button 
              type="primary" 
              onClick={() => queryClient.invalidateQueries(['amenities'])}
              style={{ marginTop: 16 }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={Array.isArray(amenitiesData) ? amenitiesData : amenitiesData?.data || []}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: Array.isArray(amenitiesData) ? amenitiesData.length : amenitiesData?.pagination?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} amenities`,
            }}
            onChange={handleTableChange}
            rowKey="_id"
            locale={{ emptyText: 'No amenities found' }}
          />
        )}
      </Card>

      {/* Create Amenity Modal */}
      <Modal
        title="Create New Amenity"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreateModalVisible(false)
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
            loading={createAmenityMutation.isLoading}
          >
            Create Amenity
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAmenity}
          initialValues={{
            isActive: true,
            category: 'general',
          }}
        >
          <Form.Item
            name="name"
            label="Amenity Name"
            rules={[
              { required: true, message: 'Please enter amenity name' },
              { max: 100, message: 'Name cannot exceed 100 characters' },
            ]}
          >
            <Input 
              prefix={<HomeOutlined />} 
              placeholder="Enter amenity name"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter description' },
              { max: 200, message: 'Description cannot exceed 200 characters' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter amenity description"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="interior">Interior</Option>
                  <Option value="exterior">Exterior</Option>
                  <Option value="community">Community</Option>
                  <Option value="safety">Safety</Option>
                  <Option value="recreation">Recreation</Option>
                  <Option value="general">General</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="icon"
                label="Icon (Emoji/Text)"
              >
                <Input placeholder="Enter icon or emoji (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Amenity Modal */}
      <Modal
        title="Amenity Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        {selectedAmenity && (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 16px'
                }}>
                  {selectedAmenity.icon || <HomeOutlined />}
                </div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedAmenity.name || 'No Name'}
                </Title>
                <Tag color={
                  selectedAmenity.category === 'interior' ? 'blue' :
                  selectedAmenity.category === 'exterior' ? 'green' :
                  selectedAmenity.category === 'community' ? 'orange' :
                  selectedAmenity.category === 'safety' ? 'red' :
                  selectedAmenity.category === 'recreation' ? 'purple' : 'default'
                } style={{ marginBottom: 16 }}>
                  {(selectedAmenity.category || 'other').toUpperCase()}
                </Tag>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <Tag 
                    color={selectedAmenity.is_active ? 'green' : 'red'}
                    icon={selectedAmenity.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {selectedAmenity.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Tag>
                </div>
              </div>

              <Divider />

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Amenity ID">
                  <Typography.Text copyable style={{ fontSize: 12 }}>{selectedAmenity._id}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {selectedAmenity.createdAt ? new Date(selectedAmenity.createdAt).toLocaleDateString() : 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {selectedAmenity.updatedAt ? new Date(selectedAmenity.updatedAt).toLocaleString() : 'Never'}
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col xs={24} lg={16}>
              <Descriptions title="Amenity Information" column={1} size="small">
                <Descriptions.Item label="Name">
                  {selectedAmenity.name || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  <Tag color={
                    selectedAmenity.category === 'interior' ? 'blue' :
                    selectedAmenity.category === 'exterior' ? 'green' :
                    selectedAmenity.category === 'community' ? 'orange' :
                    selectedAmenity.category === 'safety' ? 'red' :
                    selectedAmenity.category === 'recreation' ? 'purple' : 'default'
                  }>
                    {(selectedAmenity.category || 'other').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag 
                    color={selectedAmenity.is_active ? 'green' : 'red'}
                    icon={selectedAmenity.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {selectedAmenity.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedAmenity.description || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Icon">
                  {selectedAmenity.icon ? (
                    <span style={{ fontSize: '24px' }}>{selectedAmenity.icon}</span>
                  ) : 'Not provided'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Edit Amenity Modal */}
      <Modal
        title="Edit Amenity"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditModalVisible(false)
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
            loading={updateAmenityMutation.isLoading}
          >
            Update Amenity
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateAmenity}
        >
          <Form.Item
            name="name"
            label="Amenity Name"
            rules={[
              { required: true, message: 'Please enter amenity name' },
              { max: 100, message: 'Name cannot exceed 100 characters' },
            ]}
          >
            <Input 
              prefix={<HomeOutlined />} 
              placeholder="Enter amenity name"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter description' },
              { max: 200, message: 'Description cannot exceed 200 characters' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter amenity description"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="interior">Interior</Option>
                  <Option value="exterior">Exterior</Option>
                  <Option value="community">Community</Option>
                  <Option value="safety">Safety</Option>
                  <Option value="recreation">Recreation</Option>
                  <Option value="general">General</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="icon"
                label="Icon (Emoji/Text)"
              >
                <Input placeholder="Enter icon or emoji (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AmenitiesList
