import React, { useState, useEffect } from 'react'
import { Plus, Search, User, Calendar, CheckCircle, AlertCircle, FileText, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'

const FineManagement = () => {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingFine, setEditingFine] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    reason: ''
  })

  // Predefined fine reasons
  const fineReasons = [
    'Book Missing',
    'Book Damaged',
    'Late Return',
    'Lost Library Card',
    'Other'
  ]

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchFines()
  }, [currentPage, statusFilter])

  const fetchFines = async () => {
    try {
      const response = await axios.get('/admin/fines', {
        params: {
          status: statusFilter,
          page: currentPage,
          per_page: 10
        }
      })
      setFines(response.data.fines)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch fines:', error)
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

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required'
    } else if (parseFloat(formData.amount) > 10000) {
      newErrors.amount = 'Amount cannot exceed ₹10,000'
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
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
      await axios.post('/admin/fines', {
        user_id: formData.userId,
        amount: parseFloat(formData.amount),
        reason: formData.reason
      })

      alert('Fine added successfully!')
      setShowAddForm(false)
      setFormData({ userId: '', amount: '', reason: '' })
      setErrors({})
      fetchFines()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add fine')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayFine = async (fineId) => {
    if (window.confirm('Mark this fine as paid?')) {
      try {
        await axios.post(`/admin/fines/${fineId}/pay`)
        alert('Fine marked as paid successfully!')
        fetchFines()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to mark fine as paid')
      }
    }
  }

  const handleEditFine = (fine) => {
    setEditingFine(fine)
    setFormData({
      userId: fine.user_id,
      amount: fine.amount.toString(),
      reason: fine.reason
    })
    setShowEditForm(true)
  }

  const handleUpdateFine = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await axios.put(`/admin/fines/${editingFine.id}`, {
        amount: parseFloat(formData.amount),
        reason: formData.reason
      })

      alert('Fine updated successfully!')
      setShowEditForm(false)
      setEditingFine(null)
      setFormData({ userId: '', amount: '', reason: '' })
      setErrors({})
      fetchFines()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update fine')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFine = async (fine) => {
    // First confirmation
    const firstConfirm = window.confirm(
      `⚠️ WARNING: You are about to delete this fine:\n\n` +
      `User: ${fine.user_name}\n` +
      `Amount: ₹${fine.amount.toFixed(2)}\n` +
      `Reason: ${fine.reason}\n\n` +
      `This action cannot be undone. Are you sure you want to continue?`
    )

    if (!firstConfirm) return

    // Second confirmation
    const secondConfirm = window.confirm(
      `This is your final confirmation.\n\n` +
      `Click OK to permanently delete this fine, or Cancel to abort.`
    )

    if (!secondConfirm) return

    try {
      await axios.delete(`/admin/fines/${fine.id}`)
      alert('Fine deleted successfully!')
      fetchFines()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete fine')
    }
  }

  const resetForm = () => {
    setFormData({ userId: '', amount: '', reason: '' })
    setErrors({})
  }

  if (loading) {
    return <div className="loading">Loading fines...</div>
  }

  return (
    <div className="fine-management">
      <div className="page-header">
        <div>
          <h1>Fine Management</h1>
          <p>Manage user fines and payments</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Add Fine
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by user name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Fines</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="fines-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Paid Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((fine) => (
              <tr key={fine.id}>
                <td>
                  <div className="user-info">
                    <strong>{fine.user_name}</strong>
                    <small>ID: {fine.user_id}</small>
                  </div>
                </td>
                <td>
                  <span className="amount">₹{fine.amount.toFixed(2)}</span>
                </td>
                <td>
                  <span className="reason">{fine.reason}</span>
                </td>
                <td>
                  <span className={`status ${fine.status}`}>
                    {fine.status === 'paid' ? (
                      <>
                        <CheckCircle size={14} />
                        Paid
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        Pending
                      </>
                    )}
                  </span>
                </td>
                <td>{new Date(fine.created_date).toLocaleDateString()}</td>
                <td>
                  {fine.paid_date ? new Date(fine.paid_date).toLocaleDateString() : '-'}
                </td>
                <td>
                  <div className="actions">
                    {fine.status === 'pending' && (
                      <button
                        className="btn-icon success"
                        onClick={() => handlePayFine(fine.id)}
                        title="Mark as Paid"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button
                      className="btn-icon"
                      onClick={() => handleEditFine(fine)}
                      title="Edit fine"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteFine(fine)}
                      title="Delete fine"
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

      {/* Add Fine Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Manual Fine</h2>
              <button onClick={() => {
                setShowAddForm(false)
                resetForm()
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>User ID (Roll Number) *</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      placeholder="Enter user ID"
                      className={errors.userId ? 'error' : ''}
                    />
                  </div>
                  {errors.userId && <span className="error-text">{errors.userId}</span>}
                </div>
                <div className="form-group">
                  <label>Fine Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount (numbers only)"
                    step="0.01"
                    min="0"
                    className={errors.amount ? 'error' : ''}
                  />
                  {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Reason *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className={errors.reason ? 'error' : ''}
                    required
                  >
                    <option value="">Select a reason</option>
                    {fineReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  {errors.reason && <span className="error-text">{errors.reason}</span>}
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
                  {isSubmitting ? 'Adding...' : 'Add Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fine Modal */}
      {showEditForm && editingFine && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Fine</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingFine(null)
                resetForm()
              }}>×</button>
            </div>
            <form onSubmit={handleUpdateFine}>
              <div className="form-grid">
                <div className="form-group">
                  <label>User ID (Roll Number)</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      disabled
                      className="disabled"
                    />
                  </div>
                  <small className="help-text">User ID cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Fine Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount (numbers only)"
                    step="0.01"
                    min="0"
                    max="10000"
                    className={errors.amount ? 'error' : ''}
                  />
                  {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Reason *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className={errors.reason ? 'error' : ''}
                    required
                  >
                    <option value="">Select a reason</option>
                    {fineReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  {errors.reason && <span className="error-text">{errors.reason}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingFine(null)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fine Modal */}
      {showEditForm && editingFine && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Fine</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingFine(null)
                resetForm()
              }}>×</button>
            </div>
            <form onSubmit={handleUpdateFine}>
              <div className="form-grid">
                <div className="form-group">
                  <label>User ID (Roll Number)</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      disabled
                      className="disabled"
                    />
                  </div>
                  <small className="help-text">User ID cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Fine Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount (numbers only)"
                    step="0.01"
                    min="0"
                    max="10000"
                    className={errors.amount ? 'error' : ''}
                  />
                  {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Reason *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className={errors.reason ? 'error' : ''}
                    required
                  >
                    <option value="">Select a reason</option>
                    {fineReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  {errors.reason && <span className="error-text">{errors.reason}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingFine(null)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FineManagement
