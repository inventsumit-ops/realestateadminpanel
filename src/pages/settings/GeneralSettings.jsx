import React from 'react'
import {
  Typography,
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  message,
  Divider,
  InputNumber,
  Select,
} from 'antd'
import {
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminApi } from '../../services/api/adminApi'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

const GeneralSettings = () => {
  const [form] = Form.useForm()

  // Fetch settings data
  const {
    data: settingsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: adminApi.getSettings,
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      message.success('Settings updated successfully')
      refetch()
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update settings')
    },
  })

  // Initialize form with fetched data
  React.useEffect(() => {
    if (settingsData?.data) {
      const settings = settingsData.data
      form.setFieldsValue({
        siteName: settings.site?.name || '',
        siteDescription: settings.site?.description || '',
        contactEmail: settings.site?.contactEmail || '',
        maintenance: settings.site?.maintenance || false,
        propertyApproval: settings.features?.propertyApproval || false,
        agentVerification: settings.features?.agentVerification || false,
        emailNotifications: settings.features?.emailNotifications || false,
        smsNotifications: settings.features?.smsNotifications || false,
        maxPropertyImages: settings.limits?.maxPropertyImages || 10,
        maxPropertyVideos: settings.limits?.maxPropertyVideos || 3,
        maxFileSize: settings.limits?.maxFileSize || 5242880,
        allowedFileTypes: settings.limits?.allowedFileTypes || 'image/*,video/*',
      })
    }
  }, [settingsData, form])

  const handleSubmit = (values) => {
    const settings = {
      site: {
        name: values.siteName,
        description: values.siteDescription,
        contactEmail: values.contactEmail,
        maintenance: values.maintenance,
      },
      features: {
        propertyApproval: values.propertyApproval,
        agentVerification: values.agentVerification,
        emailNotifications: values.emailNotifications,
        smsNotifications: values.smsNotifications,
      },
      limits: {
        maxPropertyImages: values.maxPropertyImages,
        maxPropertyVideos: values.maxPropertyVideos,
        maxFileSize: values.maxFileSize,
        allowedFileTypes: values.allowedFileTypes,
      },
    }

    updateSettingsMutation.mutate({ settings })
  }

  const handleReset = () => {
    form.resetFields()
    message.info('Form reset to default values')
  }

  
  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>General Settings</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()}
            loading={updateSettingsMutation.isLoading}
          >
            Save Changes
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        loading={isLoading}
      >
        {/* Site Settings */}
        <Card title="Site Settings" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Site Name"
            name="siteName"
            rules={[{ required: true, message: 'Please enter site name' }]}
          >
            <Input placeholder="Enter site name" />
          </Form.Item>

          <Form.Item
            label="Site Description"
            name="siteDescription"
            rules={[{ required: true, message: 'Please enter site description' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Enter site description"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Contact Email"
            name="contactEmail"
            rules={[
              { required: true, message: 'Please enter contact email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter contact email" />
          </Form.Item>

          <Form.Item
            label="Maintenance Mode"
            name="maintenance"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        {/* Feature Settings */}
        <Card title="Feature Settings" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Property Approval"
            name="propertyApproval"
            valuePropName="checked"
            tooltip="Require admin approval for new property listings"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Agent Verification"
            name="agentVerification"
            valuePropName="checked"
            tooltip="Require admin verification for new agent accounts"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Email Notifications"
            name="emailNotifications"
            valuePropName="checked"
            tooltip="Enable email notifications for users"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="SMS Notifications"
            name="smsNotifications"
            valuePropName="checked"
            tooltip="Enable SMS notifications for users"
          >
            <Switch />
          </Form.Item>
        </Card>

        {/* Upload Limits */}
        <Card title="Upload Limits" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Max Property Images"
            name="maxPropertyImages"
            rules={[{ required: true, message: 'Please enter max images' }]}
          >
            <InputNumber 
              min={1} 
              max={50} 
              placeholder="Maximum number of images per property"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Max Property Videos"
            name="maxPropertyVideos"
            rules={[{ required: true, message: 'Please enter max videos' }]}
          >
            <InputNumber 
              min={0} 
              max={10} 
              placeholder="Maximum number of videos per property"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Max File Size (MB)"
            name="maxFileSize"
            rules={[{ required: true, message: 'Please enter max file size' }]}
          >
            <InputNumber 
              min={1} 
              max={100} 
              placeholder="Maximum file size in MB"
              style={{ width: '100%' }}
              formatter={(value) => `${value} MB`}
              parser={(value) => value.replace(' MB', '')}
            />
          </Form.Item>

          <Form.Item
            label="Allowed File Types"
            name="allowedFileTypes"
            rules={[{ required: true, message: 'Please enter allowed file types' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select allowed file types"
              style={{ width: '100%' }}
            >
              <Option value="image/*">Images</Option>
              <Option value="video/*">Videos</Option>
              <Option value="application/pdf">PDF Documents</Option>
              <Option value="application/msword">Word Documents</Option>
              <Option value="application/vnd.ms-excel">Excel Files</Option>
            </Select>
          </Form.Item>
        </Card>

        {/* System Information */}
        <Card title="System Information">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>API Version</div>
              <div style={{ fontWeight: 500 }}>v1.0.0</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>Frontend Version</div>
              <div style={{ fontWeight: 500 }}>v1.0.0</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>Environment</div>
              <div style={{ fontWeight: 500 }}>
                {import.meta.env.MODE === 'development' ? 'Development' : 'Production'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>Last Updated</div>
              <div style={{ fontWeight: 500 }}>
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>
      </Form>
    </div>
  )
}

export default GeneralSettings
