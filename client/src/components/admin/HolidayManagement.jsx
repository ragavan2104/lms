import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Calendar, CalendarDays, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import axios from 'axios'

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    is_recurring: false
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchHolidays()
  }, [currentPage, searchTerm])

  const fetchHolidays = async () => {
    try {
      const response = await axios.get('/admin/holidays', {
        params: {
          page: currentPage,
          per_page: 10,
          search: searchTerm
        }
      })
      setHolidays(response.data.holidays)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch holidays:', error)
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

    if (!formData.name.trim()) {
      newErrors.name = 'Holiday name is required'
    }

    if (!formData.date) {
      newErrors.date = 'Holiday date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (!formData.is_recurring && selectedDate < today) {
        newErrors.date = 'Holiday date cannot be in the past (unless recurring)'
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

    setIsSubmitting(true)
    try {
      await axios.post('/admin/holidays', formData)
      alert('Holiday added successfully!')
      setShowAddForm(false)
      resetForm()
      setErrors({})
      fetchHolidays()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add holiday')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateHoliday = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await axios.put(`/admin/holidays/${editingHoliday.id}`, formData)
      alert('Holiday updated successfully!')
      setShowEditForm(false)
      setEditingHoliday(null)
      resetForm()
      setErrors({})
      fetchHolidays()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update holiday')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      description: '',
      is_recurring: false
    })
    setErrors({})
  }

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday)
    setFormData({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || '',
      is_recurring: holiday.is_recurring
    })
    setShowEditForm(true)
  }

  const handleDelete = async (holiday) => {
    if (window.confirm(`Are you sure you want to delete the holiday "${holiday.name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/admin/holidays/${holiday.id}`)
        alert('Holiday deleted successfully!')
        fetchHolidays()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete holiday')
      }
    }
  }

  const filteredHolidays = holidays.filter(holiday =>
    holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holiday.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading">Loading holidays...</div>
  }

  return (
    <div className="holiday-management">
      <div className="page-header">
        <div>
          <h1>Holiday Management</h1>
          <p>Manage holidays to prevent fine generation on non-working days</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Add Holiday
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search holidays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Holiday Statistics */}
      <div className="holiday-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{holidays.length}</h3>
            <p>Total Holidays</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={24} />
          </div>
          <div className="stat-content">
            <h3>{holidays.filter(h => h.is_recurring).length}</h3>
            <p>Recurring Holidays</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{holidays.filter(h => new Date(h.date) >= new Date()).length}</h3>
            <p>Upcoming Holidays</p>
          </div>
        </div>
      </div>

      <div className="holidays-table">
        <table>
          <thead>
            <tr>
              <th>Holiday Name</th>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHolidays.map((holiday) => (
              <tr key={holiday.id}>
                <td>
                  <div className="holiday-name">
                    <Calendar size={16} />
                    <strong>{holiday.name}</strong>
                  </div>
                </td>
                <td>
                  <div className="holiday-date">
                    {new Date(holiday.date).toLocaleDateString()}
                    {holiday.is_recurring && (
                      <span className="recurring-badge">Annual</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`holiday-type ${holiday.is_recurring ? 'recurring' : 'one-time'}`}>
                    {holiday.is_recurring ? (
                      <>
                        <CalendarDays size={14} />
                        Recurring
                      </>
                    ) : (
                      <>
                        <Calendar size={14} />
                        One-time
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <span className="description">
                    {holiday.description || 'No description'}
                  </span>
                </td>
                <td>{holiday.created_by}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(holiday)}
                      title="Edit holiday"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(holiday)}
                      title="Delete holiday"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredHolidays.length === 0 && (
          <div className="no-data">
            <Calendar size={48} />
            <h3>No holidays found</h3>
            <p>Add holidays to prevent fine generation on non-working days</p>
          </div>
        )}
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

      {/* Add Holiday Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Holiday</h2>
              <button onClick={() => {
                setShowAddForm(false)
                resetForm()
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Holiday Name *</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Independence Day, Christmas"
                      className={errors.name ? 'error' : ''}
                    />
                  </div>
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={errors.date ? 'error' : ''}
                  />
                  {errors.date && <span className="error-text">{errors.date}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description for the holiday"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Recurring Holiday (Annual)
                    <small>This holiday occurs every year on the same date</small>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {showEditForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Holiday</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingHoliday(null)
                resetForm()
              }}>×</button>
            </div>
            <form onSubmit={handleUpdateHoliday}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Holiday Name *</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Independence Day, Christmas"
                      className={errors.name ? 'error' : ''}
                    />
                  </div>
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={errors.date ? 'error' : ''}
                  />
                  {errors.date && <span className="error-text">{errors.date}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description for the holiday"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Recurring Holiday (Annual)
                    <small>This holiday occurs every year on the same date</small>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingHoliday(null)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="info-box">
        <AlertCircle size={20} />
        <div>
          <h4>How Holiday Management Works</h4>
          <ul>
            <li><strong>Fine Prevention:</strong> No overdue fines will be calculated for days marked as holidays</li>
            <li><strong>One-time Holidays:</strong> Specific dates like college events or special occasions</li>
            <li><strong>Recurring Holidays:</strong> Annual holidays like Independence Day, Christmas, etc.</li>
            <li><strong>Working Days:</strong> Only non-holiday days count toward overdue fine calculations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HolidayManagement
