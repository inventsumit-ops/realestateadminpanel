import React, { useState } from 'react'
import { Table as AntTable, Button, Space, Tag, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

const Table = ({
  columns = [],
  dataSource = [],
  loading = false,
  pagination = true,
  rowSelection = null,
  scroll = { x: 1200 },
  size = 'middle',
  bordered = false,
  showHeader = true,
  title = null,
  footer = null,
  onEdit,
  onDelete,
  onView,
  actions = true,
  ...props
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const actionColumn = actions ? {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (_, record) => (
      <Space size="small">
        {onView && (
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              style={{ color: 'var(--primary-color)' }}
            />
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              style={{ color: 'var(--warning-color)' }}
            />
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
              style={{ color: 'var(--error-color)' }}
            />
          </Tooltip>
        )}
      </Space>
    ),
  } : null

  const finalColumns = actionColumn ? [...columns, actionColumn] : columns

  const handleRowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    ...rowSelection,
  }

  return (
    <AntTable
      columns={finalColumns}
      dataSource={dataSource}
      loading={loading}
      pagination={
        pagination
          ? {
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['10', '20', '50', '100'],
              defaultPageSize: 20,
              ...pagination,
            }
          : false
      }
      rowSelection={rowSelection ? handleRowSelection : null}
      scroll={scroll}
      size={size}
      bordered={bordered}
      showHeader={showHeader}
      title={title}
      footer={footer}
      rowKey="id"
      className="custom-table"
      styles={{
        header: {
          backgroundColor: 'var(--surface-color)',
          borderBottom: '2px solid var(--primary-light)',
        },
        headerCell: {
          fontWeight: '600',
          color: 'var(--text-primary)',
        },
      }}
      {...props}
    />
  )
}

export default Table
