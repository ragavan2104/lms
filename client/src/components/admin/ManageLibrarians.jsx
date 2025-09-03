import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Users, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const ManageLibrarians = () => {
  const [librarians, setLibrarians] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingLibrarian, setEditingLibrarian] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchLibrarians()
  }, [currentPage, searchTerm])

  const fetchLibrarians = async () => {
    try {
      const response = await axios.get('/admin/users', {
        params: {
          role: 'librarian',
          page: currentPage,
          per_page: 10,
          search: searchTerm
        }
      })
      setLibrarians(response.data.users)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch librarians:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!editingLibrarian) { // Only validate password for new librarians
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
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
      const submitData = {
        user_id: formData.username, // Use username as user_id for librarians
        username: formData.username,
        email: formData.email,
        name: formData.name,
        role: 'librarian',
        designation: 'staff',
        dob: '1990-01-01', // Default DOB for librarians
        validity_date: '2030-12-31', // Long validity for librarians
        college_id: null, // Librarians don't need college/department
        department_id: null
      }

      if (!editingLibrarian) {
        submitData.password = formData.password
      }

      await axios.post('/admin/users', submitData)
      alert('Librarian added successfully!')
      setShowAddForm(false)
      resetForm()
      fetchLibrarians()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add librarian')
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleEdit = (librarian) => {
    setEditingLibrarian(librarian)
    setFormData({
      username: librarian.username,
      email: librarian.email,
      name: librarian.name,
      password: '',
      confirmPassword: ''
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    // For updates, don't validate password fields
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        validity_date: editingLibrarian.validity_date,
        is_active: true
      }

      await axios.put(`/admin/users/${editingLibrarian.id}`, updateData)
      alert('Librarian updated successfully!')
      setShowEditForm(false)
      setEditingLibrarian(null)
      resetForm()
      fetchLibrarians()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update librarian')
    }
  }

  const handleDelete = async (librarian) => {
    if (window.confirm(`Are you sure you want to delete "${librarian.name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/admin/users/${librarian.id}`)
        alert('Librarian deleted successfully!')
        fetchLibrarians()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete librarian')
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading librarians...</div>
  }

  return (
    <div className="manage-librarians">
      <div className="page-header">
        <div>
          <h1>Manage Librarians</h1>
          <p>Add and manage librarian accounts</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Add Librarian
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search librarians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="librarians-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Validity Date</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {librarians.map((librarian) => (
              <tr key={librarian.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="#667eea" />
                    {librarian.username}
                  </div>
                </td>
                <td>{librarian.name}</td>
                <td>{librarian.email}</td>
                <td>{new Date(librarian.validity_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${librarian.is_active ? 'active' : 'inactive'}`}>
                    {librarian.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(librarian.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(librarian)}
                      title="Edit Librarian"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(librarian)}
                      title="Delete Librarian"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Add Librarian Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Librarian</h2>
              <button onClick={() => {
                setShowAddForm(false)
                resetForm()
              }}>×</button>
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
                    placeholder="Enter username (e.g., john.doe)"
                    className={errors.username ? 'error' : ''}
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                  {!errors.username && <small>This will be used for login</small>}
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
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
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
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
                  {!errors.password && <small>Minimum 6 characters</small>}
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Librarian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Librarian Modal */}
      {showEditForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Librarian</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingLibrarian(null)
                resetForm()
              }}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    disabled
                    placeholder="Username cannot be changed"
                  />
                  <small>Username cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
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
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingLibrarian(null)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Librarian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageLibrarians
