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
  Descriptions,
  Row,
  Col,
  Divider,
} from 'antd'
import {
  MessageOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select
const { TextArea } = Input

const InquiriesList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch users data for dropdowns
  const {
    data: usersData,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ['users-dropdown'],
    queryFn: () => adminApi.getUsers({
      page: 1,
      limit: 1000, // Get all users for dropdown
      role: 'user', // Only get regular users
    }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Fetch properties data for dropdowns
  const {
    data: propertiesData,
    isLoading: propertiesLoading,
  } = useQuery({
    queryKey: ['properties-dropdown'],
    queryFn: () => adminApi.getProperties({
      page: 1,
      limit: 1000, // Get all properties for dropdown
    }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Fetch inquiries data
  const {
    data: inquiriesData,
    isLoading,
  } = useQuery({
    queryKey: ['inquiries', currentPage, pageSize, searchTerm, statusFilter],
    queryFn: () => adminApi.getInquiries({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
    }),
    keepPreviousData: true,
  })

  // Update inquiry status mutation
  const updateInquiryStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateInquiryStatus(id, status),
    onSuccess: () => {
      message.success('Inquiry status updated successfully')
      queryClient.invalidateQueries(['inquiries'])
      setDetailModalVisible(false)
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update inquiry')
    },
  })

  // Delete inquiry mutation
  const deleteInquiryMutation = useMutation({
    mutationFn: adminApi.deleteInquiry,
    onSuccess: () => {
      message.success('Inquiry deleted successfully')
      queryClient.invalidateQueries(['inquiries'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete inquiry')
    },
  })

  // Create inquiry mutation
  const createInquiryMutation = useMutation({
    mutationFn: adminApi.createInquiry,
    onSuccess: () => {
      message.success('Inquiry created successfully')
      setCreateModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['inquiries'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create inquiry')
    },
  })

  // Update inquiry mutation
  const updateInquiryMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateInquiry(id, data),
    onSuccess: () => {
      message.success('Inquiry updated successfully')
      setEditModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['inquiries'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update inquiry')
    },
  })

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
    setDetailModalVisible(true)
  }

  const handleStatusUpdate = (inquiryId, newStatus) => {
    updateInquiryStatusMutation.mutate({ id: inquiryId, status: newStatus })
  }

  const handleDeleteInquiry = (inquiryId) => {
    deleteInquiryMutation.mutate(inquiryId)
  }

  const handleCreateInquiry = (values) => {
    createInquiryMutation.mutate(values)
  }

  const handleEditInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
    form.setFieldsValue({
      user_id: inquiry.user_id?._id,
      property_id: inquiry.property_id?._id,
      message: inquiry.message,
      status: inquiry.status,
      priority: inquiry.priority,
    })
    setEditModalVisible(true)
  }

  const handleUpdateInquiry = (values) => {
    updateInquiryMutation.mutate({ id: selectedInquiry._id, data: values })
  }

  const columns = [
    {
      title: 'User',
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
      title: 'Property',
      dataIndex: 'property_id',
      key: 'property_id',
      render: (property) => (
        <Space>
          <HomeOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{property?.title || 'Unknown Property'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              ${property?.price?.toLocaleString() || 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (message) => (
        <div style={{ maxWidth: 300 }}>
          <div style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontSize: '13px'
          }}>
            {message || 'No message'}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          pending: 'orange',
          responded: 'blue',
          closed: 'default',
        }
        return (
          <Tag color={colorMap[status] || 'default'}>
            {(status || 'unknown').toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colorMap = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        }
        return (
          <Tag color={colorMap[priority] || 'default'}>
            {(priority || 'medium').toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Received',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Unknown',
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
              onClick={() => handleViewInquiry(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Inquiry">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditInquiry(record)}
            />
          </Tooltip>
          {record.status !== 'closed' && (
            <Tooltip title="Mark as Resolved">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate(record._id, 'closed')}
                loading={updateInquiryStatusMutation.isLoading}
                style={{ color: '#52C41A' }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Are you sure you want to delete this inquiry?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteInquiry(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Inquiry"
              loading={deleteInquiryMutation.isLoading}
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

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Inquiries Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Add Inquiry
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search inquiries..."
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
            <Option value="pending">Pending</Option>
            <Option value="responded">Responded</Option>
            <Option value="closed">Closed</Option>
          </Select>
        </div>

        {/* Inquiries Table */}
        <Table
          columns={columns}
          dataSource={inquiriesData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: inquiriesData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} inquiries`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No inquiries found' }}
        />
      </Card>

      {/* Inquiry Detail Modal */}
      <Modal
        title="Inquiry Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedInquiry?.status !== 'closed' && (
            <Button
              key="resolve"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate(selectedInquiry._id, 'closed')}
              loading={updateInquiryStatusMutation.isLoading}
            >
              Mark as Closed
            </Button>
          ),
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedInquiry && (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Descriptions title="User Information" column={1} size="small">
                <Descriptions.Item label="Name">
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} src={selectedInquiry.user_id?.profile_image} />
                    {selectedInquiry.user_id?.name || 'No name'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedInquiry.user_id?.email || 'No email'}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedInquiry.user_id?.phone || 'No phone'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} lg={12}>
              <Descriptions title="Property Information" column={1} size="small">
                <Descriptions.Item label="Property Title">
                  {selectedInquiry.property_id?.title || 'Unknown Property'}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  ${selectedInquiry.property_id?.price?.toLocaleString() || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24}>
              <Descriptions title="Inquiry Details" column={2} size="small">
                <Descriptions.Item label="Status">
                  <Tag color={
                    selectedInquiry.status === 'pending' ? 'orange' :
                    selectedInquiry.status === 'responded' ? 'blue' :
                    selectedInquiry.status === 'closed' ? 'default' : 'default'
                  }>
                    {selectedInquiry.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Priority">
                  <Tag color={
                    selectedInquiry.priority === 'high' ? 'red' :
                    selectedInquiry.priority === 'medium' ? 'orange' :
                    selectedInquiry.priority === 'low' ? 'green' : 'default'
                  }>
                    {selectedInquiry.priority?.toUpperCase() || 'MEDIUM'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Received" span={2}>
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Message" span={2}>
                  <div style={{ 
                    marginTop: 8, 
                    padding: 12, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 6,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {selectedInquiry.message || 'No message'}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Create Inquiry Modal */}
      <Modal
        title="Create New Inquiry"
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
            loading={createInquiryMutation.isLoading}
          >
            Create Inquiry
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateInquiry}
          initialValues={{
            status: 'pending',
            priority: 'medium',
          }}
        >
          <Form.Item
            name="user_id"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select 
              placeholder="Select a user" 
              showSearch 
              loading={usersLoading}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {usersData?.data?.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.name} ({user.email}) {user.phone && `- ${user.phone}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="property_id"
            label="Property"
            rules={[{ required: true, message: 'Please select a property' }]}
          >
            <Select 
              placeholder="Select a property" 
              showSearch 
              loading={propertiesLoading}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {propertiesData?.data?.map(property => (
                <Option key={property._id} value={property._id}>
                  {property.title} - ${property.price?.toLocaleString()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter inquiry message"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="pending">Pending</Option>
                  <Option value="responded">Responded</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit Inquiry Modal */}
      <Modal
        title="Edit Inquiry"
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
            loading={updateInquiryMutation.isLoading}
          >
            Update Inquiry
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateInquiry}
        >
          <Form.Item
            name="user_id"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select 
              placeholder="Select a user" 
              showSearch 
              loading={usersLoading}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {usersData?.data?.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.name} ({user.email}) {user.phone && `- ${user.phone}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="property_id"
            label="Property"
            rules={[{ required: true, message: 'Please select a property' }]}
          >
            <Select 
              placeholder="Select a property" 
              showSearch 
              loading={propertiesLoading}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {propertiesData?.data?.map(property => (
                <Option key={property._id} value={property._id}>
                  {property.title} - ${property.price?.toLocaleString()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter inquiry message"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="pending">Pending</Option>
                  <Option value="responded">Responded</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default InquiriesList
