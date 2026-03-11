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
  Rate,
  message,
  Popconfirm,
  Modal,
  Form,
  Row,
  Col,
  Divider,
  Descriptions,
  Image,
} from 'antd'
import {
  StarOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../../services/api/reviewsApi'
import { propertiesApi } from '../../services/api/propertiesApi'
import { usersApi } from '../../services/api/usersApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select
const { TextArea } = Input

const PropertyReviews = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch property reviews data
  const {
    data: reviewsData,
    isLoading,
  } = useQuery({
    queryKey: ['propertyReviews', currentPage, pageSize, searchTerm, ratingFilter, statusFilter],
    queryFn: () => reviewsApi.getPropertyReviews({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      rating: ratingFilter,
      is_verified: statusFilter,
    }),
    keepPreviousData: true,
  })

  // Fetch properties for dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getProperties({ limit: 1000 }),
  })

  // Fetch users for dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ limit: 1000 }),
  })

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: reviewsApi.deletePropertyReview,
    onSuccess: () => {
      message.success('Review deleted successfully')
      queryClient.invalidateQueries(['propertyReviews'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete review')
    },
  })

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: reviewsApi.createPropertyReview,
    onSuccess: () => {
      message.success('Review created successfully')
      setCreateModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['propertyReviews'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create review')
    },
  })

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => reviewsApi.updatePropertyReview(id, data),
    onSuccess: () => {
      message.success('Review updated successfully')
      setEditModalVisible(false)
      setSelectedReview(null)
      form.resetFields()
      queryClient.invalidateQueries(['propertyReviews'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update review')
    },
  })

  // Approve review mutation
  const approveReviewMutation = useMutation({
    mutationFn: (id) => reviewsApi.approveReview(id, 'properties'),
    onSuccess: () => {
      message.success('Review approved successfully')
      queryClient.invalidateQueries(['propertyReviews'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to approve review')
    },
  })

  // Reject review mutation
  const rejectReviewMutation = useMutation({
    mutationFn: ({ id, reason }) => reviewsApi.rejectReview(id, 'properties', reason),
    onSuccess: () => {
      message.success('Review rejected successfully')
      queryClient.invalidateQueries(['propertyReviews'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to reject review')
    },
  })

  const handleDeleteReview = (reviewId) => {
    deleteReviewMutation.mutate(reviewId)
  }

  const handleCreateReview = (values) => {
    createReviewMutation.mutate(values)
  }

  const handleUpdateReview = (values) => {
    updateReviewMutation.mutate({ id: selectedReview._id, data: values })
  }

  const handleApproveReview = (reviewId) => {
    approveReviewMutation.mutate(reviewId)
  }

  const handleRejectReview = (reviewId) => {
    Modal.confirm({
      title: 'Reject Review',
      content: (
        <Input.TextArea
          placeholder="Please provide a reason for rejection..."
          id="rejection-reason"
          rows={3}
        />
      ),
      onOk: () => {
        const reason = document.getElementById('rejection-reason')?.value || ''
        rejectReviewMutation.mutate({ id: reviewId, reason })
      },
    })
  }

  const handleViewReview = (review) => {
    setSelectedReview(review)
    setViewModalVisible(true)
  }

  const handleEditReview = (review) => {
    setSelectedReview(review)
    form.setFieldsValue({
      user_id: review.user_id?._id,
      property_id: review.property_id?._id,
      rating: review.rating,
      comment: review.comment,
      is_verified: review.is_verified,
    })
    setEditModalVisible(true)
  }

  const columns = [
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
              {property?.location?.city || 'No location'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (user) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={user?.profile_image} />
          <div>
            <div style={{ fontWeight: 500 }}>{user?.name || 'Unknown User'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{user?.email || 'No email'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
          <span style={{ fontWeight: 500 }}>{rating}/5</span>
        </Space>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => (
        <div style={{ maxWidth: 200 }}>
          {comment?.length > 100 ? `${comment.substring(0, 100)}...` : comment || 'No comment'}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (isVerified) => (
        <Tag color={isVerified ? 'green' : 'orange'} icon={isVerified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isVerified ? 'VERIFIED' : 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Date',
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
            title="View Review"
            onClick={() => handleViewReview(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit Review"
            onClick={() => handleEditReview(record)}
          />
          {record.is_verified ? (
            <Button
              type="text"
              danger
              size="small"
              title="Reject Review"
              onClick={() => handleRejectReview(record._id)}
              loading={rejectReviewMutation.isLoading}
            >
              Reject
            </Button>
          ) : (
            <Button
              type="text"
              color="green"
              size="small"
              title="Approve Review"
              onClick={() => handleApproveReview(record._id)}
              loading={approveReviewMutation.isLoading}
            >
              Approve
            </Button>
          )}
          <Popconfirm
            title="Are you sure you want to delete this review?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteReview(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Review"
              loading={deleteReviewMutation.isLoading}
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

  const handleRatingFilter = (value) => {
    setRatingFilter(value)
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
        <Title level={2} style={{ margin: 0 }}>Property Reviews Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Add Review
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search reviews..."
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && setSearchTerm('')}
          />
          <Select
            placeholder="Filter by rating"
            allowClear
            style={{ width: 150 }}
            onChange={handleRatingFilter}
            value={ratingFilter || undefined}
          >
            <Option value="5">5 Stars</Option>
            <Option value="4">4 Stars</Option>
            <Option value="3">3 Stars</Option>
            <Option value="2">2 Stars</Option>
            <Option value="1">1 Star</Option>
          </Select>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            value={statusFilter || undefined}
          >
            <Option value="true">Verified</Option>
            <Option value="false">Pending</Option>
          </Select>
        </div>

        {/* Reviews Table */}
        <Table
          columns={columns}
          dataSource={reviewsData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: reviewsData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} reviews`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No reviews found' }}
        />
      </Card>

      {/* Create Review Modal */}
      <Modal
        title="Create New Property Review"
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
            loading={createReviewMutation.isLoading}
          >
            Create Review
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateReview}
        >
          <Form.Item
            name="user_id"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select user">
              {usersData?.data?.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.name} - {user.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="property_id"
            label="Property"
            rules={[{ required: true, message: 'Please select a property' }]}
          >
            <Select placeholder="Select property">
              {propertiesData?.data?.map(property => (
                <Option key={property._id} value={property._id}>
                  {property.title} - {property.location?.city}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Comment"
            rules={[{ required: true, message: 'Please provide a comment' }]}
          >
            <TextArea rows={4} placeholder="Enter review comment" maxLength={1000} showCount />
          </Form.Item>

          <Form.Item
            name="is_verified"
            label="Verification Status"
            initialValue={false}
          >
            <Select>
              <Option value={false}>Pending</Option>
              <Option value={true}>Verified</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Review Modal */}
      <Modal
        title="Review Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
        style={{ top: 20 }}
      >
        {selectedReview && (
          <div>
            <Descriptions title="Review Information" column={2} size="small">
              <Descriptions.Item label="Property" span={2}>
                <Space>
                  <HomeOutlined />
                  {selectedReview.property_id?.title || 'Unknown Property'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="User" span={2}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} src={selectedReview.user_id?.profile_image} />
                  {selectedReview.user_id?.name || 'Unknown User'} ({selectedReview.user_id?.email})
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Space>
                  <Rate disabled defaultValue={selectedReview.rating} />
                  <span>{selectedReview.rating}/5</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedReview.is_verified ? 'green' : 'orange'}>
                  {selectedReview.is_verified ? 'VERIFIED' : 'PENDING'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Comment" span={2}>
                {selectedReview.comment}
              </Descriptions.Item>
              <Descriptions.Item label="Review Date">
                {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {selectedReview.updatedAt ? new Date(selectedReview.updatedAt).toLocaleDateString() : 'Never'}
              </Descriptions.Item>
            </Descriptions>

            {selectedReview.response && (
              <div style={{ marginTop: 16 }}>
                <Divider>Response</Divider>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Response">
                    {selectedReview.response}
                  </Descriptions.Item>
                  <Descriptions.Item label="Response Date">
                    {selectedReview.response_date ? new Date(selectedReview.response_date).toLocaleDateString() : 'Unknown'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        title="Edit Property Review"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setSelectedReview(null)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditModalVisible(false)
            setSelectedReview(null)
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
            loading={updateReviewMutation.isLoading}
          >
            Update Review
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateReview}
        >
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Comment"
            rules={[{ required: true, message: 'Please provide a comment' }]}
          >
            <TextArea rows={4} placeholder="Enter review comment" maxLength={1000} showCount />
          </Form.Item>

          <Form.Item
            name="is_verified"
            label="Verification Status"
          >
            <Select>
              <Option value={false}>Pending</Option>
              <Option value={true}>Verified</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PropertyReviews
