import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Building } from 'lucide-react'
import axios from 'axios'

const ManageColleges = ({ userRole = 'admin' }) => {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCollege, setEditingCollege] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    code: ''
  })

  useEffect(() => {
    fetchColleges()
  }, [])

  const fetchColleges = async () => {
    try {
      const response = await axios.get('/admin/colleges')
      setColleges(response.data.colleges)
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/admin/colleges', formData)
      alert('College added successfully!')
      setShowAddForm(false)
      setFormData({ name: '', code: '' })
      fetchColleges()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add college')
    }
  }

  const handleEdit = (college) => {
    setEditingCollege(college)
    setFormData({
      name: college.name,
      code: college.code
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/admin/colleges/${editingCollege.id}`, formData)
      alert('College updated successfully!')
      setShowEditForm(false)
      setEditingCollege(null)
      setFormData({ name: '', code: '' })
      fetchColleges()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update college')
    }
  }

  const handleDelete = async (college) => {
    if (window.confirm(`Are you sure you want to delete "${college.name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/admin/colleges/${college.id}`)
        alert('College deleted successfully!')
        fetchColleges()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete college')
      }
    }
  }

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading">Loading colleges...</div>
  }

  return (
    <div className="manage-colleges">
      <div className="page-header">
        <div>
          <h1>Manage Colleges</h1>
          <p>Add and manage college information</p>
        </div>
        <div className="header-actions">
          {userRole === 'admin' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Add College
            </button>
          )}
          {userRole === 'librarian' && (
            <div className="librarian-note">
              <p>View college information. Contact admin to add/edit colleges.</p>
            </div>
          )}
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="colleges-table">
        <table>
          <thead>
            <tr>
              <th>College Name</th>
              <th>Code</th>
              <th>Departments</th>
              <th>Created Date</th>
              {userRole === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredColleges.map((college) => (
              <tr key={college.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={16} color="#667eea" />
                    {college.name}
                  </div>
                </td>
                <td>{college.code}</td>
                <td>{college.departments_count}</td>
                <td>{new Date(college.created_at).toLocaleDateString()}</td>
                {userRole === 'admin' && (
                  <td>
                    <div className="actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(college)}
                        title="Edit College"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDelete(college)}
                        title="Delete College"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add College Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New College</h2>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>College Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter college name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>College Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Enter college code"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit College Modal */}
      {showEditForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit College</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingCollege(null)
                setFormData({ name: '', code: '' })
              }}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>College Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter college name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>College Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Enter college code"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingCollege(null)
                  setFormData({ name: '', code: '' })
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageColleges
