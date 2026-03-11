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
  Row,
  Col,
  Divider,
} from 'antd'
import {
  FileTextOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StopOutlined,
  PlayCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const BlogsList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch blog categories for dropdown
  const {
    data: blogCategoriesData,
    isLoading: blogCategoriesLoading,
  } = useQuery({
    queryKey: ['blogCategories'],
    queryFn: () => adminApi.getBlogCategories({ limit: 100, is_active: true }), // Get only active categories
  })

  // Fetch blogs data
  const {
    data: blogsData,
    isLoading,
  } = useQuery({
    queryKey: ['blogs', currentPage, pageSize, searchTerm, statusFilter, categoryFilter],
    queryFn: () => adminApi.getBlogs({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
      category: categoryFilter,
    }),
    keepPreviousData: true,
  })

  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateBlog(id, data),
    onSuccess: () => {
      message.success('Blog updated successfully')
      setEditModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['blogs'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update blog')
    },
  })

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: adminApi.deleteBlog,
    onSuccess: () => {
      message.success('Blog deleted successfully')
      queryClient.invalidateQueries(['blogs'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete blog')
    },
  })

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog)
    setDetailModalVisible(true)
  }

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog)
    form.setFieldsValue({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      category_id: blog.category_id?._id || blog.category_id,
      status: blog.status,
      featured_image: blog.featured_image,
      meta_title: blog.meta_title,
      meta_description: blog.meta_description,
    })
    setEditModalVisible(true)
  }

  const handleEditSubmit = (values) => {
    const blogData = {
      ...values,
      author: selectedBlog.author, // Preserve original author
    }
    updateBlogMutation.mutate({ id: selectedBlog._id, data: blogData })
  }

  const handleStatusToggle = (blogId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    updateBlogMutation.mutate({ id: blogId, data: { status: newStatus } })
  }

  const handleDeleteBlog = (blogId) => {
    deleteBlogMutation.mutate(blogId)
  }

  const columns = [
    {
      title: 'Blog Post',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space>
          <Avatar size="small" icon={<FileTextOutlined />} src={record.featured_image} />
          <div>
            <div style={{ fontWeight: 500 }}>{title || 'Untitled'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.slug || 'No slug'}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              {record.excerpt ? record.excerpt.substring(0, 100) + '...' : 'No excerpt'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author_id',
      key: 'author_id',
      render: (author) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={author?.profile_image} />
          <div>
            <div style={{ fontWeight: 500 }}>{author?.name || 'Unknown Author'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{author?.email || 'No email'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (category) => {
        const colorMap = {
          news: 'blue',
          tips: 'green',
          market: 'orange',
          guides: 'purple',
          featured: 'red',
        }
        return (
          <Tag color={colorMap[category?.name?.toLowerCase()] || 'default'}>
            {(category?.name || 'uncategorized').toUpperCase()}
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
          status={status === 'published' ? 'success' : status === 'draft' ? 'warning' : 'default'}
          text={(status || 'unknown').toUpperCase()}
        />
      ),
    },
    {
      title: 'Engagement',
      key: 'engagement',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            <strong>Views:</strong> {record.views_count || 0}
          </div>
          <div style={{ fontSize: '12px' }}>
            <strong>Comments:</strong> {record.comments_count || 0}
          </div>
          <div style={{ fontSize: '12px' }}>
            <strong>Likes:</strong> {record.likes_count || 0}
          </div>
        </div>
      ),
    },
    {
      title: 'SEO',
      key: 'seo',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            <strong>Meta Title:</strong> {record.meta_title ? '✓' : '✗'}
          </div>
          <div style={{ fontSize: '12px' }}>
            <strong>Meta Desc:</strong> {record.meta_description ? '✓' : '✗'}
          </div>
        </div>
      ),
    },
    {
      title: 'Published',
      dataIndex: 'published_at',
      key: 'published_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Not published',
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
              onClick={() => handleViewBlog(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Blog">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditBlog(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'published' ? 'Unpublish' : 'Publish'}>
            <Button
              type="text"
              size="small"
              icon={record.status === 'published' ? <StopOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleStatusToggle(record._id, record.status)}
              loading={updateBlogMutation.isLoading}
              style={{ 
                color: record.status === 'published' ? '#FF4D4F' : '#52C41A' 
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this blog post?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteBlog(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Blog"
              loading={deleteBlogMutation.isLoading}
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

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value)
    setCurrentPage(1)
  }

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Blog Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => window.dispatchEvent(new CustomEvent('openCreateBlogModal'))}
        >
          Create Blog Post
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search blog posts..."
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
            <Option value="published">Published</Option>
            <Option value="draft">Draft</Option>
            <Option value="archived">Archived</Option>
          </Select>
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 150 }}
            onChange={handleCategoryFilter}
            value={categoryFilter || undefined}
          >
            <Option value="news">News</Option>
            <Option value="tips">Tips</Option>
            <Option value="market">Market</Option>
            <Option value="guides">Guides</Option>
            <Option value="featured">Featured</Option>
          </Select>
        </div>

        {/* Blogs Table */}
        <Table
          columns={columns}
          dataSource={blogsData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: blogsData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} blog posts`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No blog posts found' }}
        />
      </Card>

      {/* Blog Detail Modal */}
      <Modal
        title="Blog Post Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedBlog && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Title:</strong> {selectedBlog.title}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Slug:</strong> {selectedBlog.slug || 'No slug'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Author:</strong> {selectedBlog.author_id?.name || 'Unknown'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Category:</strong>{' '}
              <Tag color={
                selectedBlog.category_id?.name === 'news' ? 'blue' :
                selectedBlog.category_id?.name === 'tips' ? 'green' :
                selectedBlog.category_id?.name === 'market' ? 'orange' : 'purple'
              }>
                {(selectedBlog.category_id?.name || 'uncategorized').toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Status:</strong>{' '}
              <Badge
                status={selectedBlog.status === 'published' ? 'success' : 'warning'}
                text={selectedBlog.status?.toUpperCase()}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Excerpt:</strong>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedBlog.excerpt || 'No excerpt'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Engagement:</strong>
              <div style={{ marginTop: 8, display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedBlog.views_count || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Views</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedBlog.comments_count || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Comments</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedBlog.likes_count || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>SEO:</strong>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '12px', marginBottom: 4 }}>
                  <strong>Meta Title:</strong> {selectedBlog.meta_title || 'Not set'}
                </div>
                <div style={{ fontSize: '12px' }}>
                  <strong>Meta Description:</strong> {selectedBlog.meta_description || 'Not set'}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Published:</strong> {selectedBlog.published_at ? 
                new Date(selectedBlog.published_at).toLocaleString() : 
                'Not published'
              }
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Created:</strong> {new Date(selectedBlog.createdAt).toLocaleString()}
            </div>
            {selectedBlog.featured_image && (
              <div style={{ marginBottom: 16 }}>
                <strong>Featured Image:</strong>
                <div style={{ marginTop: 8 }}>
                  <img 
                    src={selectedBlog.featured_image} 
                    alt={selectedBlog.title}
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Blog Modal */}
      <Modal
        title="Edit Blog Post"
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
            loading={updateBlogMutation.isLoading}
          >
            Update Blog Post
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                name="title"
                label="Blog Title"
                rules={[
                  { required: true, message: 'Please enter blog title' },
                  { max: 200, message: 'Title cannot exceed 200 characters' },
                ]}
              >
                <Input placeholder="Enter blog title" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="URL Slug"
                rules={[
                  { required: true, message: 'Please enter URL slug' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
                ]}
              >
                <Input placeholder="enter-blog-slug" />
              </Form.Item>

              <Form.Item
                name="excerpt"
                label="Excerpt"
                rules={[
                  { required: true, message: 'Please enter blog excerpt' },
                  { max: 500, message: 'Excerpt cannot exceed 500 characters' },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter a brief summary of blog post"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="Content"
                rules={[
                  { required: true, message: 'Please enter blog content' },
                ]}
              >
                <Input.TextArea
                  rows={8}
                  placeholder="Enter full blog content"
                />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="category_id"
                    label="Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select placeholder="Select category" loading={blogCategoriesLoading}>
                      {blogCategoriesData?.data?.map(category => (
                        <Option key={category._id} value={category._id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select placeholder="Select status">
                      <Option value="draft">Draft</Option>
                      <Option value="published">Published</Option>
                      <Option value="archived">Archived</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="featured_image"
                label="Featured Image URL"
              >
                <Input placeholder="Enter featured image URL (optional)" />
              </Form.Item>

              <Divider orientation="left">SEO Settings</Divider>

              <Form.Item
                name="meta_title"
                label="Meta Title"
              >
                <Input 
                  placeholder="Enter meta title for SEO (optional)"
                  maxLength={60}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="meta_description"
                label="Meta Description"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Enter meta description for SEO (optional)"
                  maxLength={160}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default BlogsList
