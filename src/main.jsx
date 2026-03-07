import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { store } from './store'
import App from './App.jsx'
import './assets/styles/theme.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Ant Design theme configuration
const antdTheme = {
  token: {
    colorPrimary: '#87CEEB',
    colorPrimaryHover: '#5BA0C0',
    colorPrimaryActive: '#4682B4',
    colorPrimaryBg: '#E0F6FF',
    colorPrimaryBorder: '#87CEEB',
    colorPrimaryBorderHover: '#5BA0C0',
    colorPrimaryText: '#2C3E50',
    colorPrimaryTextHover: '#1E5F8E',
    borderRadius: 8,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
      bodyBg: '#F8FAFB',
    },
    Menu: {
      itemBg: '#FFFFFF',
      itemSelectedBg: '#E6F7FF',
      itemHoverBg: '#F0F8FF',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(135, 206, 235, 0.1)',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      boxShadowTertiary: '0 1px 3px rgba(135, 206, 235, 0.12)',
    },
    Table: {
      headerBg: '#FFFFFF',
      headerColor: '#2C3E50',
    },
    Input: {
      colorBgContainer: '#FFFFFF',
      activeBorderColor: '#87CEEB',
      hoverBorderColor: '#B0E0E6',
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      optionActiveBg: '#F0F8FF',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={antdTheme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)
