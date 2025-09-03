import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Book, IndianRupee, Calendar, Users } from 'lucide-react'
import axios from 'axios'

const Settings = () => {
  const [settings, setSettings] = useState({
    max_books_per_student: 3,
    max_books_per_staff: 5,
    loan_period_days: 14,
    daily_fine_rate: 1.0,
    max_renewal_count: 2,
    renewal_period_days: 7,
    overdue_grace_period: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/admin/settings')
      setSettings(response.data.settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Use default settings if fetch fails
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await axios.post('/admin/settings', { settings })
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading settings...</div>
  }

  return (
    <div className="settings">
      <div className="page-header">
        <div>
          <h1>Library Settings</h1>
          <p>Configure borrowing limits, fine rates, and system parameters</p>
        </div>
      </div>

      <div className="settings-container">
        <form onSubmit={handleSubmit}>
          <div className="settings-sections">
            
            {/* Borrowing Limits Section */}
            <div className="settings-section">
              <div className="section-header">
                <Book size={20} />
                <h2>Borrowing Limits</h2>
              </div>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Maximum Books per Student</label>
                  <input
                    type="number"
                    name="max_books_per_student"
                    value={settings.max_books_per_student}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    required
                  />
                  <small>Maximum number of books a student can borrow at once</small>
                </div>
                <div className="setting-item">
                  <label>Maximum Books per Staff</label>
                  <input
                    type="number"
                    name="max_books_per_staff"
                    value={settings.max_books_per_staff}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                  />
                  <small>Maximum number of books a staff member can borrow at once</small>
                </div>
                <div className="setting-item">
                  <label>Default Loan Period (Days)</label>
                  <input
                    type="number"
                    name="loan_period_days"
                    value={settings.loan_period_days}
                    onChange={handleInputChange}
                    min="1"
                    max="90"
                    required
                  />
                  <small>Default number of days for book loans</small>
                </div>
              </div>
            </div>

            {/* Fine Management Section */}
            <div className="settings-section">
              <div className="section-header">
                <IndianRupee size={20} />
                <h2>Fine Management</h2>
              </div>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Daily Fine Rate (₹)</label>
                  <input
                    type="number"
                    name="daily_fine_rate"
                    value={settings.daily_fine_rate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  <small>Fine amount charged per day for overdue books</small>
                </div>
                <div className="setting-item">
                  <label>Overdue Grace Period (Days)</label>
                  <input
                    type="number"
                    name="overdue_grace_period"
                    value={settings.overdue_grace_period}
                    onChange={handleInputChange}
                    min="0"
                    max="7"
                  />
                  <small>Number of days before fines start accumulating</small>
                </div>
              </div>
            </div>

            {/* Renewal Settings Section */}
            <div className="settings-section">
              <div className="section-header">
                <Calendar size={20} />
                <h2>Book Renewal</h2>
              </div>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Maximum Renewals per Book</label>
                  <input
                    type="number"
                    name="max_renewal_count"
                    value={settings.max_renewal_count}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    required
                  />
                  <small>Maximum number of times a book can be renewed</small>
                </div>
                <div className="setting-item">
                  <label>Renewal Period (Days)</label>
                  <input
                    type="number"
                    name="renewal_period_days"
                    value={settings.renewal_period_days}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    required
                  />
                  <small>Number of days added when a book is renewed</small>
                </div>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="settings-section">
              <div className="section-header">
                <SettingsIcon size={20} />
                <h2>Current Configuration Summary</h2>
              </div>
              <div className="settings-summary">
                <div className="summary-item">
                  <span className="summary-label">Students can borrow:</span>
                  <span className="summary-value">{settings.max_books_per_student} books maximum</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Default loan period:</span>
                  <span className="summary-value">{settings.loan_period_days} days</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Overdue fine:</span>
                  <span className="summary-value">₹{settings.daily_fine_rate}/day after {settings.overdue_grace_period} day grace period</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Renewals allowed:</span>
                  <span className="summary-value">{settings.max_renewal_count} times, {settings.renewal_period_days} days each</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Settings
