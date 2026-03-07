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
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const AdsList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedAd, setSelectedAd] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

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

  const handleViewAd = (ad) => {
    setSelectedAd(ad)
    setDetailModalVisible(true)
  }

  const handleStatusToggle = (adId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    updateAdMutation.mutate({ id: adId, data: { status: newStatus } })
  }

  const handleDeleteAd = (adId) => {
    deleteAdMutation.mutate(adId)
  }

  const columns = [
    {
      title: 'Advertisement',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space>
          <Avatar size="small" icon={<DollarCircleOutlined />} src={record.image_url} />
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
        <Button type="primary" icon={<PlusOutlined />}>
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

      {/* Advertisement Detail Modal */}
      <Modal
        title="Advertisement Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedAd && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Title:</strong> {selectedAd.title}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Description:</strong>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedAd.description || 'No description'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Type:</strong>{' '}
              <Tag color={
                selectedAd.ad_type === 'banner' ? 'blue' :
                selectedAd.ad_type === 'sidebar' ? 'green' :
                selectedAd.ad_type === 'popup' ? 'orange' : 'purple'
              }>
                {(selectedAd.ad_type || 'unknown').toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Position:</strong>{' '}
              <Tag color={
                selectedAd.position === 'header' ? 'red' :
                selectedAd.position === 'footer' ? 'blue' :
                selectedAd.position === 'sidebar' ? 'green' : 'orange'
              }>
                {(selectedAd.position || 'unknown').toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Status:</strong>{' '}
              <Badge
                status={selectedAd.status === 'active' ? 'success' : 'error'}
                text={selectedAd.status === 'active' ? 'Active' : 'Inactive'}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Performance:</strong>
              <div style={{ marginTop: 8, display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedAd.impressions || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Impressions</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedAd.clicks || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Clicks</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedAd.impressions ? 
                      ((selectedAd.clicks / selectedAd.impressions) * 100).toFixed(2) + '%' : 
                      '0%'
                    }
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>CTR</div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Duration:</strong>{' '}
              {selectedAd.start_date ? new Date(selectedAd.start_date).toLocaleDateString() : 'No start'} - {' '}
              {selectedAd.end_date ? new Date(selectedAd.end_date).toLocaleDateString() : 'No end'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Created By:</strong> {selectedAd.created_by?.name || 'Unknown'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Created:</strong> {new Date(selectedAd.createdAt).toLocaleString()}
            </div>
            {selectedAd.image_url && (
              <div style={{ marginBottom: 16 }}>
                <strong>Image:</strong>
                <div style={{ marginTop: 8 }}>
                  <img 
                    src={selectedAd.image_url} 
                    alt={selectedAd.title}
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdsList
