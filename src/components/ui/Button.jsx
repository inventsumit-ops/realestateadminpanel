import React from 'react'
import { Button as AntButton } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const Button = ({
  children,
  loading = false,
  variant = 'primary',
  size = 'medium',
  icon,
  block = false,
  danger = false,
  disabled = false,
  onClick,
  type,
  htmlType,
  className,
  style,
  ...props
}) => {
  const getButtonType = () => {
    if (type) return type
    
    switch (variant) {
      case 'primary':
        return 'primary'
      case 'secondary':
        return 'default'
      case 'outline':
        return 'default'
      case 'ghost':
        return 'text'
      case 'link':
        return 'link'
      default:
        return 'primary'
    }
  }

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.2s ease-in-out',
      ...style
    }

    if (variant === 'outline') {
      return {
        ...baseStyle,
        borderColor: 'var(--primary-color)',
        color: 'var(--primary-color)',
        backgroundColor: 'transparent',
      }
    }

    return baseStyle
  }

  const getSize = () => {
    switch (size) {
      case 'small':
        return 'small'
      case 'large':
        return 'large'
      default:
        return 'middle'
    }
  }

  return (
    <AntButton
      type={getButtonType()}
      size={getSize()}
      icon={icon}
      loading={loading}
      block={block}
      danger={danger}
      disabled={disabled}
      onClick={onClick}
      htmlType={htmlType}
      className={className}
      style={getButtonStyle()}
      {...props}
    >
      {children}
    </AntButton>
  )
}

export default Button
