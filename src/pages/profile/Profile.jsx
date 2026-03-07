import React, { useState } from 'react'
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Divider,
  Row,
  Col,
  Tag,
  Modal,
} from 'antd'
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  EditOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../services/api/authApi'

const { Title, Text } = Typography
const { TextArea } = Input

const Profile = () => {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const [passwordForm] = Form.useForm()
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)

  const queryClient = useQueryClient()

  // Fetch current user data
  const {
    data: userData,
    isLoading,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      message.success('Profile updated successfully')
      setEditing(false)
      queryClient.invalidateQueries(['currentUser'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      message.success('Password changed successfully')
      setPasswordModalVisible(false)
      passwordForm.resetFields()
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to change password')
    },
  })

  // Initialize form with user data
  React.useEffect(() => {
    if (userData?.data) {
      form.setFieldsValue({
        name: userData.data.name,
        email: userData.data.email,
        phone: userData.data.phone,
        bio: userData.data.bio || '',
      })
    }
  }, [userData, form])

  const handleUpdateProfile = (values) => {
    updateProfileMutation.mutate(values)
  }

  const handleChangePassword = (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match')
      return
    }
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      message.success('Avatar uploaded successfully')
      // TODO: Implement avatar upload functionality
      queryClient.invalidateQueries(['currentUser'])
    } else if (info.file.status === 'error') {
      message.error('Failed to upload avatar')
    }
  }

  const uploadProps = {
    name: 'avatar',
    action: '/api/upload/avatar',
    showUploadList: false,
    onChange: handleAvatarChange,
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Title level={2}>Profile Settings</Title>
      
      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  src={userData?.data?.profile_image}
                  style={{ border: '3px solid #f0f0f0' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Upload {...uploadProps}>
                  <Button icon={<CameraOutlined />} size="small">
                    Change Avatar
                  </Button>
                </Upload>
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {userData?.data?.name || 'Admin User'}
                </Title>
                <Text type="secondary">
                  {userData?.data?.email || 'admin@example.com'}
                </Text>
              </div>
              <div style={{ marginTop: 16 }}>
                <Tag color="blue">
                  {(userData?.data?.role || 'admin').toUpperCase()}
                </Tag>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditing(!editing)}
                block
              >
                {editing ? 'Cancel Editing' : 'Edit Profile'}
              </Button>
              <Button
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
                block
              >
                Change Password
              </Button>
            </div>
          </Card>
        </Col>

        {/* Profile Form */}
        <Col xs={24} lg={16}>
          <Card title="Profile Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              disabled={!editing}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="Enter your full name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Enter your email" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phone"
                  >
                    <Input placeholder="Enter your phone number" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Role"
                    name="role"
                  >
                    <Input disabled value={userData?.data?.role || 'admin'} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Bio"
                name="bio"
              >
                <TextArea
                  rows={4}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              {editing && (
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={updateProfileMutation.isLoading}
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>

          {/* Account Statistics */}
          <Card title="Account Statistics" style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {userData?.data?.createdAt ? 
                      Math.floor((new Date() - new Date(userData.data.createdAt)) / (1000 * 60 * 60 * 24)) : 
                      0
                    }
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Days Active</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {userData?.data?.lastLogin ? 
                      new Date(userData.data.lastLogin).toLocaleDateString() : 
                      'Today'
                    }
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Last Login</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {userData?.data?.loginCount || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Total Logins</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {userData?.data?.status || 'Active'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Account Status</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPasswordModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => passwordForm.submit()}
            loading={changePasswordMutation.isLoading}
          >
            Change Password
          </Button>
        ]}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please enter current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Passwords do not match'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
