import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Download, FileText, Calendar, User, Book,
  Clock, AlertCircle, CheckCircle, Eye, TrendingUp, BarChart3,
  RefreshCw, ChevronLeft, ChevronRight, SortAsc, SortDesc
} from 'lucide-react'
import axios from 'axios'

const CirculationHistory = () => {
  const [historyData, setHistoryData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)

  // Sorting
  const [sortField, setSortField] = useState('issue_date')
  const [sortDirection, setSortDirection] = useState('desc')

  // Filters
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    status: 'all', // all, issued, returned, overdue, renewed
    user_type: 'all', // all, student, staff, faculty
    college_id: 'all',
    department_id: 'all',
    book_category: 'all'
  })

  // Statistics
  const [statistics, setStatistics] = useState({
    total_transactions: 0,
    active_loans: 0,
    overdue_books: 0,
    total_fines: 0,
    popular_books: [],
    active_users: 0
  })

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)

  // Connection status
  const [isConnected, setIsConnected] = useState(true)
  const [usingSampleData, setUsingSampleData] = useState(false)

  useEffect(() => {
    fetchColleges()
    fetchCirculationHistory()
    fetchStatistics()

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchCirculationHistory()
      fetchStatistics()
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    if (filters.college_id && filters.college_id !== 'all') {
      fetchDepartments(filters.college_id)
    } else {
      setDepartments([])
      setFilters(prev => ({ ...prev, department_id: 'all' }))
    }
  }, [filters.college_id])

  useEffect(() => {
    fetchCirculationHistory()
  }, [currentPage, sortField, sortDirection, filters])

  useEffect(() => {
    handleSearch()
  }, [searchTerm, historyData])

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
      const response = await axios.get(`/admin/departments?college_id=${collegeId}`)
      setDepartments(response.data.departments)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const fetchCirculationHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sort_field: sortField,
        sort_direction: sortDirection
      })

      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key])
        }
      })

      const response = await axios.get(`/admin/circulation/history?${params.toString()}`)
      console.log('Circulation history response:', response.data)

      // Handle different response formats
      if (response.data.data) {
        setHistoryData(response.data.data)
        setTotalItems(response.data.total || response.data.data.length)
      } else if (Array.isArray(response.data)) {
        setHistoryData(response.data)
        setTotalItems(response.data.length)
      } else {
        console.warn('Unexpected response format:', response.data)
        setHistoryData([])
        setTotalItems(0)
      }
    } catch (error) {
      console.error('Failed to fetch circulation history:', error)

      // Try alternative endpoints if main one fails
      try {
        console.log('Trying alternative endpoint...')
        const fallbackResponse = await axios.get('/admin/circulations')
        if (fallbackResponse.data) {
          const fallbackData = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : fallbackResponse.data.circulations || []
          setHistoryData(fallbackData)
          setTotalItems(fallbackData.length)
          console.log('Fallback data loaded:', fallbackData.length, 'records')
        }
      } catch (fallbackError) {
        console.error('All endpoints failed:', fallbackError)
        setIsConnected(false)
        setUsingSampleData(false)
        setHistoryData([])
        setTotalItems(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/admin/circulation/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)

      // Try to get basic stats from dashboard
      try {
        const dashboardResponse = await axios.get('/admin/dashboard-stats')
        if (dashboardResponse.data) {
          setStatistics({
            total_transactions: dashboardResponse.data.activeCirculations || 0,
            active_loans: dashboardResponse.data.activeCirculations || 0,
            overdue_books: dashboardResponse.data.overdueBooks || 0,
            total_fines: dashboardResponse.data.totalFines || 0,
            active_users: dashboardResponse.data.totalStudents || 0,
            popular_books: []
          })
        }
      } catch (fallbackError) {
        console.error('Statistics fallback failed:', fallbackError)
        setStatistics({
          total_transactions: 0,
          active_loans: 0,
          overdue_books: 0,
          total_fines: 0,
          active_users: 0,
          popular_books: []
        })
      }
    }
  }

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredData(historyData)
      return
    }

    const filtered = historyData.filter(item =>
      item.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.book_author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredData(filtered)
  }, [searchTerm, historyData])

  const debouncedSearch = useCallback((value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      setSearchTerm(value)
    }, 300)

    setSearchTimeout(timeout)
  }, [searchTimeout])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      from_date: '',
      to_date: '',
      status: 'all',
      user_type: 'all',
      college_id: 'all',
      department_id: 'all',
      book_category: 'all'
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const exportToExcel = async () => {
    if (historyData.length === 0) {
      alert('No data to export. Please ensure data is loaded first.')
      return
    }

    setExporting(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key])
        }
      })

      const response = await axios.get(`/api/admin/circulation/export/excel?${params.toString()}`, {
        responseType: 'blob',
        timeout: 30000
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `circulation_history_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      if (error.code === 'ECONNABORTED') {
        alert('Export timeout. Please try again.')
      } else if (error.response?.status === 404) {
        alert('Export endpoint not available.')
      } else {
        alert('Failed to export data.')
      }
    } finally {
      setExporting(false)
    }
  }



  const exportToPDF = async () => {
    if (historyData.length === 0) {
      alert('No data to export. Please ensure data is loaded first.')
      return
    }

    setExporting(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key])
        }
      })

      const response = await axios.get(`/api/admin/circulation/export/pdf?${params.toString()}`, {
        responseType: 'blob',
        timeout: 30000
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `circulation_history_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export failed:', error)
      if (error.code === 'ECONNABORTED') {
        alert('Export timeout. Please try again.')
      } else if (error.response?.status === 404) {
        alert('PDF export endpoint not available.')
      } else {
        alert('Failed to export PDF.')
      }
    } finally {
      setExporting(false)
    }
  }

  const viewUserHistory = async (userId) => {
    try {
      const response = await axios.get(`/admin/circulation/user/${userId}`)
      setSelectedUser(response.data)
      setShowUserModal(true)
    } catch (error) {
      console.error('Failed to fetch user history:', error)
      alert('Failed to load user history')
    }
  }

  const viewBookHistory = async (bookId) => {
    try {
      const response = await axios.get(`/admin/circulation/book/${bookId}`)
      setSelectedBook(response.data)
      setShowBookModal(true)
    } catch (error) {
      console.error('Failed to fetch book history:', error)
      alert('Failed to load book history')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      issued: { color: 'blue', icon: Book, text: 'Issued' },
      returned: { color: 'green', icon: CheckCircle, text: 'Returned' },
      overdue: { color: 'red', icon: AlertCircle, text: 'Overdue' },
      renewed: { color: 'orange', icon: RefreshCw, text: 'Renewed' }
    }

    const config = statusConfig[status] || statusConfig.issued
    const Icon = config.icon

    return (
      <span className={`status-badge ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today - due
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const displayData = searchTerm ? filteredData : historyData

  return (
    <div className="circulation-history">
      <div className="page-header">
        <div>
          <h1>Circulation History</h1>
          <p>Comprehensive library transaction records and analytics</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={exportToExcel}
            disabled={exporting}
          >
            <Download size={16} />
            Export Excel
          </button>
          <button
            className="btn btn-secondary"
            onClick={exportToPDF}
            disabled={exporting}
          >
            <FileText size={16} />
            Export PDF
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              fetchCirculationHistory()
              fetchStatistics()
            }}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="connection-banner">
          <div className="banner-content">
            <AlertCircle size={20} />
            <div>
              <strong>Backend Connection Failed</strong>
              <p>Unable to connect to the backend server. Please ensure the Flask server is running on port 5000.</p>
              <p><strong>To start the server:</strong> Navigate to the backend folder and run <code>python app.py</code></p>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setIsConnected(true)
                fetchCirculationHistory()
                fetchStatistics()
              }}
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="statistics-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.total_transactions?.toLocaleString() || 0}</h3>
              <p>Total Transactions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <Book size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.active_loans?.toLocaleString() || 0}</h3>
              <p>Active Loans</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon overdue">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.overdue_books?.toLocaleString() || 0}</h3>
              <p>Overdue Books</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon fine">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>₹{statistics.total_fines?.toFixed(2) || '0.00'}</h3>
              <p>Total Fines</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon users">
              <User size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.active_users?.toLocaleString() || 0}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-lg shadow space-y-4">
  {/* Search Bar */}
  <div className="w-full max-w-md">
    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
      <Search size={16} className="text-gray-500 mr-2" />
      <input
        type="text"
        placeholder="Search by user ID, name, book title, author, or ISBN..."
        onChange={(e) => debouncedSearch(e.target.value)}
        value={searchTerm}
        className="w-full focus:outline-none text-sm"
      />
    </div>
  </div>

  {/* Filters Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Date Range */}
    <div>
      <label className="block text-sm font-medium mb-1">Date Range</label>
      <div className="flex gap-2">
        <input
          type="date"
          name="from_date"
          value={filters.from_date}
          onChange={handleFilterChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="date"
          name="to_date"
          value={filters.to_date}
          onChange={handleFilterChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
    </div>

    {/* Status */}
    <div>
      <label className="block text-sm font-medium mb-1">Status</label>
      <select
        name="status"
        value={filters.status}
        onChange={handleFilterChange}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="all">All Status</option>
        <option value="issued">Issued</option>
        <option value="returned">Returned</option>
        <option value="overdue">Overdue</option>
        <option value="renewed">Renewed</option>
      </select>
    </div>

    {/* User Type */}
    <div>
      <label className="block text-sm font-medium mb-1">User Type</label>
      <select
        name="user_type"
        value={filters.user_type}
        onChange={handleFilterChange}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="all">All Users</option>
        <option value="student">Students</option>
        <option value="staff">Staff</option>
        <option value="faculty">Faculty</option>
      </select>
    </div>

    {/* College */}
    <div>
      <label className="block text-sm font-medium mb-1">College</label>
      <select
        name="college_id"
        value={filters.college_id}
        onChange={handleFilterChange}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="all">All Colleges</option>
        {colleges.map((college) => (
          <option key={college.id} value={college.id}>
            {college.name}
          </option>
        ))}
      </select>
    </div>

    {/* Department */}
    {departments.length > 0 && (
      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <select
          name="department_id"
          value={filters.department_id}
          onChange={handleFilterChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>

  {/* Clear Filters Button */}
  <div>
    <button
      onClick={clearFilters}
      title="Clear all filters"
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
    >
      Clear Filters
    </button>
  </div>
</div>


      {/* Data Table */}
      <div className="table-section">
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="spinning" />
            <p>Loading circulation history...</p>
          </div>
        ) : (
          <>
            <div className="table-header">
              <h3>
                Circulation Records
                <span className="record-count">
                  ({searchTerm ? filteredData.length : totalItems} records)
                </span>
              </h3>
            </div>

            <div className="table-container">
              <table className="circulation-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('user_name')} className="sortable">
                      User
                      {sortField === 'user_name' && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('book_title')} className="sortable">
                      Book
                      {sortField === 'book_title' && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('issue_date')} className="sortable">
                      Issue Date
                      {sortField === 'issue_date' && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('due_date')} className="sortable">
                      Due Date
                      {sortField === 'due_date' && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('return_date')} className="sortable">
                      Return Date
                      {sortField === 'return_date' && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('fine_amount')} className="sortable">
                      Fine
                      {sortField === 'fine_amount' && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.length > 0 ? (
                    displayData.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-name">{record.user_name}</div>
                            <div className="user-id">{record.user_id}</div>
                            <div className="user-type">{record.user_type}</div>
                          </div>
                        </td>
                        <td>
                          <div className="book-info">
                            <div className="book-title">{record.book_title}</div>
                            <div className="book-author">by {record.book_author}</div>
                            <div className="book-isbn">ISBN: {record.isbn}</div>
                          </div>
                        </td>
                        <td>{formatDate(record.issue_date)}</td>
                        <td>
                          <div className={`due-date ${record.status === 'overdue' ? 'overdue' : ''}`}>
                            {formatDate(record.due_date)}
                            {record.status === 'overdue' && (
                              <div className="overdue-days">
                                {getDaysOverdue(record.due_date)} days overdue
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(record.return_date)}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>
                          <div className="fine-amount">
                            ₹{record.fine_amount?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => viewUserHistory(record.user_id)}
                              title="View User History"
                            >
                              <User size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => viewBookHistory(record.book_id)}
                              title="View Book History"
                            >
                              <Book size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        <div className="no-data-message">
                          <Book size={48} />
                          <h3>No circulation records found</h3>
                          <p>Try adjusting your search criteria or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!searchTerm && totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} records
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i
                      if (pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}
                  </div>

                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CirculationHistory
