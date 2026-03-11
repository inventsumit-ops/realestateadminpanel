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
  message,
  Popconfirm,
  Modal,
  Form,
  Row,
  Col,
  Divider,
  Switch,
  InputNumber,
} from 'antd'
import {
  FolderOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const BlogCategoriesList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch blog categories data
  const {
    data: categoriesData,
    isLoading,
  } = useQuery({
    queryKey: ['blogCategories', currentPage, pageSize, searchTerm, statusFilter],
    queryFn: () => adminApi.getBlogCategories({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      is_active: statusFilter,
    }),
    keepPreviousData: true,
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: adminApi.createBlogCategory,
    onSuccess: () => {
      message.success('Blog category created successfully')
      setCreateModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['blogCategories'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create blog category')
    },
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateBlogCategory(id, data),
    onSuccess: () => {
      message.success('Blog category updated successfully')
      setEditModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['blogCategories'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update blog category')
    },
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: adminApi.deleteBlogCategory,
    onSuccess: () => {
      message.success('Blog category deleted successfully')
      queryClient.invalidateQueries(['blogCategories'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete blog category')
    },
  })

  const handleViewCategory = (category) => {
    setSelectedCategory(category)
    setViewModalVisible(true)
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_category: category.parent_category?._id,
      image: category.image,
      order: category.order,
      is_active: category.is_active,
    })
    setEditModalVisible(true)
  }

  const handleCreateCategory = (values) => {
    createCategoryMutation.mutate(values)
  }

  const handleEditSubmit = (values) => {
    updateCategoryMutation.mutate({ id: selectedCategory._id, data: values })
  }

  const handleDeleteCategory = (categoryId) => {
    deleteCategoryMutation.mutate(categoryId)
  }

  const columns = [
    {
      title: 'Category',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FolderOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Slug: {record.slug || 'No slug'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <div style={{ maxWidth: 200 }}>
          {description ? description.substring(0, 100) + '...' : 'No description'}
        </div>
      ),
    },
    {
      title: 'Parent Category',
      dataIndex: 'parent_category',
      key: 'parent_category',
      render: (parent) => parent?.name || 'Root Category',
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      sorter: true,
      render: (order) => order || 0,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag 
          color={isActive ? 'green' : 'red'}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? 'ACTIVE' : 'INACTIVE'}
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
            title="View Category"
            onClick={() => handleViewCategory(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit Category"
            onClick={() => handleEditCategory(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteCategory(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Category"
              loading={deleteCategoryMutation.isLoading}
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
        <Title level={2} style={{ margin: 0 }}>Blog Categories Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Add Category
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search categories..."
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
            <Option value="true">Active</Option>
            <Option value="false">Inactive</Option>
          </Select>
        </div>

        {/* Categories Table */}
        <Table
          columns={columns}
          dataSource={categoriesData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: categoriesData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} categories`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No categories found' }}
        />
      </Card>

      {/* Create Category Modal */}
      <Modal
        title="Create New Blog Category"
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
            loading={createCategoryMutation.isLoading}
          >
            Create Category
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCategory}
          initialValues={{
            is_active: true,
            order: 0,
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                name="name"
                label="Category Name"
                rules={[
                  { required: true, message: 'Please enter category name' },
                  { max: 100, message: 'Name cannot exceed 100 characters' },
                ]}
              >
                <Input placeholder="Enter category name" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="URL Slug"
                rules={[
                  { required: true, message: 'Please enter URL slug' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
                ]}
              >
                <Input placeholder="enter-category-slug" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter category description (optional)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="order"
                    label="Display Order"
                  >
                    <InputNumber 
                      placeholder="0" 
                      min={0} 
                      max={999}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="is_active"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select placeholder="Select status">
                      <Option value={true}>Active</Option>
                      <Option value={false}>Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="image"
                label="Category Image URL"
              >
                <Input placeholder="Enter category image URL (optional)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Category Modal */}
      <Modal
        title="Category Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedCategory && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Category Name:</strong> {selectedCategory.name}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Slug:</strong> {selectedCategory.slug || 'No slug'}
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
                {selectedCategory.description || 'No description'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Parent Category:</strong> {selectedCategory.parent_category?.name || 'Root Category'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Display Order:</strong> {selectedCategory.order || 0}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Status:</strong>{' '}
              <Tag 
                color={selectedCategory.is_active ? 'green' : 'red'}
                icon={selectedCategory.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              >
                {selectedCategory.is_active ? 'ACTIVE' : 'INACTIVE'}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Created:</strong> {new Date(selectedCategory.createdAt).toLocaleString()}
            </div>
            {selectedCategory.image && (
              <div style={{ marginBottom: 16 }}>
                <strong>Category Image:</strong>
                <div style={{ marginTop: 8 }}>
                  <img 
                    src={selectedCategory.image} 
                    alt={selectedCategory.name}
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Edit Blog Category"
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
            loading={updateCategoryMutation.isLoading}
          >
            Update Category
          </Button>
        ]}
        width={600}
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
                name="name"
                label="Category Name"
                rules={[
                  { required: true, message: 'Please enter category name' },
                  { max: 100, message: 'Name cannot exceed 100 characters' },
                ]}
              >
                <Input placeholder="Enter category name" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="URL Slug"
                rules={[
                  { required: true, message: 'Please enter URL slug' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
                ]}
              >
                <Input placeholder="enter-category-slug" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter category description (optional)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="order"
                    label="Display Order"
                  >
                    <InputNumber 
                      placeholder="0" 
                      min={0} 
                      max={999}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="is_active"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select placeholder="Select status">
                      <Option value={true}>Active</Option>
                      <Option value={false}>Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="image"
                label="Category Image URL"
              >
                <Input placeholder="Enter category image URL (optional)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default BlogCategoriesList
