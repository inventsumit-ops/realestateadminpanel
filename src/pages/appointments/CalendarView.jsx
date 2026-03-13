import React, { useState } from 'react'
import {
  Typography,
  Card,
  Calendar,
  Badge,
  Button,
  Space,
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Tooltip,
  Select,
  message,
} from 'antd'
import {
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [viewMode, setViewMode] = useState('month')

  // Fetch appointments data
  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['appointments-calendar'],
    queryFn: () => adminApi.getAppointments({ limit: 1000 }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    if (!appointmentsData?.data) return []
    
    return appointmentsData.data.filter(appointment => {
      const appointmentDate = dayjs(appointment.appointment_date)
      return appointmentDate.isSame(date, 'day')
    })
  }

  // Get appointment status color
  const getStatusColor = (status) => {
    const colorMap = {
      scheduled: 'blue',
      confirmed: 'green',
      completed: 'default',
      cancelled: 'red',
      no_show: 'orange',
    }
    return colorMap[status] || 'default'
  }

  // Get appointment type color
  const getTypeColor = (type) => {
    const colorMap = {
      viewing: 'blue',
      consultation: 'green',
      inspection: 'orange',
      meeting: 'purple',
    }
    return colorMap[type] || 'default'
  }

  // Handle date cell click
  const handleDateClick = (date) => {
    const dayAppointments = getAppointmentsForDate(date)
    if (dayAppointments.length > 0) {
      setSelectedDate(date)
    }
  }

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment)
    setDetailModalVisible(true)
  }

  // Custom date cell renderer
  const dateCellRender = (value) => {
    const dayAppointments = getAppointmentsForDate(value)
    
    if (dayAppointments.length === 0) return null

    return (
      <div style={{ height: '100%', padding: '2px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100%' }}>
          {dayAppointments.slice(0, 3).map((appointment, index) => (
            <div
              key={appointment._id}
              style={{
                fontSize: '10px',
                lineHeight: '12px',
                padding: '1px 2px',
                borderRadius: '2px',
                backgroundColor: getStatusColor(appointment.status) === 'blue' ? '#e6f7ff' :
                                 getStatusColor(appointment.status) === 'green' ? '#f6ffed' :
                                 getStatusColor(appointment.status) === 'red' ? '#fff1f0' :
                                 getStatusColor(appointment.status) === 'orange' ? '#fff7e6' : '#f5f5f5',
                border: `1px solid ${getStatusColor(appointment.status) === 'blue' ? '#91d5ff' :
                                  getStatusColor(appointment.status) === 'green' ? '#b7eb8f' :
                                  getStatusColor(appointment.status) === 'red' ? '#ffccc7' :
                                  getStatusColor(appointment.status) === 'orange' ? '#ffd591' : '#d9d9d9'}`,
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onClick={() => handleAppointmentClick(appointment)}
              title={`${appointment.appointment_time} - ${appointment.property_id?.title || 'Property'} (${appointment.user_id?.name || 'User'})`}
            >
              <div style={{ fontWeight: 'bold', color: getStatusColor(appointment.status) === 'blue' ? '#1890ff' :
                                              getStatusColor(appointment.status) === 'green' ? '#52c41a' :
                                              getStatusColor(appointment.status) === 'red' ? '#ff4d4f' :
                                              getStatusColor(appointment.status) === 'orange' ? '#fa8c16' : '#666' }}>
                {appointment.appointment_time || 'TBD'}
              </div>
              <div style={{ fontSize: '9px', color: '#666' }}>
                {appointment.property_id?.title ? appointment.property_id.title.substring(0, 15) : 'Property'}
              </div>
            </div>
          ))}
          {dayAppointments.length > 3 && (
            <div style={{
              fontSize: '9px',
              color: '#666',
              textAlign: 'center',
              padding: '1px',
              backgroundColor: '#f0f0f0',
              borderRadius: '2px',
            }}>
              +{dayAppointments.length - 3} more
            </div>
          )}
        </div>
      </div>
    )
  }

  // Handle panel change
  const handlePanelChange = (date, mode) => {
    setSelectedDate(date)
    setViewMode(mode)
  }

  // Get selected date appointments list
  const selectedDateAppointments = getAppointmentsForDate(selectedDate)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Calendar View</Title>
        <Space>
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 120 }}
          >
            <Option value="month">Month</Option>
            <Option value="week">Week</Option>
            <Option value="day">Day</Option>
          </Select>
          <Button 
            icon={<CalendarOutlined />}
            onClick={() => setSelectedDate(dayjs())}
          >
            Today
          </Button>
          <Button 
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Calendar */}
        <div style={{ flex: 1 }}>
          <Card loading={isLoading}>
            <Calendar
              value={selectedDate}
              onSelect={handleDateClick}
              onPanelChange={handlePanelChange}
              mode={viewMode}
              dateCellRender={dateCellRender}
              fullscreen={false}
              style={{ height: viewMode === 'day' ? '600px' : '800px' }}
            />
          </Card>
        </div>

        {/* Selected Date Appointments Sidebar */}
        <div style={{ width: 350 }}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedDate.format('MMMM DD, YYYY')}</span>
                <Badge 
                  count={selectedDateAppointments.length} 
                  showZero 
                  style={{ backgroundColor: '#1890ff' }}
                />
              </div>
            }
            size="small"
          >
            {selectedDateAppointments.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px 0', 
                color: '#999',
                fontSize: '14px'
              }}>
                No appointments scheduled for this date
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {selectedDateAppointments
                  .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))
                  .map(appointment => (
                  <div
                    key={appointment._id}
                    style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.3s',
                    }}
                    onClick={() => handleAppointmentClick(appointment)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e6f7ff'
                      e.currentTarget.style.borderColor = '#91d5ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa'
                      e.currentTarget.style.borderColor = '#f0f0f0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {appointment.appointment_time || 'TBD'}
                        </span>
                      </div>
                      <Tag color={getStatusColor(appointment.status)} size="small">
                        {appointment.status?.toUpperCase()}
                      </Tag>
                    </div>

                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <UserOutlined style={{ color: '#666', fontSize: '12px' }} />
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {appointment.user_id?.name || 'Unknown User'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <HomeOutlined style={{ color: '#666', fontSize: '12px' }} />
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {appointment.property_id?.title || 'Unknown Property'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color={getTypeColor(appointment.appointment_type)} size="small">
                        {appointment.appointment_type?.toUpperCase() || 'GENERAL'}
                      </Tag>
                      <Tooltip title="View Details">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAppointmentClick(appointment)
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <Modal
        title="Appointment Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedAppointment && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>User:</strong> 
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Avatar size="small" icon={<UserOutlined />} src={selectedAppointment.user_id?.profile_image} />
                <span>{selectedAppointment.user_id?.name} ({selectedAppointment.user_id?.email})</span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Agent:</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Avatar size="small" icon={<UserOutlined />} src={selectedAppointment.agent_id?.user_id?.profile_image} />
                <span>{selectedAppointment.agent_id?.user_id?.name}</span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Property:</strong>
              <div style={{ marginTop: 4 }}>
                <HomeOutlined /> {selectedAppointment.property_id?.title} - ${selectedAppointment.property_id?.price?.toLocaleString()}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Date & Time:</strong>{' '}
              {selectedAppointment.appointment_date ? 
                dayjs(selectedAppointment.appointment_date).format('MMMM DD, YYYY') : 'No date'
              } at {selectedAppointment.appointment_time || 'No time'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Duration:</strong> {selectedAppointment.duration || 30} minutes
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Type:</strong>{' '}
              <Tag color={getTypeColor(selectedAppointment.appointment_type)}>
                {(selectedAppointment.appointment_type || 'general').toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Status:</strong>{' '}
              <Tag color={getStatusColor(selectedAppointment.status)}>
                {selectedAppointment.status?.toUpperCase()}
              </Tag>
            </div>
            {selectedAppointment.notes && (
              <div style={{ marginBottom: 16 }}>
                <strong>Notes:</strong>
                <div style={{ 
                  marginTop: 8, 
                  padding: 12, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedAppointment.notes}
                </div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <strong>Scheduled:</strong> {new Date(selectedAppointment.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CalendarView
