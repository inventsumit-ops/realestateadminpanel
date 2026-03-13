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
  DatePicker,
  Form,
  Row,
  Col,
  Divider,
  Descriptions,
  Input as TextArea,
  TimePicker,
} from 'antd'
import {
  CalendarOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  HomeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'
import dayjs from 'dayjs'

const { Title } = Typography
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const AppointmentsList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  // Fetch users for dropdown
  const {
    data: usersData,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ['users-dropdown'],
    queryFn: () => adminApi.getUsers({ limit: 1000, role: 'user' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch agents for dropdown
  const {
    data: agentsData,
    isLoading: agentsLoading,
  } = useQuery({
    queryKey: ['agents-dropdown'],
    queryFn: () => adminApi.getAgents({ limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch properties for dropdown
  const {
    data: propertiesData,
    isLoading: propertiesLoading,
  } = useQuery({
    queryKey: ['properties-dropdown'],
    queryFn: () => adminApi.getProperties({ limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch appointments data
  const {
    data: appointmentsData,
    isLoading,
  } = useQuery({
    queryKey: ['appointments', currentPage, pageSize, searchTerm, statusFilter, dateFilter],
    queryFn: () => adminApi.getAppointments({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
      date_from: dateFilter?.[0]?.format('YYYY-MM-DD'),
      date_to: dateFilter?.[1]?.format('YYYY-MM-DD'),
    }),
    keepPreviousData: true,
  })

  // Update appointment status mutation
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateAppointmentStatus(id, status),
    onSuccess: () => {
      message.success('Appointment status updated successfully')
      queryClient.invalidateQueries(['appointments'])
      setDetailModalVisible(false)
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update appointment')
    },
  })

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: adminApi.deleteAppointment,
    onSuccess: () => {
      message.success('Appointment deleted successfully')
      queryClient.invalidateQueries(['appointments'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete appointment')
    },
  })

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: adminApi.createAppointment,
    onSuccess: () => {
      message.success('Appointment created successfully')
      setCreateModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['appointments'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create appointment')
    },
  })

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateAppointment(id, data),
    onSuccess: () => {
      message.success('Appointment updated successfully')
      setEditModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['appointments'])
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update appointment')
    },
  })

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setDetailModalVisible(true)
  }

  const handleStatusUpdate = (appointmentId, newStatus) => {
    updateAppointmentStatusMutation.mutate({ id: appointmentId, status: newStatus })
  }

  const handleDeleteAppointment = (appointmentId) => {
    deleteAppointmentMutation.mutate(appointmentId)
  }

  const handleCreateAppointment = (values) => {
    const appointmentData = {
      ...values,
      appointment_date: values.appointment_date?.format('YYYY-MM-DD'),
      appointment_time: values.appointment_time?.format('HH:mm'),
      duration: parseInt(values.duration) || 30, // Convert to number, default to 30 minutes
    }
    createAppointmentMutation.mutate(appointmentData)
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    form.setFieldsValue({
      user_id: appointment.user_id?._id,
      agent_id: appointment.agent_id?._id,
      property_id: appointment.property_id?._id,
      appointment_date: appointment.appointment_date ? dayjs(appointment.appointment_date) : null,
      appointment_time: appointment.appointment_time ? dayjs(appointment.appointment_time, 'HH:mm') : null,
      duration: appointment.duration || 30,
      appointment_type: appointment.appointment_type || 'viewing',
      status: appointment.status || 'scheduled',
      notes: appointment.notes || '',
    })
    setEditModalVisible(true)
  }

  const handleUpdateAppointment = (values) => {
    const appointmentData = {
      ...values,
      appointment_date: values.appointment_date?.format('YYYY-MM-DD'),
      appointment_time: values.appointment_time?.format('HH:mm'),
      duration: parseInt(values.duration) || 30, // Convert to number, default to 30 minutes
    }
    updateAppointmentMutation.mutate({ id: selectedAppointment._id, data: appointmentData })
  }

  const columns = [
    {
      title: 'User',
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
      title: 'Agent',
      dataIndex: 'agent_id',
      key: 'agent_id',
      render: (agent) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={agent?.user_id?.profile_image} />
          <div>
            <div style={{ fontWeight: 500 }}>{agent?.user_id?.name || 'No name'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {agent?.agency_name || 'Independent'}
            </div>
          </div>
        </Space>
      ),
    },
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
              ${property?.price?.toLocaleString() || 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'appointment_date',
      key: 'appointment_date',
      render: (date, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {date ? dayjs(date).format('MMM DD, YYYY') : 'No date'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.appointment_time || 'No time'}
          </div>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <Space>
          <ClockCircleOutlined />
          <span>{duration || '30 mins'}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          scheduled: 'blue',
          confirmed: 'green',
          completed: 'default',
          cancelled: 'red',
          no_show: 'orange',
        }
        return (
          <Tag color={colorMap[status] || 'default'}>
            {(status || 'unknown').toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Type',
      dataIndex: 'appointment_type',
      key: 'appointment_type',
      render: (type) => {
        const colorMap = {
          viewing: 'blue',
          consultation: 'green',
          inspection: 'orange',
          meeting: 'purple',
        }
        return (
          <Tag color={colorMap[type] || 'default'}>
            {(type || 'general').toUpperCase()}
          </Tag>
        )
      },
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
              onClick={() => handleViewAppointment(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Appointment">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditAppointment(record)}
            />
          </Tooltip>
          {record.status === 'scheduled' && (
            <Tooltip title="Confirm Appointment">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate(record._id, 'confirmed')}
                loading={updateAppointmentStatusMutation.isLoading}
                style={{ color: '#52C41A' }}
              />
            </Tooltip>
          )}
          {record.status !== 'completed' && record.status !== 'cancelled' && (
            <Tooltip title="Cancel Appointment">
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleStatusUpdate(record._id, 'cancelled')}
                loading={updateAppointmentStatusMutation.isLoading}
                style={{ color: '#FF4D4F' }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Are you sure you want to delete this appointment?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteAppointment(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Appointment"
              loading={deleteAppointmentMutation.isLoading}
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

  const handleDateFilter = (dates) => {
    setDateFilter(dates)
    setCurrentPage(1)
  }

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Appointments Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Schedule Appointment
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search appointments..."
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
            <Option value="scheduled">Scheduled</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="no_show">No Show</Option>
          </Select>
          <RangePicker
            placeholder={['Start Date', 'End Date']}
            onChange={handleDateFilter}
            style={{ width: 250 }}
          />
        </div>

        {/* Appointments Table */}
        <Table
          columns={columns}
          dataSource={appointmentsData?.data || []}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: appointmentsData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} appointments`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          locale={{ emptyText: 'No appointments found' }}
        />
      </Card>

      {/* Appointment Detail Modal */}
      <Modal
        title="Appointment Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedAppointment?.status === 'scheduled' && (
            <Button
              key="confirm"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate(selectedAppointment._id, 'confirmed')}
              loading={updateAppointmentStatusMutation.isLoading}
            >
              Confirm Appointment
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedAppointment && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>User:</strong> {selectedAppointment.user_id?.name} ({selectedAppointment.user_id?.email})
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Agent:</strong> {selectedAppointment.agent_id?.user_id?.name}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Property:</strong> {selectedAppointment.property_id?.title}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Date & Time:</strong>{' '}
              {selectedAppointment.appointment_date ? 
                dayjs(selectedAppointment.appointment_date).format('MMMM DD, YYYY') : 'No date'
              } at {selectedAppointment.appointment_time || 'No time'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Duration:</strong> {selectedAppointment.duration || '30 minutes'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Type:</strong>{' '}
              <Tag color={
                selectedAppointment.appointment_type === 'viewing' ? 'blue' :
                selectedAppointment.appointment_type === 'consultation' ? 'green' :
                selectedAppointment.appointment_type === 'inspection' ? 'orange' : 'default'
              }>
                {(selectedAppointment.appointment_type || 'general').toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Status:</strong>{' '}
              <Tag color={
                selectedAppointment.status === 'scheduled' ? 'blue' :
                selectedAppointment.status === 'confirmed' ? 'green' :
                selectedAppointment.status === 'completed' ? 'default' :
                selectedAppointment.status === 'cancelled' ? 'red' : 'orange'
              }>
                {selectedAppointment.status?.toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Notes:</strong>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedAppointment.notes || 'No notes'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Scheduled:</strong> {new Date(selectedAppointment.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Appointment Modal */}
      <Modal
        title="Schedule New Appointment"
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
            loading={createAppointmentMutation.isLoading}
          >
            Schedule Appointment
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAppointment}
          initialValues={{
            duration: 30,
            appointment_type: 'viewing',
            status: 'scheduled',
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="user_id"
                label="User"
                rules={[{ required: true, message: 'Please select a user' }]}
              >
                <Select 
                  placeholder="Select user"
                  loading={usersLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {usersData?.data?.map(user => (
                    <Option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="agent_id"
                label="Agent"
                rules={[{ required: true, message: 'Please select an agent' }]}
              >
                <Select 
                  placeholder="Select agent"
                  loading={agentsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {agentsData?.data?.map(agent => (
                    <Option key={agent._id} value={agent._id}>
                      {agent.user_id?.name || agent.name} {agent.agency_name ? `(${agent.agency_name})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="property_id"
                label="Property"
                rules={[{ required: true, message: 'Please select a property' }]}
              >
                <Select 
                  placeholder="Select property"
                  loading={propertiesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {propertiesData?.data?.map(property => (
                    <Option key={property._id} value={property._id}>
                      {property.title} - ${property.price?.toLocaleString()}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="appointment_type"
                label="Appointment Type"
                rules={[{ required: true, message: 'Please select appointment type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="viewing">Property Viewing</Option>
                  <Option value="consultation">Consultation</Option>
                  <Option value="inspection">Inspection</Option>
                  <Option value="meeting">Meeting</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="appointment_date"
                label="Appointment Date"
                rules={[{ required: true, message: 'Please select appointment date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="appointment_time"
                label="Appointment Time"
                rules={[{ required: true, message: 'Please select appointment time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="duration"
                label="Duration"
                rules={[{ required: true, message: 'Please select duration' }]}
              >
                <Select placeholder="Select duration">
                  <Option value={15}>15 minutes</Option>
                  <Option value={30}>30 minutes</Option>
                  <Option value={45}>45 minutes</Option>
                  <Option value={60}>1 hour</Option>
                  <Option value={120}>2 hours</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea
              rows={4}
              placeholder="Enter any additional notes for the appointment (optional)"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        title="Edit Appointment"
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
            loading={updateAppointmentMutation.isLoading}
          >
            Update Appointment
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateAppointment}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="user_id"
                label="User"
                rules={[{ required: true, message: 'Please select a user' }]}
              >
                <Select 
                  placeholder="Select user"
                  loading={usersLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {usersData?.data?.map(user => (
                    <Option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="agent_id"
                label="Agent"
                rules={[{ required: true, message: 'Please select an agent' }]}
              >
                <Select 
                  placeholder="Select agent"
                  loading={agentsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {agentsData?.data?.map(agent => (
                    <Option key={agent._id} value={agent._id}>
                      {agent.user_id?.name || agent.name} {agent.agency_name ? `(${agent.agency_name})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="property_id"
                label="Property"
                rules={[{ required: true, message: 'Please select a property' }]}
              >
                <Select 
                  placeholder="Select property"
                  loading={propertiesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {propertiesData?.data?.map(property => (
                    <Option key={property._id} value={property._id}>
                      {property.title} - ${property.price?.toLocaleString()}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="appointment_type"
                label="Appointment Type"
                rules={[{ required: true, message: 'Please select appointment type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="viewing">Property Viewing</Option>
                  <Option value="consultation">Consultation</Option>
                  <Option value="inspection">Inspection</Option>
                  <Option value="meeting">Meeting</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="appointment_date"
                label="Appointment Date"
                rules={[{ required: true, message: 'Please select appointment date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="appointment_time"
                label="Appointment Time"
                rules={[{ required: true, message: 'Please select appointment time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="duration"
                label="Duration"
                rules={[{ required: true, message: 'Please select duration' }]}
              >
                <Select placeholder="Select duration">
                  <Option value={15}>15 minutes</Option>
                  <Option value={30}>30 minutes</Option>
                  <Option value={45}>45 minutes</Option>
                  <Option value={60}>1 hour</Option>
                  <Option value={120}>2 hours</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                  <Option value="no_show">No Show</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea
              rows={4}
              placeholder="Enter any additional notes for the appointment (optional)"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AppointmentsList
