import { useState, useEffect, useContext, createContext } from 'react'
import { authApi } from '../services/api/authApi'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Auth initialization error:', error)
          localStorage.removeItem('token')
        }
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials)
      const { token, user: userData } = response
      
      localStorage.setItem('token', token)
      setUser(userData)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData)
      return response
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (userData) => {
    try {
      const response = await authApi.updateProfile(userData)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default useAuth
