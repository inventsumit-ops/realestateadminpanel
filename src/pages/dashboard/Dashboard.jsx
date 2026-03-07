import React, { useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Progress,
  Avatar,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Spin,
  message,
} from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  RiseOutlined,
  CalendarOutlined,
  MessageOutlined,
  StarOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useUsers, useProperties, useAgents, useInquiries, useAppointments } from '../../store/hooks'
import {
  fetchUsers,
  fetchProperties,
  fetchAgents,
  fetchInquiries,
  fetchAppointments,
} from '../../store/slices'

const { Title, Text } = Typography

const Dashboard = () => {
  const { users } = useUsers()
  const { properties } = useProperties()
  const { agents } = useAgents()
  const { inquiries } = useInquiries()
  const { appointments } = useAppointments()
  const { dispatch } = useUsers() // Use any dispatch, they're all the same

  // Fetch data on component mount
  useEffect(() => {
    // Fetch initial data for dashboard
    dispatch(fetchUsers({ page: 1, limit: 5 }))
    dispatch(fetchProperties({ page: 1, limit: 5 }))
    dispatch(fetchAgents({ page: 1, limit: 5 }))
    dispatch(fetchInquiries({ page: 1, limit: 5 }))
    dispatch(fetchAppointments({ page: 1, limit: 5 }))
  }, [dispatch])

  // Check for loading states
  const isLoading = users.loading || properties.loading || agents.loading || inquiries.loading || appointments.loading

  // Debug: Log current state
  console.log('Dashboard State:', {
    users: users.users?.length || 0,
    properties: properties.properties?.length || 0,
    agents: agents.agents?.length || 0,
    inquiries: inquiries.inquiries?.length || 0,
    appointments: appointments.appointments?.length || 0,
    loading: isLoading
  })

  // Show error message if any slice has errors
  useEffect(() => {
    const errors = [
      users.error,
      properties.error,
      agents.error,
      inquiries.error,
      appointments.error
    ].filter(Boolean)
    
    if (errors.length > 0) {
      message.error('Failed to load dashboard data. Please try again.')
      console.error('Dashboard Errors:', errors)
    }
  }, [users.error, properties.error, agents.error, inquiries.error, appointments.error])

  // Format data for charts
  
  const formatPropertyTypeData = (propertyStats) => {
    if (!propertyStats || !Array.isArray(propertyStats)) return []

    const colors = ['#87CEEB', '#4682B4', '#00CED1', '#5BA0C0', '#20B2AA']
    return propertyStats.map((stat, index) => ({
      name: stat._id || 'Unknown',
      value: stat.count || 0,
      color: colors[index % colors.length],
    }))
  }

  // Get formatted data
  const propertyTypeData = formatPropertyTypeData(properties.stats?.propertyTypes || [])

  // Get stats from Redux store
  const stats = {
    totalUsers: users.pagination.total || 0,
    totalAgents: agents.pagination.total || 0,
    totalProperties: properties.pagination.total || 0,
    totalInquiries: inquiries.pagination.total || 0,
    totalAppointments: appointments.pagination.total || 0,
  }

  // Get recent data from Redux store
  const recentProperties = (properties.properties || []).slice(0, 5)
  const recentInquiries = (inquiries.inquiries || []).slice(0, 5)

  // Sample revenue data (can be replaced with actual revenue API when available)
  const revenueData = [
    { month: 'Jan', revenue: 180000, properties: 28 },
    { month: 'Feb', revenue: 220000, properties: 35 },
    { month: 'Mar', revenue: 285000, properties: 42 },
    { month: 'Apr', revenue: 195000, properties: 30 },
    { month: 'May', revenue: 310000, properties: 48 },
    { month: 'Jun', revenue: 275000, properties: 41 },
  ]

  // Sample user growth data (can be enhanced with actual growth data)
  const userGrowthData = [
    { month: 'Jan', users: 890, agents: 65 },
    { month: 'Feb', users: 945, agents: 68 },
    { month: 'Mar', users: 1023, agents: 72 },
    { month: 'Apr', users: 1156, agents: 75 },
    { month: 'May', users: 1208, agents: 80 },
    { month: 'Jun', users: 1248, agents: 86 },
  ]

  const propertyColumns = [
    {
      title: 'Property',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text || 'Untitled'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.location || 'No location'}
          </div>
        </div>
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
    },
    {
      title: 'Agent',
      dataIndex: 'agent_id',
      key: 'agent_id',
      render: (agent) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{agent?.user_id?.name || 'Unknown Agent'}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'default'}>
          {(status || 'UNKNOWN').toUpperCase()}
        </Tag>
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
  ]

  const inquiryColumns = [
    {
      title: 'Name',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (user) => user?.name || 'Unknown User',
    },
    {
      title: 'Email',
      dataIndex: 'user_id',
      key: 'email',
      render: (user) => user?.email || 'No email',
    },
    {
      title: 'Property',
      dataIndex: 'property_id',
      key: 'property_id',
      render: (property) => property?.title || 'Unknown Property',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'new' ? 'red' : 
          status === 'pending' ? 'orange' : 
          status === 'responded' ? 'blue' : 'default'
        }>
          {(status || 'UNKNOWN').toUpperCase()}
        </Tag>
      ),
    },
  ]

  
  return (
    <div className="dashboard">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
          Dashboard Overview
        </Title>
        <Text type="secondary">
          Welcome back! Here's what's happening with your real estate platform today.
        </Text>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading dashboard data...</div>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && (
        <>
          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic
                  title="Total Users"
                  value={stats.totalUsers}
                  prefix={<UserOutlined style={{ color: '#87CEEB' }} />}
                  valueStyle={{ color: '#87CEEB' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <RiseOutlined /> Active users
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic
                  title="Total Properties"
                  value={stats.totalProperties}
                  prefix={<HomeOutlined style={{ color: '#4682B4' }} />}
                  valueStyle={{ color: '#4682B4' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    Listed properties
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic
                  title="Total Agents"
                  value={stats.totalAgents}
                  prefix={<StarOutlined style={{ color: '#52C41A' }} />}
                  valueStyle={{ color: '#52C41A' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    Verified agents
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic
                  title="Total Inquiries"
                  value={stats.totalInquiries}
                  prefix={<MessageOutlined style={{ color: '#FAAD14' }} />}
                  valueStyle={{ color: '#FAAD14' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <CalendarOutlined /> This month
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="Revenue & Properties Trend" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#87CEEB"
                      strokeWidth={2}
                      name="Revenue ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="properties"
                      stroke="#4682B4"
                      strokeWidth={2}
                      name="Properties"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Property Types" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* User Growth Chart */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title="User Growth" className="chart-card">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#87CEEB"
                      fill="#87CEEB"
                      name="Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="agents"
                      stackId="2"
                      stroke="#4682B4"
                      fill="#4682B4"
                      name="Agents"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Tables Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card
                title="Recent Properties"
                extra={
                  <Button type="link" size="small">
                    View All
                  </Button>
                }
              >
                <Table
                  dataSource={recentProperties}
                  columns={propertyColumns}
                  pagination={false}
                  size="small"
                  rowKey="_id"
                  locale={{ emptyText: 'No properties found' }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card
                title="Recent Inquiries"
                extra={
                  <Button type="link" size="small">
                    View All
                  </Button>
                }
              >
                <Table
                  dataSource={recentInquiries}
                  columns={inquiryColumns}
                  pagination={false}
                  size="small"
                  rowKey="_id"
                  locale={{ emptyText: 'No inquiries found' }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default Dashboard
