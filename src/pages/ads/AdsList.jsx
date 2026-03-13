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
  Switch,
  Form,
  Upload,
  Row,
  Col,
  Divider,
  Descriptions,
  Image,
  DatePicker,
  InputNumber,
} from 'antd'
import {
  DollarCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StopOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const AdsList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedAd, setSelectedAd] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState(null)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch advertisements data
  const {
    data: adsData,
    isLoading,
  } = useQuery({
    queryKey: ['advertisements', currentPage, pageSize, searchTerm, statusFilter, typeFilter],
    queryFn: () => adminApi.getAdvertisements({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
      ad_type: typeFilter,
    }),
    keepPreviousData: true,
  })

  // Update advertisement mutation
  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateAdvertisement(id, data),
    onSuccess: () => {
      message.success('Advertisement updated successfully')
      queryClient.invalidateQueries(['advertisements'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update advertisement')
    },
  })

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: adminApi.deleteAdvertisement,
    onSuccess: () => {
      message.success('Advertisement deleted successfully')
      queryClient.invalidateQueries(['advertisements'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete advertisement')
    },
  })

  // Create advertisement mutation
  const createAdMutation = useMutation({
    mutationFn: adminApi.createAdvertisement,
    onSuccess: () => {
      message.success('Advertisement created successfully')
      setCreateModalVisible(false)
      setImageUrl(null)
      form.resetFields()
      queryClient.invalidateQueries(['advertisements'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create advertisement')
    },
  })

  const handleDeleteAd = (adId) => {
    deleteAdMutation.mutate(adId)
  }

  const handleCreateAd = (values) => {
    const adData = {
      advertiser_name: values.advertiser_name,
      advertiser_email: values.advertiser_email,
      title: values.title,
      description: values.description,
      link: values.target_url,
      image: imageUrl || 'https://via.placeholder.com/300x200?text=Ad+Image', // Default placeholder
      image_key: imageUrl?.split('/').pop() || 'placeholder-image.jpg', // Default key
      cost: values.cost,
      ad_type: values.ad_type,
      position: values.position,
      status: values.status ? 'active' : 'inactive',
      start_date: values.dateRange?.[0]?.toISOString(),
      end_date: values.dateRange?.[1]?.toISOString(),
    }
    delete adData.dateRange
    delete adData.target_url
    createAdMutation.mutate(adData)
  }

  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url)
      message.success('Ad image uploaded successfully')
    } else if (info.file.status === 'error') {
      message.error('Failed to upload ad image')
    }
  }

  const handleEditImageChange = (info) => {
    if (info.file.status === 'done') {
      setEditImageUrl(info.file.response.url)
      message.success('Ad image updated successfully')
    } else if (info.file.status === 'error') {
      message.error('Failed to upload ad image')
    }
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!')
      return false
    }
    return true
  }

  const uploadProps = {
    name: 'ad_image',
    action: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload/image`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    beforeUpload,
    onChange: handleImageChange,
    showUploadList: false,
  }

  const handleViewAd = (ad) => {
    setSelectedAd(ad)
    setViewModalVisible(true)
  }

  const handleEditAd = (ad) => {
    setSelectedAd(ad)
    setEditImageUrl(ad.image_url || ad.image) // Handle both field names
    form.setFieldsValue({
      title: ad.title,
      description: ad.description,
      advertiser_name: ad.advertiser_name,
      advertiser_email: ad.advertiser_email,
      cost: ad.cost,
      ad_type: ad.ad_type,
      position: ad.position,
      status: ad.status === 'active',
      dateRange: ad.start_date && ad.end_date ? [
        new Date(ad.start_date),
        new Date(ad.end_date)
      ] : null,
      target_url: ad.link || ad.target_url, // Handle both field names
    })
    setEditModalVisible(true)
  }

  const handleStatusToggle = (adId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    updateAdMutation.mutate({ id: adId, data: { status: newStatus } })
  }

  const columns = [
    {
      title: 'Advertisement',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space>
          <Avatar size="small" icon={<DollarCircleOutlined />} src={record.image_url || record.image} />
          <div>
            <div style={{ fontWeight: 500 }}>{title || 'Untitled'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.description || 'No description'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'ad_type',
      key: 'ad_type',
      render: (type) => {
        const colorMap = {
          banner: 'blue',
          sidebar: 'green',
          popup: 'orange',
          featured: 'purple',
        }
        return (
          <Tag color={colorMap[type] || 'default'}>
            {(type || 'unknown').toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (position) => {
        const colorMap = {
          header: 'red',
          footer: 'blue',
          sidebar: 'green',
          content: 'orange',
          homepage: 'purple',
        }
        return (
          <Tag color={colorMap[position] || 'default'}>
            {(position || 'unknown').toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'error'}
          text={status === 'active' ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            <strong>Views:</strong> {record.impressions || 0}
          </div>
          <div style={{ fontSize: '12px' }}>
            <strong>Clicks:</strong> {record.clicks || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <strong>CTR:</strong> {record.impressions ? 
              ((record.clicks / record.impressions) * 100).toFixed(2) + '%' : 
              '0%'
            }
          </div>
        </div>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {record.start_date ? new Date(record.start_date).toLocaleDateString() : 'No start'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.end_date ? new Date(record.end_date).toLocaleDateString() : 'No end'}
          </div>
        </div>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
      render: (creator) => creator?.name || 'Unknown',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewAd(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Advertisement">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditAd(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Activate'}>
            <Button
              type="text"
              size="small"
              icon={record.status === 'active' ? <StopOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleStatusToggle(record._id, record.status)}
              loading={updateAdMutation.isLoading}
              style={{ 
                color: record.status === 'active' ? '#FF4D4F' : '#52C41A' 
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this advertisement?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteAd(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Advertisement"
              loading={deleteAdMutation.isLoading}
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

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Advertisements Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Create Advertisement
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search advertisements..."
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
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          <Select
            placeholder="Filter by type"
            allowClear
            style={{ width: 150 }}
            onChange={handleTypeFilter}
            value={typeFilter || undefined}
          >
            <Option value="banner">Banner</Option>
            <Option value="sidebar">Sidebar</Option>
            <Option value="popup">Popup</Option>
            <Option value="featured">Featured</Option>
          </Select>
        </div>

        {/* Advertisements Table */}
        <Table
          columns={columns}
          dataSource={adsData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: adsData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} advertisements`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No advertisements found' }}
        />
      </Card>

      {/* Create Advertisement Modal */}
      <Modal
        title="Create New Advertisement"
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
            loading={createAdMutation.isLoading}
          >
            Create Advertisement
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAd}
          initialValues={{
            status: true,
            ad_type: 'banner',
            position: 'header',
          }}
        >
          <Row gutter={[16, 0]}>
            {/* Left Column - Image and Basic Info */}
            <Col xs={24} lg={10}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Upload {...uploadProps}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
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
                      <img src={imageUrl} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <UploadOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
                        <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>Upload Ad Image</div>
                      </div>
                    )}
                  </div>
                </Upload>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Click to upload ad image (JPG/PNG, max 5MB)
                </div>
              </div>

              <Form.Item
                name="title"
                label="Advertisement Title"
                rules={[
                  { required: true, message: 'Please enter advertisement title' },
                  { max: 100, message: 'Title cannot exceed 100 characters' },
                ]}
              >
                <Input 
                  prefix={<DollarCircleOutlined />} 
                  placeholder="Enter advertisement title"
                />
              </Form.Item>

              <Form.Item
                name="advertiser_name"
                label="Advertiser Name"
                rules={[
                  { required: true, message: 'Please enter advertiser name' },
                  { max: 100, message: 'Name cannot exceed 100 characters' },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter advertiser name"
                />
              </Form.Item>

              <Form.Item
                name="advertiser_email"
                label="Advertiser Email"
                rules={[
                  { required: true, message: 'Please enter advertiser email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Enter advertiser email"
                />
              </Form.Item>

              <Form.Item
                name="cost"
                label="Cost ($)"
                rules={[
                  { required: true, message: 'Please enter advertisement cost' },
                  { type: 'number', min: 0, message: 'Cost must be a positive number' },
                ]}
              >
                <InputNumber 
                  prefix={<DollarCircleOutlined />} 
                  placeholder="Enter advertisement cost"
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            {/* Right Column - Advertisement Details */}
            <Col xs={24} lg={14}>
              <Divider orientation="left">Advertisement Details</Divider>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="ad_type"
                    label="Advertisement Type"
                    rules={[{ required: true, message: 'Please select advertisement type' }]}
                  >
                    <Select placeholder="Select advertisement type">
                      <Option value="banner">Banner</Option>
                      <Option value="sidebar">Sidebar</Option>
                      <Option value="popup">Popup</Option>
                      <Option value="featured_agent">Featured Agent</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="position"
                    label="Position"
                    rules={[{ required: true, message: 'Please select position' }]}
                  >
                    <Select placeholder="Select position">
                      <Option value="home_top">Home Top</Option>
                      <Option value="home_middle">Home Middle</Option>
                      <Option value="home_bottom">Home Bottom</Option>
                      <Option value="search_sidebar">Search Sidebar</Option>
                      <Option value="property_detail">Property Detail</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter advertisement description (optional)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="target_url"
                label="Advertisement Link"
                rules={[
                  { required: true, message: 'Please enter advertisement link' },
                  { type: 'url', message: 'Please enter a valid URL' },
                ]}
              >
                <Input 
                  placeholder="Enter advertisement link"
                />
              </Form.Item>

              <Divider orientation="left">Schedule & Status</Divider>

              <Form.Item
                name="dateRange"
                label="Advertisement Duration"
                rules={[{ required: true, message: 'Please select advertisement duration' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['Start Date', 'End Date']}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Advertisement Modal */}
      <Modal
        title="Advertisement Details"
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
        {selectedAd && (
          <Row gutter={[24, 24]}>
            {/* Ad Image Card */}
            <Col xs={24} lg={8}>
              <div style={{ textAlign: 'center' }}>
                {selectedAd.image_url || selectedAd.image ? (
                  <Image
                    width={150}
                    height={150}
                    src={selectedAd.image_url || selectedAd.image}
                    alt={selectedAd.title}
                    style={{ borderRadius: 8, marginBottom: 16 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 150,
                      height: 150,
                      border: '2px dashed #d9d9d9',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      background: '#fafafa'
                    }}
                  >
                    <DollarCircleOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
                  </div>
                )}
                <Title level={4} style={{ margin: 0 }}>
                  {selectedAd.title || 'Untitled'}
                </Title>
                <Tag color={
                  selectedAd.ad_type === 'banner' ? 'blue' :
                  selectedAd.ad_type === 'sidebar' ? 'green' :
                  selectedAd.ad_type === 'popup' ? 'orange' : 'purple'
                } style={{ marginBottom: 16 }}>
                  {(selectedAd.ad_type || 'unknown').toUpperCase()}
                </Tag>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <Tag 
                    color={selectedAd.status === 'active' ? 'green' : 'red'}
                    icon={selectedAd.status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {selectedAd.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                  </Tag>
                </div>
              </div>

              <Divider />

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Ad ID">
                  <Typography.Text copyable style={{ fontSize: 12 }}>{selectedAd._id}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Position">
                  <Tag color={
                    selectedAd.position === 'home_top' ? 'red' :
                    selectedAd.position === 'home_middle' ? 'blue' :
                    selectedAd.position === 'home_bottom' ? 'green' :
                    selectedAd.position === 'search_sidebar' ? 'orange' : 'purple'
                  }>
                    {selectedAd.position === 'home_top' ? 'HOME TOP' :
                     selectedAd.position === 'home_middle' ? 'HOME MIDDLE' :
                     selectedAd.position === 'home_bottom' ? 'HOME BOTTOM' :
                     selectedAd.position === 'search_sidebar' ? 'SEARCH SIDEBAR' :
                     selectedAd.position === 'property_detail' ? 'PROPERTY DETAIL' : 'UNKNOWN'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {selectedAd.createdAt ? new Date(selectedAd.createdAt).toLocaleDateString() : 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {selectedAd.created_by?.name || 'Unknown'}
                </Descriptions.Item>
              </Descriptions>
            </Col>

            {/* Ad Information Card */}
            <Col xs={24} lg={16}>
              <Descriptions title="Advertisement Information" column={2} size="small">
                <Descriptions.Item label="Title" span={2}>
                  {selectedAd.title || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Advertiser Name" span={1}>
                  {selectedAd.advertiser_name || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Advertiser Email" span={1}>
                  {selectedAd.advertiser_email ? (
                    <Typography.Link href={`mailto:${selectedAd.advertiser_email}`}>
                      {selectedAd.advertiser_email}
                    </Typography.Link>
                  ) : 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Cost" span={1}>
                  ${selectedAd.cost || '0'}
                </Descriptions.Item>
                <Descriptions.Item label="Advertisement Type" span={1}>
                  <Tag color={
                    selectedAd.ad_type === 'banner' ? 'blue' :
                    selectedAd.ad_type === 'sidebar' ? 'green' :
                    selectedAd.ad_type === 'popup' ? 'orange' : 'purple'
                  }>
                    {selectedAd.ad_type === 'featured_agent' ? 'FEATURED AGENT' :
                     selectedAd.ad_type === 'banner' ? 'BANNER' :
                     selectedAd.ad_type === 'sidebar' ? 'SIDEBAR' :
                     selectedAd.ad_type === 'popup' ? 'POPUP' : 'UNKNOWN'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                  <Tag color={selectedAd.status === 'active' ? 'green' : 'red'}>
                    {selectedAd.status === 'active' ? 'Active' : 'Inactive'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Advertisement Link" span={2}>
                  {selectedAd.link || selectedAd.target_url ? (
                    <Typography.Link href={selectedAd.link || selectedAd.target_url} target="_blank">
                      {selectedAd.link || selectedAd.target_url}
                    </Typography.Link>
                  ) : 'Not provided'}
                </Descriptions.Item>
              </Descriptions>

              {selectedAd.description && (
                <Descriptions title="Description" column={1} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Advertisement Description">
                    <div style={{ 
                      padding: 12, 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 6,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedAd.description}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              )}

              <Descriptions title="Schedule Information" column={2} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Start Date" span={1}>
                  {selectedAd.start_date ? new Date(selectedAd.start_date).toLocaleDateString() : 'Not set'}
                </Descriptions.Item>
                <Descriptions.Item label="End Date" span={1}>
                  {selectedAd.end_date ? new Date(selectedAd.end_date).toLocaleDateString() : 'Not set'}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions title="Performance Metrics" column={3} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Impressions" span={1}>
                  <Typography.Text strong>{selectedAd.impressions || 0}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Clicks" span={1}>
                  <Typography.Text strong>{selectedAd.clicks || 0}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="CTR" span={1}>
                  <Typography.Text strong>
                    {selectedAd.impressions ? 
                      ((selectedAd.clicks / selectedAd.impressions) * 100).toFixed(2) + '%' : 
                      '0%'
                    }
                  </Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Edit Advertisement Modal */}
      <Modal
        title="Edit Advertisement"
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
            loading={updateAdMutation.isLoading}
          >
            Update Advertisement
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
              const adData = {
                advertiser_name: values.advertiser_name,
                advertiser_email: values.advertiser_email,
                title: values.title,
                description: values.description,
                link: values.target_url,
                image: editImageUrl,
                image_key: editImageUrl?.split('/').pop(), // Extract filename from URL
                cost: values.cost,
                ad_type: values.ad_type,
                position: values.position,
                status: values.status ? 'active' : 'inactive',
                start_date: values.dateRange?.[0]?.toISOString(),
                end_date: values.dateRange?.[1]?.toISOString(),
              }
              delete adData.dateRange
              delete adData.target_url
              
              await adminApi.updateAdvertisement(selectedAd._id, adData)
              message.success('Advertisement updated successfully!')
              setEditModalVisible(false)
              setEditImageUrl(null)
              form.resetFields()
              queryClient.invalidateQueries(['advertisements'])
            } catch (error) {
              message.error(error.response?.data?.message || 'Failed to update advertisement')
            }
          }}
        >
          <Row gutter={[24, 0]}>
            {/* Left Column - Image and Basic Info */}
            <Col xs={24} lg={8}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Upload
                  name="ad_image"
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
                      borderRadius: '8px',
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
                      <img src={editImageUrl} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <UploadOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
                        <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>Upload Ad Image</div>
                      </div>
                    )}
                  </div>
                </Upload>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  Click to upload ad image (JPG/PNG, max 5MB)
                </Typography.Text>
              </div>

              <Form.Item
                name="title"
                label="Advertisement Title"
                rules={[
                  { required: true, message: 'Please enter advertisement title' },
                  { max: 100, message: 'Title cannot exceed 100 characters' },
                ]}
              >
                <Input 
                  prefix={<DollarCircleOutlined />} 
                  placeholder="Enter advertisement title"
                />
              </Form.Item>

              <Form.Item
                name="advertiser_name"
                label="Advertiser Name"
                rules={[
                  { required: true, message: 'Please enter advertiser name' },
                  { max: 100, message: 'Name cannot exceed 100 characters' },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter advertiser name"
                />
              </Form.Item>

              <Form.Item
                name="advertiser_email"
                label="Advertiser Email"
                rules={[
                  { required: true, message: 'Please enter advertiser email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Enter advertiser email"
                />
              </Form.Item>

              <Form.Item
                name="cost"
                label="Cost ($)"
                rules={[
                  { required: true, message: 'Please enter advertisement cost' },
                  { type: 'number', min: 0, message: 'Cost must be a positive number' },
                ]}
              >
                <InputNumber 
                  prefix={<DollarCircleOutlined />} 
                  placeholder="Enter advertisement cost"
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            {/* Right Column - Advertisement Details */}
            <Col xs={24} lg={16}>
              <Divider orientation="left">Advertisement Information</Divider>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="ad_type"
                    label="Advertisement Type"
                    rules={[{ required: true, message: 'Please select advertisement type' }]}
                  >
                    <Select placeholder="Select advertisement type">
                      <Option value="banner">Banner</Option>
                      <Option value="sidebar">Sidebar</Option>
                      <Option value="popup">Popup</Option>
                      <Option value="featured_agent">Featured Agent</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="position"
                    label="Position"
                    rules={[{ required: true, message: 'Please select position' }]}
                  >
                    <Select placeholder="Select position">
                      <Option value="home_top">Home Top</Option>
                      <Option value="home_middle">Home Middle</Option>
                      <Option value="home_bottom">Home Bottom</Option>
                      <Option value="search_sidebar">Search Sidebar</Option>
                      <Option value="property_detail">Property Detail</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter advertisement description (optional)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="target_url"
                label="Advertisement Link"
                rules={[
                  { required: true, message: 'Please enter advertisement link' },
                  { type: 'url', message: 'Please enter a valid URL' },
                ]}
              >
                <Input 
                  placeholder="Enter advertisement link"
                />
              </Form.Item>

              <Divider orientation="left">Schedule & Status</Divider>

              <Form.Item
                name="dateRange"
                label="Advertisement Duration"
                rules={[{ required: true, message: 'Please select advertisement duration' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['Start Date', 'End Date']}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default AdsList
