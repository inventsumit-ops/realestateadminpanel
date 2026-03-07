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

  const queryClient = useQueryClient()

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
          new: 'red',
          pending: 'orange',
          responded: 'blue',
          resolved: 'green',
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
          {record.status !== 'resolved' && (
            <Tooltip title="Mark as Resolved">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate(record._id, 'resolved')}
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
        <Button type="primary" icon={<PlusOutlined />}>
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
            <Option value="new">New</Option>
            <Option value="pending">Pending</Option>
            <Option value="responded">Responded</Option>
            <Option value="resolved">Resolved</Option>
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
          selectedInquiry?.status !== 'resolved' && (
            <Button
              key="resolve"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate(selectedInquiry._id, 'resolved')}
              loading={updateInquiryStatusMutation.isLoading}
            >
              Mark as Resolved
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedInquiry && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>User:</strong> {selectedInquiry.user_id?.name} ({selectedInquiry.user_id?.email})
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Property:</strong> {selectedInquiry.property_id?.title}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Status:</strong>{' '}
              <Tag color={
                selectedInquiry.status === 'new' ? 'red' :
                selectedInquiry.status === 'pending' ? 'orange' :
                selectedInquiry.status === 'responded' ? 'blue' :
                selectedInquiry.status === 'resolved' ? 'green' : 'default'
              }>
                {selectedInquiry.status?.toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Message:</strong>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedInquiry.message || 'No message'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Received:</strong> {new Date(selectedInquiry.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InquiriesList
