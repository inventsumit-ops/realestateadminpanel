import React from 'react'
import { Spin } from 'antd'

const Loader = ({
  size = 'default',
  tip = 'Loading...',
  spinning = true,
  children,
  className,
  style,
  ...props
}) => {
  return (
    <Spin
      size={size}
      tip={tip}
      spinning={spinning}
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        ...style,
      }}
      {...props}
    >
      {children}
    </Spin>
  )
}

export const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <Spin size="large" />
    <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
      Loading...
    </div>
  </div>
)

export const TableLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    width: '100%'
  }}>
    <Spin tip="Loading data..." />
  </div>
)

export default Loader
