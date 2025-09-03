import React, { useState, useEffect } from 'react'
import { FileText, Download, Filter, Calendar, Building, BookOpen, RotateCcw } from 'lucide-react'
import axios from 'axios'

const CounterReports = () => {
  const [reportData, setReportData] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [filters, setFilters] = useState({
    type: 'issue',
    from_date: '',
    to_date: '',
    college_id: 'all',
    department_id: 'all'
  })

  useEffect(() => {
    fetchColleges()
    generateReport()
  }, [])

  useEffect(() => {
    if (filters.college_id && filters.college_id !== 'all') {
      fetchDepartments(filters.college_id)
    } else {
      setDepartments([])
      setFilters(prev => ({ ...prev, department_id: 'all' }))
    }
  }, [filters.college_id])

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/admin/colleges', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setColleges(response.data.colleges)
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
    }
  }

  const fetchDepartments = async (collegeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:5000/api/admin/departments?college_id=${collegeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setDepartments(response.data.departments)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key])
        }
      })

      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:5000/api/admin/reports/counter?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setReportData(response.data.data)
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
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key])
        }
      })
      params.append('format', format)

      console.log('Exporting counter report with params:', params.toString())

      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:5000/api/admin/reports/counter?${params.toString()}`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.size === 0) {
        throw new Error('Empty file received from server')
      }

      const contentType = format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf'

      const blob = new Blob([response.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
      const reportType = filters.type.charAt(0).toUpperCase() + filters.type.slice(1)
      const filename = `${reportType}_Report_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      link.setAttribute('download', filename)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('Counter report exported successfully:', filename)

    } catch (error) {
      console.error('Failed to export counter report:', error)

      if (error.code === 'ECONNABORTED') {
        alert('Export timeout. Please try again with a smaller date range.')
      } else if (error.response?.status === 404) {
        alert('Export endpoint not found. Please contact administrator.')
      } else if (error.response?.status === 500) {
        alert('Server error during export. Please try again later.')
      } else {
        alert(`Failed to export report: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setExporting(false)
    }
  }

  const getReportColumns = () => {
    if (filters.type === 'return') {
      return [
        'Student ID', 'Name', 'College', 'Department', 'Book Title', 
        'Author', 'Access No', 'Issue Date', 'Due Date', 'Return Date', 'Fine Amount'
      ]
    } else {
      return [
        'Student ID', 'Name', 'College', 'Department', 'Book Title', 
        'Author', 'Access No', 'Issue Date', 'Due Date', 'Status'
      ]
    }
  }

  return (
    <div className="counter-reports">
      <div className="page-header">
        <div>
          <h1>Counter Reports</h1>
          <p>Generate and export library transaction reports</p>
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

      {/* Report Type Selection */}
      <div className="report-type-section">
        <div className="type-cards">
          <div 
            className={`type-card ${filters.type === 'issue' ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'issue' }))}
          >
            <BookOpen size={32} />
            <h3>Book Issue Report</h3>
            <p>All book issuing transactions</p>
          </div>
          <div 
            className={`type-card ${filters.type === 'return' ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'return' }))}
          >
            <RotateCcw size={32} />
            <h3>Book Return Report</h3>
            <p>All book return transactions</p>
          </div>
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
              <label>From Date</label>
              <input
                type="date"
                name="from_date"
                value={filters.from_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                name="to_date"
                value={filters.to_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>College</label>
              <select
                name="college_id"
                value={filters.college_id}
                onChange={handleFilterChange}
              >
                <option value="all">All Colleges</option>
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
                disabled={filters.college_id === 'all'}
              >
                <option value="all">All Departments</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button 
                className="btn btn-primary"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {reportData.length > 0 && (
        <div className="summary-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">
                <FileText size={24} />
              </div>
              <div className="card-content">
                <h3>{reportData.length}</h3>
                <p>Total {filters.type === 'issue' ? 'Issues' : 'Returns'}</p>
              </div>
            </div>
            {filters.type === 'return' && (
              <div className="summary-card">
                <div className="card-icon fine">
                  <FileText size={24} />
                </div>
                <div className="card-content">
                  <h3>₹{reportData.reduce((sum, item) => sum + (item.fine_amount || 0), 0).toFixed(2)}</h3>
                  <p>Total Fines</p>
                </div>
              </div>
            )}
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
              <p>No transactions match the selected criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {getReportColumns().map(column => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.student_id}</td>
                    <td>{item.name}</td>
                    <td>{item.college}</td>
                    <td>{item.department}</td>
                    <td>{item.book_title}</td>
                    <td>{item.author}</td>
                    <td>{item.access_no}</td>
                    <td>{new Date(item.issue_date).toLocaleDateString()}</td>
                    <td>{new Date(item.due_date).toLocaleDateString()}</td>
                    {filters.type === 'return' ? (
                      <>
                        <td>{item.return_date !== 'N/A' ? new Date(item.return_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="amount">₹{(item.fine_amount || 0).toFixed(2)}</td>
                      </>
                    ) : (
                      <td>
                        <span className={`status ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    )}
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

export default CounterReports
