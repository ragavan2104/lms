import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Shield, Users, Clock } from 'lucide-react'
import axios from 'axios'

const GateEntryManagement = () => {
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    is_active: true
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const response = await axios.get('/admin/gate-credentials')
      setCredentials(response.data.credentials)
    } catch (error) {
      console.error('Failed to fetch gate credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!editingCredential && !formData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (editingCredential) {
        await axios.put(`/admin/gate-credentials/${editingCredential.id}`, formData)
        alert('Gate entry credential updated successfully!')
      } else {
        await axios.post('/admin/gate-credentials', formData)
        alert('Gate entry credential created successfully!')
      }

      setShowAddForm(false)
      setEditingCredential(null)
      setFormData({
        username: '',
        password: '',
        name: '',
        is_active: true
      })
      setErrors({})
      fetchCredentials()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save credential')
    }
  }

  const handleEdit = (credential) => {
    setEditingCredential(credential)
    setFormData({
      username: credential.username,
      password: '',
      name: credential.name,
      is_active: credential.is_active
    })
    setShowAddForm(true)
  }

  const handleDelete = async (credential) => {
    if (window.confirm(`Are you sure you want to delete the gate entry credential for "${credential.name}"?`)) {
      try {
        await axios.delete(`/admin/gate-credentials/${credential.id}`)
        alert('Gate entry credential deleted successfully!')
        fetchCredentials()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete credential')
      }
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingCredential(null)
    setFormData({
      username: '',
      password: '',
      name: '',
      is_active: true
    })
    setErrors({})
  }

  if (loading) {
    return <div className="loading">Loading gate entry credentials...</div>
  }

  return (
    <div className="gate-entry-management">
      <div className="page-header">
        <div>
          <h1>Gate Entry Management</h1>
          <p>Manage gate entry credentials for library access control</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Add Gate Credential
          </button>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="credentials-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((credential) => (
              <tr key={credential.id}>
                <td>
                  <div className="username-cell">
                    <Shield size={16} />
                    {credential.username}
                  </div>
                </td>
                <td>{credential.name}</td>
                <td>
                  <span className={`status ${credential.is_active ? 'active' : 'inactive'}`}>
                    {credential.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(credential.created_date).toLocaleDateString()}</td>
                <td>{credential.created_by}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(credential)}
                      title="Edit Credential"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(credential)}
                      title="Delete Credential"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {credentials.length === 0 && (
          <div className="no-data">
            <Shield size={48} />
            <h3>No Gate Entry Credentials</h3>
            <p>Create gate entry credentials to enable library access control.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCredential ? 'Edit Gate Credential' : 'Add Gate Credential'}</h2>
              <button onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className={errors.username ? 'error' : ''}
                    disabled={editingCredential} // Don't allow username change when editing
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Password {editingCredential ? '(leave blank to keep current)' : '*'}</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={editingCredential ? 'Enter new password' : 'Enter password'}
                      className={errors.password ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCredential ? 'Update Credential' : 'Create Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <div className="info-header">
            <Users size={20} />
            <h3>Gate Entry System</h3>
          </div>
          <div className="info-content">
            <p>Gate entry credentials allow authorized personnel to operate the library gate entry system.</p>
            <ul>
              <li>Each credential provides access to the Gate Entry Dashboard</li>
              <li>Gate operators can scan student barcodes to record entry/exit times</li>
              <li>All entry/exit activities are logged with timestamps</li>
              <li>Only active credentials can be used for gate operations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GateEntryManagement
