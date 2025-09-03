import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react'
import axios from 'axios'

const ManageDepartments = ({ userRole = 'admin' }) => {
  const [departments, setDepartments] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollege, setSelectedCollege] = useState('')
  const [editingDepartment, setEditingDepartment] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    college_id: ''
  })

  useEffect(() => {
    fetchDepartments()
    fetchColleges()
  }, [selectedCollege])

  const fetchDepartments = async () => {
    try {
      const params = selectedCollege ? { college_id: selectedCollege } : {}
      const response = await axios.get('/admin/departments', { params })
      setDepartments(response.data.departments)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const response = await axios.get('/admin/colleges')
      setColleges(response.data.colleges)
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
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
      await axios.post('/admin/departments', formData)
      alert('Department added successfully!')
      setShowAddForm(false)
      setFormData({ name: '', code: '', college_id: '' })
      fetchDepartments()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add department')
    }
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      college_id: department.college_id
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/admin/departments/${editingDepartment.id}`, formData)
      alert('Department updated successfully!')
      setShowEditForm(false)
      setEditingDepartment(null)
      setFormData({ name: '', code: '', college_id: '' })
      fetchDepartments()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update department')
    }
  }

  const handleDelete = async (department) => {
    if (window.confirm(`Are you sure you want to delete "${department.name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/admin/departments/${department.id}`)
        alert('Department deleted successfully!')
        fetchDepartments()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete department')
      }
    }
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.college_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading">Loading departments...</div>
  }

  return (
    <div className="manage-departments">
      <div className="page-header">
        <div>
          <h1>Manage Departments</h1>
          <p>Add and manage college departments</p>
        </div>
        <div className="header-actions">
          {userRole === 'admin' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Add Department
            </button>
          )}
          {userRole === 'librarian' && (
            <div className="librarian-note">
              <p>View department information. Contact admin to add/edit departments.</p>
            </div>
          )}
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
          className="filter-select"
        >
          <option value="">All Colleges</option>
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.name}
            </option>
          ))}
        </select>
      </div>

      <div className="departments-table">
        <table>
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Code</th>
              <th>College</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((department) => (
              <tr key={department.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} color="#667eea" />
                    {department.name}
                  </div>
                </td>
                <td>{department.code}</td>
                <td>{department.college_name}</td>
                <td>{new Date(department.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(department)}
                      title="Edit Department"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(department)}
                      title="Delete Department"
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

      {/* Add Department Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Department</h2>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Enter department code"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <select
                    name="college_id"
                    value={formData.college_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select College</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Department</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingDepartment(null)
                setFormData({ name: '', code: '', college_id: '' })
              }}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Enter department code"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <select
                    name="college_id"
                    value={formData.college_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select College</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingDepartment(null)
                  setFormData({ name: '', code: '', college_id: '' })
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageDepartments
