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
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

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

  const queryClient = useQueryClient()

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

  const handleApproveProperty = (propertyId) => {
    approvePropertyMutation.mutate(propertyId)
  }

  const handleRejectProperty = (propertyId) => {
    rejectPropertyMutation.mutate({ id: propertyId, reason: 'Rejected by admin' })
  }

  const handleDeleteProperty = (propertyId) => {
    deletePropertyMutation.mutate(propertyId)
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
          active: 'green',
          pending: 'orange',
          sold: 'blue',
          rented: 'purple',
        }
        return (
          <Tag color={colorMap[status] || 'default'}>
            {(status || 'unknown').toUpperCase()}
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
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit Property"
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
        <Button type="primary" icon={<PlusOutlined />}>
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
            <Option value="active">Active</Option>
            <Option value="pending">Pending</Option>
            <Option value="sold">Sold</Option>
            <Option value="rented">Rented</Option>
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
    </div>
  )
}

export default PropertiesList
