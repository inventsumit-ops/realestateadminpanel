import React, { useState } from 'react'
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  DatePicker,
  Select,
  message,
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  UserOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const UserReports = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ])
  const [reportType, setReportType] = useState('overview')

  // Fetch reports data
  const {
    data: reportsData,
    isLoading,
  } = useQuery({
    queryKey: ['user-reports', reportType, dateRange],
    queryFn: () => adminApi.getReports({
      type: 'users',
      date_from: dateRange?.[0]?.format('YYYY-MM-DD'),
      date_to: dateRange?.[1]?.format('YYYY-MM-DD'),
    }),
    enabled: !!dateRange?.[0] && !!dateRange?.[1],
  })

  // Fetch analytics data
  const {
    data: analyticsData,
  } = useQuery({
    queryKey: ['analytics', 'year'],
    queryFn: () => adminApi.getAnalytics({ period: 'year' }),
  })

  // Format data for charts
  const formatUserGrowthData = (data) => {
    if (!Array.isArray(data)) return []
    return data.map(item => ({
      date: item._id,
      users: item.count,
    }))
  }

  const formatUserStatsData = (data) => {
    if (!Array.isArray(data)) return []
    return data.map(item => ({
      role: item._id,
      count: item.count,
    }))
  }

  const userGrowthData = formatUserGrowthData(reportsData?.data || [])
  const userStatsData = formatUserStatsData(analyticsData?.data?.userGrowth || [])

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const columns = [
    {
      title: 'Date',
      dataIndex: '_id',
      key: 'date',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'New Users',
      dataIndex: 'count',
      key: 'count',
      render: (count) => count.toLocaleString(),
    },
    {
      title: 'By Role',
      dataIndex: 'byRole',
      key: 'byRole',
      render: (byRole) => (
        <Space direction="vertical" size="small">
          {byRole?.map((role, index) => (
            <div key={index}>
              <Tag color="blue">{role.role}</Tag>: {role.count}
            </div>
          )) || 'No data'}
        </Space>
      ),
    },
  ]

  const handleDateRangeChange = (dates) => {
    setDateRange(dates)
  }

  const handleExport = () => {
    message.info('Export functionality coming soon')
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>User Reports</Title>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <div>
              <div style={{ marginBottom: 4 }}>Date Range:</div>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: 300 }}
              />
            </div>
          </Col>
          <Col>
            <div>
              <div style={{ marginBottom: 4 }}>Report Type:</div>
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: 150 }}
              >
                <Option value="overview">Overview</Option>
                <Option value="detailed">Detailed</Option>
                <Option value="summary">Summary</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={userStatsData.reduce((sum, item) => sum + item.count, 0)}
              prefix={<UserOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="New Users (Period)"
              value={userGrowthData.reduce((sum, item) => sum + item.users, 0)}
              prefix={<BarChartOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average Daily"
              value={userGrowthData.length > 0 ? 
                Math.round(userGrowthData.reduce((sum, item) => sum + item.users, 0) / userGrowthData.length) : 0
              }
              prefix={<CalendarOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="User Growth Trend" loading={isLoading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Users by Role" loading={isLoading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userStatsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {userStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Detailed Table */}
      <Card title="Detailed User Registration Data" loading={isLoading}>
        <Table
          columns={columns}
          dataSource={reportsData?.data || []}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} records`,
          }}
          rowKey="_id"
          locale={{ emptyText: 'No data available for selected period' }}
        />
      </Card>
    </div>
  )
}

export default UserReports
