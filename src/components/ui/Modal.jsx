import React from 'react'
import { Modal as AntModal } from 'antd'

const Modal = ({
  open,
  title,
  children,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading = false,
  width = 520,
  centered = true,
  maskClosable = false,
  destroyOnClose = true,
  footer = null,
  className,
  ...props
}) => {
  return (
    <AntModal
      open={open}
      title={title}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      width={width}
      centered={centered}
      maskClosable={maskClosable}
      destroyOnClose={destroyOnClose}
      footer={footer}
      className={`custom-modal ${className || ''}`}
      styles={{
        body: { padding: '24px' },
        header: { 
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 24px'
        },
        footer: { 
          borderTop: '1px solid var(--border-color)',
          padding: '16px 24px'
        }
      }}
      {...props}
    >
      {children}
    </AntModal>
  )
}

export default Modal
