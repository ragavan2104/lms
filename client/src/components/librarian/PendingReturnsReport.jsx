import React, { useState, useEffect } from 'react'
import { Download, Filter, FileText, DollarSign, AlertTriangle, BookOpen, Calendar, Search } from 'lucide-react'
import axios from 'axios'

const PendingReturnsReport = () => {
  const [reportData, setReportData] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [summary, setSummary] = useState({
    total_pending: 0,
    total_overdue: 0,
    total_fine_amount: 0
  })

  const [filters, setFilters] = useState({
    college_id: '',
    department_id: '',
    start_date: '',
    end_date: '',
    overdue_only: false
  })

  useEffect(() => {
    fetchColleges()
    generateReport()
  }, [])

  useEffect(() => {
    if (filters.college_id && filters.college_id !== '') {
      fetchDepartments(filters.college_id)
    } else {
      setDepartments([])
      setFilters(prev => ({ ...prev, department_id: '' }))
    }
  }, [filters.college_id])

  const fetchColleges = async () => {
    try {
      const response = await axios.get('/librarian/colleges')
      setColleges(response.data.colleges || [])
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
      setColleges([])
    }
  }

  const fetchDepartments = async (collegeId) => {
    try {
      const response = await axios.get(`/librarian/departments?college_id=${collegeId}`)
      setDepartments(response.data.departments || [])
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      setDepartments([])
    }
  }

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })

      const response = await axios.get(`/librarian/reports/pending-returns?${params.toString()}`)
      setReportData(response.data.data)
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format) => {
    if (reportData.length === 0) {
      alert('No data to export. Please generate a report first.')
      return
    }

    setExporting(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      params.append('format', format)

      const response = await axios.get(`/librarian/reports/pending-returns/export?${params.toString()}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pending_returns_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (status) => {
    return (
      <span className={`status ${status}`}>
        {status === 'overdue' ? 'Overdue' : 'Issued'}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="pending-returns-report">
      <div className="page-header">
        <div>
          <h1>Pending Book Returns Report</h1>
          <p>Track all books currently issued and pending return</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => exportReport('excel')}
            disabled={exporting || reportData.length === 0}
          >
            <Download size={16} />
            Export Excel
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => exportReport('pdf')}
            disabled={exporting || reportData.length === 0}
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-card">
          <div className="filters-header">
            <Filter size={20} />
            <h3>Report Filters</h3>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>College</label>
              <select
                name="college_id"
                value={filters.college_id}
                onChange={handleFilterChange}
              >
                <option value="">All Colleges</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Department</label>
              <select
                name="department_id"
                value={filters.department_id}
                onChange={handleFilterChange}
                disabled={!filters.college_id}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Issue Date From</label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Issue Date To</label>
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="overdue_only"
                  checked={filters.overdue_only}
                  onChange={handleFilterChange}
                />
                <span>Show Overdue Only</span>
              </label>
            </div>
            <div className="filter-group">
              <button 
                className="btn btn-primary"
                onClick={generateReport}
                disabled={loading}
              >
                <Search size={16} />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData.length > 0 && (
        <div className="summary-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon total">
                <BookOpen size={24} />
              </div>
              <div className="card-content">
                <h3>{summary.total_pending}</h3>
                <p>Total Pending Returns</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon unpaid">
                <AlertTriangle size={24} />
              </div>
              <div className="card-content">
                <h3>{summary.total_overdue}</h3>
                <p>Overdue Books</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon fine">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <h3>₹{summary.total_fine_amount.toFixed(2)}</h3>
                <p>Total Fine Amount</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="report-table-section">
        <div className="report-table">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Generating report...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="no-data">
              <FileText size={48} />
              <h3>No Data Found</h3>
              <p>No pending returns match the selected criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Book Details</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{item.user_name}</div>
                        <div className="user-id">{item.user_id}</div>
                        <div className="user-college">{item.college}</div>
                        <div className="user-department">{item.department}</div>
                      </div>
                    </td>
                    <td>
                      <div className="book-info">
                        <div className="book-title">{item.book_title}</div>
                        <div className="book-author">by {item.book_author}</div>
                        <div className="book-access">Access: {item.access_no}</div>
                        <div className="book-isbn">ISBN: {item.isbn}</div>
                      </div>
                    </td>
                    <td>{formatDate(item.issue_date)}</td>
                    <td className={item.status === 'overdue' ? 'overdue-date' : ''}>
                      {formatDate(item.due_date)}
                    </td>
                    <td>
                      {item.days_overdue > 0 ? (
                        <span className="overdue-days">{item.days_overdue} days</span>
                      ) : (
                        <span className="no-overdue">-</span>
                      )}
                    </td>
                    <td className="amount">
                      {item.fine_amount > 0 ? `₹${item.fine_amount.toFixed(2)}` : '-'}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default PendingReturnsReport
