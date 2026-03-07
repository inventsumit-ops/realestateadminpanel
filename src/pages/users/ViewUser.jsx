import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Button,
  Space,
  Divider,
  Descriptions,
  Image,
} from 'antd'
import {
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { usersApi } from '../../services/api/usersApi'

const { Title, Text } = Typography

const ViewUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await usersApi.getUserById(id)
        setUser(response.data)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>User not found</div>
  }

  const getRoleColor = (role) => {
    const colorMap = {
      admin: 'red',
      agent: 'blue',
      user: 'green',
    }
    return colorMap[role] || 'default'
  }

  return (
    <div>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/users')}
          >
            Back to Users
          </Button>
        </Col>
        <Col flex="auto">
          <Title level={2} style={{ margin: 0 }}>User Details</Title>
          <Text type="secondary">View complete user information</Text>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* User Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={user.profile_image}
                style={{ marginBottom: 16 }}
              />
              <Title level={3} style={{ margin: 0 }}>
                {user.name || 'No Name'}
              </Title>
              <Tag color={getRoleColor(user.role)} style={{ marginBottom: 16 }}>
                {(user.role || 'user').toUpperCase()}
              </Tag>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <Tag 
                  color={user.isActive ? 'green' : 'red'}
                  icon={user.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                  {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
              </div>
            </div>

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item label="User ID">
                <Text copyable style={{ fontSize: 12 }}>{user._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Joined">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </Descriptions.Item>
              <Descriptions.Item label="Email Verified">
                <Tag color={user.isEmailVerified ? 'green' : 'orange'}>
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* User Information Card */}
        <Col xs={24} lg={16}>
          <Card title="Personal Information">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Full Name</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{user.name || 'Not provided'}</Text>
                    </div>
                  </div>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Email Address</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text copyable>{user.email || 'Not provided'}</Text>
                    </div>
                  </div>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Phone Number</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{user.phone || 'Not provided'}</Text>
                    </div>
                  </div>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>User Role</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={getRoleColor(user.role)}>
                        {(user.role || 'user').toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Address Information */}
          <Card title="Address Information" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Address</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{user.address || 'Not provided'}</Text>
                    </div>
                  </div>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>City</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{user.city || 'Not provided'}</Text>
                    </div>
                  </div>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Country</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{user.country || 'Not provided'}</Text>
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Additional Information */}
          {(user.bio || user.profile_image) && (
            <Card title="Additional Information" style={{ marginTop: 16 }}>
              {user.bio && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Bio/Description</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text>{user.bio}</Text>
                  </div>
                </div>
              )}

              {user.profile_image && (
                <div>
                  <Text strong>Profile Image</Text>
                  <div style={{ marginTop: 8 }}>
                    <Image
                      width={200}
                      src={user.profile_image}
                      alt={user.name}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                </div>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ViewUser
