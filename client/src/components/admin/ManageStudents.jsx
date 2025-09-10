import React, { useState, useEffect } from 'react'
import { Plus, Upload, Download, Search, Edit, Trash2, Users, Eye, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import StudentProfile from './StudentProfile'
import './ManageStudents.css'

const ManageStudents = ({ userRole = 'admin' }) => {
  const [students, setStudents] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollege, setSelectedCollege] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingStudent, setEditingStudent] = useState(null)
  const [roleFilter, setRoleFilter] = useState('all') // 'all', 'student', 'staff'
  const [showProfile, setShowProfile] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    college_id: '',
    department_id: '',
    designation: 'student',
    role: 'student',
    dob: '',
    validity_date: '',
    batch_from: '',
    batch_to: ''
  })

  const [bulkFile, setBulkFile] = useState(null)
  const [bulkCollegeId, setBulkCollegeId] = useState('')
  const [bulkDepartmentId, setBulkDepartmentId] = useState('')
  const [bulkRole, setBulkRole] = useState('student')

  useEffect(() => {
    fetchStudents()
    fetchColleges()
  }, [currentPage, searchTerm, roleFilter])

  useEffect(() => {
    if (selectedCollege) {
      fetchDepartments(selectedCollege)
    }
  }, [selectedCollege])

  const fetchStudents = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        search: searchTerm
      }

      // Add role filter if not 'all'
      if (roleFilter !== 'all') {
        params.role = roleFilter
      }

      const response = await axios.get('/admin/users', { params })
      setStudents(response.data.users)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch users:', error)
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

  const fetchDepartments = async (collegeId) => {
    try {
      const response = await axios.get('/admin/departments', {
        params: { college_id: collegeId }
      })
      setDepartments(response.data.departments)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
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
      const response = await axios.post('/admin/users', formData)

      // Show username and password to admin
      const { username, password } = response.data.user
      const userType = formData.role === 'staff' ? 'Staff member' : 'Student'
      alert(`${userType} added successfully!\n\nLogin Credentials:\nUsername: ${username}\nPassword: ${password}\n\nPlease save these credentials and share with the ${formData.role === 'staff' ? 'staff member' : 'student'}.`)

      setShowAddForm(false)
      setFormData({
        user_id: '',
        name: '',
        email: '',
        college_id: '',
        department_id: '',
        designation: 'student',
        role: 'student',
        dob: '',
        validity_date: '',
        batch_from: '',
        batch_to: ''
      })
      fetchStudents()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add student')
    }
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (!bulkFile || !bulkCollegeId || !bulkDepartmentId) {
      alert('Please select file, college, and department')
      return
    }

    const formData = new FormData()
    formData.append('file', bulkFile)
    formData.append('college_id', bulkCollegeId)
    formData.append('department_id', bulkDepartmentId)
    formData.append('user_role', bulkUserRole)

    try {
      const response = await axios.post('/admin/users/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Download credentials
      if (response.data.created_users.length > 0) {
        const credentialsResponse = await axios.post('/admin/users/credentials', {
          users: response.data.created_users
        }, {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([credentialsResponse.data]))
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
        link.setAttribute('download', `student_credentials_${timestamp}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }

      alert(`Successfully added ${response.data.created_users.length} students! Login credentials have been downloaded automatically.`)
      setShowBulkUpload(false)
      setBulkFile(null)
      setBulkCollegeId('')
      setBulkDepartmentId('')
      fetchStudents()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload students')
    }
  }

  const downloadSample = async () => {
    try {
      const response = await axios.get('/admin/students/sample', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'students_sample.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Failed to download sample file')
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      user_id: student.user_id,
      name: student.name,
      email: student.email,
      college_id: student.college_id || '',
      department_id: student.department_id || '',
      designation: student.designation,
      role: student.role,
      dob: student.dob,
      validity_date: student.validity_date,
      batch_from: student.batch_from || '',
      batch_to: student.batch_to || ''
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/admin/users/${editingStudent.id}`, formData)
      alert('Student updated successfully!')
      setShowEditForm(false)
      setEditingStudent(null)
      setFormData({
        user_id: '',
        name: '',
        email: '',
        college_id: '',
        department_id: '',
        designation: 'student',
        role: 'student',
        dob: '',
        validity_date: '',
        batch_from: '',
        batch_to: ''
      })
      fetchStudents()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update student')
    }
  }

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete "${student.name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/admin/users/${student.id}`)
        alert('Student deleted successfully!')
        fetchStudents()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete student')
      }
    }
  }

  const handleBulkDelete = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      `⚠️ WARNING: You are about to delete ALL students from the system.\n\n` +
      `This action will:\n` +
      `• Permanently remove all student accounts\n` +
      `• Cannot be undone\n` +
      `• Students with active book loans cannot be deleted\n\n` +
      `Are you sure you want to continue?`
    )

    if (!firstConfirm) return

    // Second confirmation with typing requirement
    const confirmText = prompt(
      `This is your final confirmation.\n\n` +
      `To proceed with deleting ALL students, please type: DELETE ALL STUDENTS\n\n` +
      `Type exactly as shown above (case sensitive):`
    )

    if (confirmText !== 'DELETE ALL STUDENTS') {
      if (confirmText !== null) { // User didn't cancel
        alert('Confirmation text did not match. Operation cancelled.')
      }
      return
    }

    try {
      const response = await axios.delete('/admin/students/bulk-delete')

      alert(`✅ Success!\n\n${response.data.message}`)

      // Refresh the students list
      fetchStudents()

    } catch (error) {
      const errorData = error.response?.data

      if (errorData?.students_with_loans) {
        // Show detailed error for students with active loans
        const loanDetails = errorData.students_with_loans
          .map(student => `• ${student.name} (${student.user_id}) - ${student.active_loans} active loan(s)`)
          .join('\n')

        alert(
          `❌ Cannot delete students with active book loans:\n\n` +
          `${loanDetails}\n\n` +
          `Please ensure all books are returned before attempting bulk deletion.\n\n` +
          `Total students with loans: ${errorData.total_students_with_loans} out of ${errorData.total_students}`
        )
      } else {
        alert(`❌ Error: ${errorData?.error || 'Failed to delete students'}`)
      }
    }
  }

  const handleViewProfile = (student) => {
    setSelectedStudentId(student.user_id)
    setShowProfile(true)
  }

  const handleBackFromProfile = () => {
    setShowProfile(false)
    setSelectedStudentId(null)
  }

  if (loading) {
    return <div className="loading">Loading students...</div>
  }

  // Show student profile if selected
  if (showProfile && selectedStudentId) {
    return (
      <StudentProfile
        studentId={selectedStudentId}
        onBack={handleBackFromProfile}
      />
    )
  }

  return (
    <div className="manage-students">
      <div className="page-header">
        <div className="header-title">
          <h1>
            {roleFilter === 'all' ? 'Manage Users' :
             roleFilter === 'student' ? 'Manage Students' :
             'Manage Staff Members'}
          </h1>
          <p className="header-subtitle">
            {roleFilter === 'all' ? 'View and manage all users in the system' :
             roleFilter === 'student' ? 'View and manage student accounts' :
             'View and manage staff member accounts'}
          </p>
        </div>
        <div className="header-actions">
          {userRole === 'admin' && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => {
                  // Set default role based on current filter
                  const defaultRole = roleFilter === 'staff' ? 'staff' : 'student'
                  setFormData(prev => ({
                    ...prev,
                    role: defaultRole,
                    designation: defaultRole
                  }))
                  setShowAddForm(true)
                }}
              >
                <Plus size={16} />
                Add {roleFilter === 'staff' ? 'Staff Member' : 'Student'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowBulkUpload(true)}
              >
                <Upload size={16} />
                Bulk Upload
              </button>
              <button
                className="btn btn-secondary"
                onClick={downloadSample}
              >
                <Download size={16} />
                Sample Sheet
              </button>
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
                title={`Delete all ${roleFilter === 'all' ? 'users' : roleFilter === 'student' ? 'students' : 'staff members'} from the system`}
              >
                <AlertTriangle size={16} />
                Delete All {roleFilter === 'all' ? 'Users' : roleFilter === 'student' ? 'Students' : 'Staff'}
              </button>
            </>
          )}
          {userRole === 'librarian' && (
            <div className="librarian-note">
              <p>View and manage user information. Contact admin to add new users.</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Filter Buttons */}
      <div className="role-filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setRoleFilter('all')
              setCurrentPage(1)
            }}
          >
            <Users size={16} />
            All Users
            <span className="filter-count">
              {roleFilter === 'all' ? students.length : ''}
            </span>
          </button>
          <button
            className={`filter-btn ${roleFilter === 'student' ? 'active' : ''}`}
            onClick={() => {
              setRoleFilter('student')
              setCurrentPage(1)
            }}
          >
            <Users size={16} />
            Students Only
            <span className="filter-count">
              {roleFilter === 'student' ? students.length : ''}
            </span>
          </button>
          <button
            className={`filter-btn ${roleFilter === 'staff' ? 'active' : ''}`}
            onClick={() => {
              setRoleFilter('staff')
              setCurrentPage(1)
            }}
          >
            <Users size={16} />
            Staff Only
            <span className="filter-count">
              {roleFilter === 'staff' ? students.length : ''}
            </span>
          </button>
        </div>
        <div className="filter-info">
          <span className="current-filter">
            Currently showing: <strong>
              {roleFilter === 'all' ? 'All Users' :
               roleFilter === 'student' ? 'Students Only' :
               'Staff Members Only'}
            </strong>
          </span>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              {roleFilter === 'all' && <th>Role</th>}
              <th>College</th>
              <th>Department</th>
              <th>Validity Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className={`user-row ${student.role}`}>
                <td>
                  <div className="user-id-cell">
                    <span className="user-id">{student.user_id}</span>
                    {student.role === 'staff' && (
                      <span className="role-badge staff">Staff</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="user-name-cell">
                    <span className="user-name">{student.name}</span>
                    {student.designation && (
                      <span className="designation">{student.designation}</span>
                    )}
                  </div>
                </td>
                <td>{student.email}</td>
                {roleFilter === 'all' && (
                  <td>
                    <span className={`role-tag ${student.role}`}>
                      {student.role === 'student' ? 'Student' :
                       student.role === 'staff' ? 'Staff' :
                       student.role === 'librarian' ? 'Librarian' :
                       student.role === 'admin' ? 'Admin' : student.role}
                    </span>
                  </td>
                )}
                <td>{student.college || 'N/A'}</td>
                <td>{student.department || 'N/A'}</td>
                <td>{new Date(student.validity_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${student.is_active ? 'active' : 'inactive'}`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon info"
                      onClick={() => handleViewProfile(student)}
                      title="View Profile"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(student)}
                      title="Edit Student"
                    >
                      <Edit size={14} />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDelete(student)}
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New {formData.role === 'staff' ? 'Staff Member' : 'Student'}</h2>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="role-selection">
                <h4>User Type</h4>
                <div className="role-options">
                  <label className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        role: e.target.value,
                        designation: e.target.value
                      }))}
                    />
                    <Users size={16} />
                    Student
                  </label>
                  <label className={`role-option ${formData.role === 'staff' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={formData.role === 'staff'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        role: e.target.value,
                        designation: e.target.value
                      }))}
                    />
                    <Users size={16} />
                    Staff Member
                  </label>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>{formData.role === 'staff' ? 'Employee ID' : 'User ID (Roll Number)'}</label>
                  <input
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    placeholder={formData.role === 'staff' ? 'Enter employee ID' : 'Enter roll number'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <select
                    name="college_id"
                    value={formData.college_id}
                    onChange={(e) => {
                      handleInputChange(e)
                      setSelectedCollege(e.target.value)
                    }}
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
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="user_role"
                    value={formData.user_role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Validity Date</label>
                  <input
                    type="date"
                    name="validity_date"
                    value={formData.validity_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Batch From Year</label>
                  <input
                    type="number"
                    name="batch_from"
                    value={formData.batch_from}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                    min="1900"
                    max="2100"
                  />
                </div>
                <div className="form-group">
                  <label>Batch To Year</label>
                  <input
                    type="number"
                    name="batch_to"
                    value={formData.batch_to}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024"
                    min="1900"
                    max="2100"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add {formData.role === 'staff' ? 'Staff Member' : 'Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Bulk Upload Students</h2>
              <button onClick={() => setShowBulkUpload(false)}>×</button>
            </div>
            <form onSubmit={handleBulkUpload}>
              <div className="form-group">
                <label>College</label>
                <select
                  value={bulkCollegeId}
                  onChange={(e) => {
                    setBulkCollegeId(e.target.value)
                    setSelectedCollege(e.target.value)
                  }}
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
              <div className="form-group">
                <label>Department</label>
                <select
                  value={bulkDepartmentId}
                  onChange={(e) => setBulkDepartmentId(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={bulkUserRole}
                  onChange={(e) => setBulkUserRole(e.target.value)}
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label>Excel File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  required
                />
                <small>
                  Excel file should contain columns: user_id, name, email, validity_date, dob<br/>
                  Optional columns: batch_from, batch_to (year format, e.g., 2020, 2024)
                </small>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowBulkUpload(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingStudent(null)
                setFormData({
                  user_id: '',
                  name: '',
                  email: '',
                  college_id: '',
                  department_id: '',
                  designation: 'student',
                  role: 'student',
                  dob: '',
                  validity_date: ''
                })
              }}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>User ID (Roll Number)</label>
                  <input
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    disabled
                  />
                  <small>User ID cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <select
                    name="college_id"
                    value={formData.college_id}
                    onChange={(e) => {
                      handleInputChange(e)
                      setSelectedCollege(e.target.value)
                    }}
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
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Validity Date</label>
                  <input
                    type="date"
                    name="validity_date"
                    value={formData.validity_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Batch From Year</label>
                  <input
                    type="number"
                    name="batch_from"
                    value={formData.batch_from}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                    min="1900"
                    max="2100"
                  />
                </div>
                <div className="form-group">
                  <label>Batch To Year</label>
                  <input
                    type="number"
                    name="batch_to"
                    value={formData.batch_to}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024"
                    min="1900"
                    max="2100"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingStudent(null)
                  setFormData({
                    user_id: '',
                    name: '',
                    email: '',
                    college_id: '',
                    department_id: '',
                    designation: 'student',
                    role: 'student',
                    dob: '',
                    validity_date: '',
                    batch_from: '',
                    batch_to: ''
                  })
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageStudents
