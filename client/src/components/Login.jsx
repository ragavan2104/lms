import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, User, Lock, AlertCircle } from 'lucide-react'

const Login = () => {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!userId || !password) {
      setError('Please enter both User ID and password')
      setLoading(false)
      return
    }

    const result = await login(userId, password)

    if (result.success) {
      // If first login, force password change route
      if (result.requires_password_change) {
        navigate('/change-password')
      } else {
        const user = result.user
        if (user.role === 'admin') navigate('/admin')
        else if (user.role === 'librarian') navigate('/librarian')
        else navigate('/student')
      }
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <BookOpen size={48} className="mx-auto text-indigo-600 mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">Library Management System</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <div className="relative">
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your User ID (e.g., CS2024001)"
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            <button
              type="button"
              className="text-white font-medium"
              onClick={() => navigate('/')}
            >
              ← Back to Library Catalog
            </button>
            <p className="mt-2">Contact your administrator for account issues</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
