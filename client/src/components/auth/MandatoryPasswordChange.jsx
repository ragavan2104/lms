import React, { useState } from 'react'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './MandatoryPasswordChange.css'

const MandatoryPasswordChange = ({ onPasswordChanged }) => {
  const { changePassword, user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  })

  const validatePassword = (password) => {
    const feedback = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One uppercase letter')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One lowercase letter')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('One number')
    }

    return { score, feedback }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Update password strength for new password
    if (name === 'new_password') {
      setPasswordStrength(validatePassword(value))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required'
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required'
    } else if (passwordStrength.score < 4) {
      newErrors.new_password = 'Password does not meet security requirements'
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password'
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await changePassword(
        formData.current_password,
        formData.new_password,
        formData.confirm_password
      )

      if (result.success) {
        // Redirect based on role after successful password change
        if (user?.role === 'admin') navigate('/admin')
        else if (user?.role === 'librarian') navigate('/librarian')
        else navigate('/student')
        if (onPasswordChanged) onPasswordChanged()
      } else {
        setErrors({
          submit: result.error || 'Failed to change password'
        })
      }
    } catch (error) {
      setErrors({
        submit: 'Failed to change password'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return '#ef4444'
    if (passwordStrength.score <= 2) return '#f59e0b'
    if (passwordStrength.score <= 3) return '#eab308'
    return '#10b981'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Weak'
    if (passwordStrength.score <= 2) return 'Fair'
    if (passwordStrength.score <= 3) return 'Good'
    return 'Strong'
  }

  return (
    <div className="mandatory-password-change">
      <div className="password-change-container">
        <div className="password-change-header">
          <Lock className="header-icon" />
          <h1>Password Change Required</h1>
          <p>For security reasons, you must change your password before accessing the system.</p>
        </div>

        <form onSubmit={handleSubmit} className="password-change-form">
          {errors.submit && (
            <div className="error-alert">
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          )}

          {/* Current Password */}
          <div className="form-group">
            <label htmlFor="current_password">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleInputChange}
                className={errors.current_password ? 'error' : ''}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.current_password && (
              <span className="error-text">{errors.current_password}</span>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                className={errors.new_password ? 'error' : ''}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.new_password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  />
                </div>
                <span 
                  className="strength-text"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}

            {/* Password Requirements */}
            {formData.new_password && passwordStrength.feedback.length > 0 && (
              <div className="password-requirements">
                <p>Password must include:</p>
                <ul>
                  {passwordStrength.feedback.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {errors.new_password && (
              <span className="error-text">{errors.new_password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className={errors.confirm_password ? 'error' : ''}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirm_password && (
              <div className="password-match">
                {formData.new_password === formData.confirm_password ? (
                  <span className="match-success">
                    <CheckCircle size={14} />
                    Passwords match
                  </span>
                ) : (
                  <span className="match-error">
                    <AlertCircle size={14} />
                    Passwords do not match
                  </span>
                )}
              </div>
            )}

            {errors.confirm_password && (
              <span className="error-text">{errors.confirm_password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || passwordStrength.score < 4}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        <div className="security-notice">
          <AlertCircle size={16} />
          <p>
            Your new password will be used for all future logins. 
            Please keep it secure and do not share it with anyone.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MandatoryPasswordChange
