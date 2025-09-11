import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Edit, Trash2, Search, Filter, Upload, Download, AlertCircle, CheckCircle, Settings } from 'lucide-react'
import axios from 'axios'

const ManageHolidays = () => {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRecurring, setFilterRecurring] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [applyFinesOnSunday, setApplyFinesOnSunday] = useState(true)
  const [savingSundaySetting, setSavingSundaySetting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    is_recurring: false
  })

  const [bulkFile, setBulkFile] = useState(null)

  useEffect(() => {
    fetchHolidays()
    fetchSundayFineSetting()
  }, [currentPage, searchTerm, filterRecurring])

  const fetchHolidays = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterRecurring) params.append('is_recurring', filterRecurring)
      
      const response = await axios.get(`/admin/holidays?${params}`)
      setHolidays(response.data.holidays)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching holidays:', error)
      alert('Failed to fetch holidays')
    } finally {
      setLoading(false)
    }
  }

  const fetchSundayFineSetting = async () => {
    try {
      const response = await axios.get('/admin/sunday-fine-setting')
      setApplyFinesOnSunday(response.data.apply_fines_on_sunday)
    } catch (error) {
      console.error('Error fetching Sunday fine setting:', error)
    }
  }

  const updateSundayFineSetting = async (newValue) => {
    try {
      setSavingSundaySetting(true)
      await axios.post('/admin/sunday-fine-setting', {
        apply_fines_on_sunday: newValue
      })
      setApplyFinesOnSunday(newValue)
      alert('Sunday fine setting updated successfully!')
    } catch (error) {
      console.error('Error updating Sunday fine setting:', error)
      alert('Failed to update Sunday fine setting')
    } finally {
      setSavingSundaySetting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/admin/holidays', formData)
      alert('Holiday added successfully!')
      setShowAddForm(false)
      resetForm()
      fetchHolidays()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add holiday')
    }
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

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/admin/holidays/${editingHoliday.id}`, formData)
      alert('Holiday updated successfully!')
      setShowEditForm(false)
      setEditingHoliday(null)
      resetForm()
      fetchHolidays()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update holiday')
    }
  }

  const handleDelete = async (holidayId, holidayName) => {
    if (window.confirm(`Are you sure you want to delete "${holidayName}"?`)) {
      try {
        await axios.delete(`/admin/holidays/${holidayId}`)
        alert('Holiday deleted successfully!')
        fetchHolidays()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete holiday')
      }
    }
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (!bulkFile) {
      alert('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', bulkFile)

    try {
      const response = await axios.post('/admin/holidays/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const { created, errors, total_rows } = response.data.summary
      let message = `Bulk upload completed!\nTotal rows: ${total_rows}\nCreated: ${created}\nErrors: ${errors}`
      
      if (response.data.errors.length > 0) {
        message += '\n\nErrors:\n' + response.data.errors.slice(0, 5).join('\n')
        if (response.data.errors.length > 5) {
          message += `\n... and ${response.data.errors.length - 5} more errors`
        }
      }
      
      alert(message)
      setShowBulkUpload(false)
      setBulkFile(null)
      fetchHolidays()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload holidays')
    }
  }

  const handleExport = async () => {
    try {
      const response = await axios.get('/admin/holidays/export', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `holidays_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Failed to export holidays')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      description: '',
      is_recurring: false
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Loading holidays...</div>
  }

  return (
    <div className="manage-holidays">
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <Calendar className="header-icon" />
            <div>
              <h1>Holiday Management</h1>
              <p>Manage library holidays and closure dates</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBulkUpload(true)}
            >
              <Upload size={16} />
              Bulk Import
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Add Holiday
            </button>
          </div>
        </div>
      </div>

      {/* Sunday Fine Setting */}
      <div className="settings-section" style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={20} style={{ color: '#6c757d' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#495057' }}>
                Sunday Fine Policy
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                Configure whether fines are applied on Sundays for overdue books
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#495057',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={applyFinesOnSunday}
                onChange={(e) => updateSundayFineSetting(e.target.checked)}
                disabled={savingSundaySetting}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#007bff'
                }}
              />
              {applyFinesOnSunday ? 'Apply fines on Sundays' : 'Skip fines on Sundays'}
            </label>
            {savingSundaySetting && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search holidays..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select
            value={filterRecurring}
            onChange={(e) => {
              setFilterRecurring(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Holidays</option>
            <option value="true">Recurring Only</option>
            <option value="false">One-time Only</option>
          </select>
        </div>
      </div>

      {/* Holidays Table */}
      <div className="table-container holiday-table-container">
        <table className="data-table holiday-table">
          <thead>
            <tr>
              <th>Holiday Name</th>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map(holiday => (
              <tr key={holiday.id}>
                <td className="holiday-name">
                  <strong>{holiday.name}</strong>
                </td>
                <td>{formatDate(holiday.date)}</td>
                <td>
                  <span className={`badge ${holiday.is_recurring ? 'badge-success' : 'badge-info'}`}>
                    {holiday.is_recurring ? 'Recurring' : 'One-time'}
                  </span>
                </td>
                <td className="description">
                  {holiday.description || '-'}
                </td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEdit(holiday)}
                    title="Edit Holiday"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(holiday.id, holiday.name)}
                    title="Delete Holiday"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {holidays.length === 0 && (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No holidays found</h3>
            <p>Add holidays to manage library closure dates</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Add Holiday Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Holiday</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}
              >×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Holiday Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Christmas, Independence Day"
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description of the holiday"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  Recurring Holiday (repeats annually)
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Holiday</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingHoliday(null)
                  resetForm()
                }}
              >×</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-group">
                <label>Holiday Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description of the holiday"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  Recurring Holiday (repeats annually)
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEditForm(false)
                  setEditingHoliday(null)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Bulk Import Holidays</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowBulkUpload(false)
                  setBulkFile(null)
                }}
              >×</button>
            </div>
            <form onSubmit={handleBulkUpload} className="modal-body">
              <div className="form-group">
                <label>Upload File (CSV or Excel)</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  required
                />
                <small className="help-text">
                  File should contain columns: name, date, description (optional), is_recurring (optional)
                </small>
              </div>
              <div className="info-box">
                <AlertCircle size={16} />
                <div>
                  <strong>File Format Requirements:</strong>
                  <ul>
                    <li>Required columns: name, date</li>
                    <li>Optional columns: description, is_recurring</li>
                    <li>Date format: YYYY-MM-DD or MM/DD/YYYY</li>
                    <li>is_recurring: true/false or 1/0</li>
                  </ul>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowBulkUpload(false)
                  setBulkFile(null)
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Import Holidays
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Management Specific Styles */}
      <style jsx>{`
        .holiday-table-container {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background: white;
        }

        .holiday-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .holiday-table th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          padding: 16px 12px;
          text-align: left;
          border-bottom: 2px solid #5a67d8;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .holiday-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
          font-size: 14px;
        }

        .holiday-table tbody tr {
          transition: all 0.2s ease;
        }

        .holiday-table tbody tr:hover {
          background-color: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .holiday-table tbody tr:last-child td {
          border-bottom: none;
        }

        .holiday-name strong {
          color: #2d3748;
          font-weight: 600;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-success {
          background-color: #c6f6d5;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }

        .badge-info {
          background-color: #bee3f8;
          color: #2c5282;
          border: 1px solid #90cdf4;
        }

        .description {
          color: #4a5568;
          font-style: italic;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          gap: 8px;
          justify-content: flex-start;
        }

        .actions .btn {
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .actions .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .btn-outline {
          background: white;
          border-color: #cbd5e0;
          color: #4a5568;
        }

        .btn-outline:hover {
          background: #f7fafc;
          border-color: #a0aec0;
          color: #2d3748;
        }

        .btn-danger {
          background: #fed7d7;
          border-color: #feb2b2;
          color: #c53030;
        }

        .btn-danger:hover {
          background: #fc8181;
          border-color: #f56565;
          color: white;
        }

        @media (max-width: 768px) {
          .holiday-table th,
          .holiday-table td {
            padding: 10px 8px;
            font-size: 13px;
          }

          .description {
            max-width: 150px;
          }

          .actions {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  )
}

export default ManageHolidays
