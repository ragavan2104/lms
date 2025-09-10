import React, { useState, useEffect } from 'react'
import { Plus, Upload, Download, Search, Edit, Trash2, BookOpen, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import './ManageJournals.css'

const ManageJournals = ({ userRole = 'admin' }) => {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [journalTypeFilter, setJournalTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingJournal, setEditingJournal] = useState(null)

  const [formData, setFormData] = useState({
    access_no: '',
    journal_name: '',
    publication: '',
    journal_type: ''
  })

  const [bulkFile, setBulkFile] = useState(null)
  const [bulkJournalType, setBulkJournalType] = useState('')

  useEffect(() => {
    fetchJournals()
  }, [currentPage, searchTerm, journalTypeFilter])

  const fetchJournals = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/journals`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          per_page: 10,
          search: searchTerm,
          journal_type: journalTypeFilter
        }
      })
      setJournals(response.data.journals)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching journals:', error)
      alert('Error fetching journals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      
      if (editingJournal) {
        // Update existing journal
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/admin/journals/${editingJournal.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Journal updated successfully!')
        setShowEditForm(false)
        setEditingJournal(null)
      } else {
        // Create new journal
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/journals`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Journal created successfully!')
        setShowAddForm(false)
      }
      
      resetForm()
      fetchJournals()
    } catch (error) {
      console.error('Error saving journal:', error)
      alert(error.response?.data?.error || 'Error saving journal')
    }
  }

  const handleEdit = (journal) => {
    setEditingJournal(journal)
    setFormData({
      access_no: journal.access_no,
      journal_name: journal.journal_name,
      publication: journal.publication,
      journal_type: journal.journal_type
    })
    setShowEditForm(true)
  }

  const handleDelete = async (journalId) => {
    if (!confirm('Are you sure you want to delete this journal?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/admin/journals/${journalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Journal deleted successfully!')
      fetchJournals()
    } catch (error) {
      console.error('Error deleting journal:', error)
      alert(error.response?.data?.error || 'Error deleting journal')
    }
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (!bulkFile || !bulkJournalType) {
      alert('Please select a file and journal type')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', bulkFile)
      formData.append('journal_type', bulkJournalType)

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/journals/bulk`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      alert(`Successfully uploaded ${response.data.journals_created} journals!`)
      if (response.data.errors.length > 0) {
        console.log('Upload errors:', response.data.errors)
      }
      
      setShowBulkUpload(false)
      setBulkFile(null)
      setBulkJournalType('')
      fetchJournals()
    } catch (error) {
      console.error('Error uploading journals:', error)
      alert(error.response?.data?.error || 'Error uploading journals')
    }
  }

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/journals/sample-template`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'journal_sample_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Error downloading template')
    }
  }

  const resetForm = () => {
    setFormData({
      access_no: '',
      journal_name: '',
      publication: '',
      journal_type: ''
    })
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setShowEditForm(false)
    setEditingJournal(null)
    resetForm()
  }

  return (
    <div className="manage-journals">
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <BookOpen className="header-icon" />
            <div>
              <h1>Manage Journals</h1>
              <p>Add, edit, and manage journal records</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBulkUpload(true)}
            >
              <Upload size={16} />
              Bulk Upload
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Add Journal
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search journals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={journalTypeFilter}
            onChange={(e) => setJournalTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="National Journal">National Journal</option>
            <option value="International Journal">International Journal</option>
          </select>
        </div>
      </div>

      {/* Journals Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading journals...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Access No</th>
                <th>Journal Name</th>
                <th>Publication</th>
                <th>Type</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {journals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No journals found</td>
                </tr>
              ) : (
                journals.map((journal) => (
                  <tr key={journal.id}>
                    <td>{journal.access_no}</td>
                    <td>{journal.journal_name}</td>
                    <td>{journal.publication}</td>
                    <td>
                      <span className={`type-badge ${journal.journal_type === 'International Journal' ? 'international' : 'national'}`}>
                        {journal.journal_type}
                      </span>
                    </td>
                    <td>{new Date(journal.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(journal)}
                          title="Edit Journal"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(journal.id)}
                          title="Delete Journal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Journal Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Journal</h2>
              <button className="close-btn" onClick={handleCancel}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Access Number <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.access_no}
                  onChange={(e) => setFormData({...formData, access_no: e.target.value})}
                  required
                  placeholder="e.g., JNL001"
                />
              </div>
              <div className="form-group">
                <label>Journal Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.journal_name}
                  onChange={(e) => setFormData({...formData, journal_name: e.target.value})}
                  required
                  placeholder="Full journal name"
                />
              </div>
              <div className="form-group">
                <label>Publication <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.publication}
                  onChange={(e) => setFormData({...formData, publication: e.target.value})}
                  required
                  placeholder="Publisher/publishing house name"
                />
              </div>
              <div className="form-group">
                <label>Journal Type <span className="required">*</span></label>
                <select
                  value={formData.journal_type}
                  onChange={(e) => setFormData({...formData, journal_type: e.target.value})}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="National Journal">National Journal</option>
                  <option value="International Journal">International Journal</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Journal Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Journal</h2>
              <button className="close-btn" onClick={handleCancel}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Access Number <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.access_no}
                  onChange={(e) => setFormData({...formData, access_no: e.target.value})}
                  required
                  placeholder="e.g., JNL001"
                />
              </div>
              <div className="form-group">
                <label>Journal Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.journal_name}
                  onChange={(e) => setFormData({...formData, journal_name: e.target.value})}
                  required
                  placeholder="Full journal name"
                />
              </div>
              <div className="form-group">
                <label>Publication <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.publication}
                  onChange={(e) => setFormData({...formData, publication: e.target.value})}
                  required
                  placeholder="Publisher/publishing house name"
                />
              </div>
              <div className="form-group">
                <label>Journal Type <span className="required">*</span></label>
                <select
                  value={formData.journal_type}
                  onChange={(e) => setFormData({...formData, journal_type: e.target.value})}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="National Journal">National Journal</option>
                  <option value="International Journal">International Journal</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Journal
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
              <h2>Bulk Upload Journals</h2>
              <button className="close-btn" onClick={() => setShowBulkUpload(false)}>×</button>
            </div>
            <form onSubmit={handleBulkUpload} className="modal-body">
              <div className="form-group">
                <label>Journal Type <span className="required">*</span></label>
                <select
                  value={bulkJournalType}
                  onChange={(e) => setBulkJournalType(e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="National Journal">National Journal</option>
                  <option value="International Journal">International Journal</option>
                </select>
                <small>All journals in the uploaded file will be assigned this type</small>
              </div>
              <div className="form-group">
                <label>Excel File <span className="required">*</span></label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  required
                />
                <small>
                  Excel file should contain columns: access_no, journal_name, publication<br/>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={downloadTemplate}
                  >
                    <Download size={14} />
                    Download sample template
                  </button>
                </small>
              </div>
              <div className="info-box">
                <AlertTriangle size={16} />
                <div>
                  <strong>Important:</strong>
                  <ul>
                    <li>Access numbers must be unique</li>
                    <li>All required fields must be filled</li>
                    <li>Duplicate access numbers will be skipped</li>
                  </ul>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBulkUpload(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Journals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageJournals
