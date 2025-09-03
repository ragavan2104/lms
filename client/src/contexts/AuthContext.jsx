import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getApiBaseUrl } from '../utils/apiConfig'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Configure axios defaults
axios.defaults.baseURL = getApiBaseUrl()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/profile')
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userId, password) => {
    try {
      const response = await axios.post('/auth/login', {
        user_id: userId,
        password
      })

      const { access_token, user, requires_password_change } = response.data

      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      setUser(user)
      setRequiresPasswordChange(!!requires_password_change)

      // If password change is required, navigate will be handled by ProtectedRoute
      return {
        success: true,
        user,
        requires_password_change: !!requires_password_change
      }
    } catch (error) {
      console.error('Login failed:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    window.location.href = '/login'
  }

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await axios.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      })

      // If password change was successful and it was a first login, clear the flag
      if (response.data.first_login_completed) {
        setRequiresPasswordChange(false)
      }

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Password change failed'
      }
    }
  }

  const value = {
    user,
    loading,
    requiresPasswordChange,
    login,
    logout,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
