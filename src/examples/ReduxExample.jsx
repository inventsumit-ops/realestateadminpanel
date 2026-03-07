import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useUsers } from '../store/hooks'
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  clearError,
} from '../store/slices/usersSlice'

const { Title } = Typography
const { Option } = Select

const ReduxExample = () => {
  const { users, dispatch } = useUsers()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  // Load users on component mount
  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  // Show error messages
  useEffect(() => {
    if (users.error) {
      message.error(users.error)
      dispatch(clearError())
    }
  }, [users.error, dispatch])

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await dispatch(updateUser({ id: editingUser._id, userData: values })).unwrap()
        message.success('User updated successfully!')
      } else {
        await dispatch(createUser(values)).unwrap()
        message.success('User created successfully!')
      }
      setIsModalVisible(false)
      setEditingUser(null)
      form.resetFields()
    } catch (error) {
      message.error(error || 'Operation failed')
    }
  }

  // Handle user deletion
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUser(id)).unwrap()
      message.success('User deleted successfully!')
    } catch (error) {
      message.error(error || 'Delete failed')
    }
  }

  // Handle status toggle
  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleUserStatus(id)).unwrap()
      message.success('User status updated!')
    } catch (error) {
      message.error(error || 'Status update failed')
    }
  }

  // Open edit modal
  const handleEdit = (user) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setIsModalVisible(true)
  }

  // Open create modal
  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchUsers())
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'agent' ? 'blue' : 'green'}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => handleToggleStatus(record._id)}
          >
            Toggle Status
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Statistic
              title="Total Users"
              value={users.pagination.total}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Active Users"
              value={users.stats?.active || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Inactive Users"
              value={users.stats?.inactive || 0}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Page"
              value={users.pagination.page}
              suffix={`/ ${users.pagination.totalPages}`}
            />
          </Col>
        </Row>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>
            User Management (Redux Example)
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={users.loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add User
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users.users}
          loading={users.loading}
          rowKey="_id"
          pagination={{
            current: users.pagination.page,
            pageSize: users.pagination.limit,
            total: users.pagination.total,
            onChange: (page, pageSize) => {
              dispatch(fetchUsers({ page, limit: pageSize }))
            },
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingUser(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input user name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: !editingUser, message: 'Please input password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="agent">Agent</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={users.loading}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false)
                  setEditingUser(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ReduxExample
