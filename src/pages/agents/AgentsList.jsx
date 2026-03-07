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

  const handleVerifyAgent = (agentId) => {
    verifyAgentMutation.mutate(agentId)
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
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit Agent"
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
        <Button type="primary" icon={<PlusOutlined />}>
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
    </div>
  )
}

export default AgentsList
