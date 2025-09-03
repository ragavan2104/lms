import React, { useState, useEffect } from 'react'
import { Shield, Download, Filter, Calendar, Building, Users, Clock, LogIn, LogOut } from 'lucide-react'
import axios from 'axios'

const GateEntryReports = () => {
  const [reportData, setReportData] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    college_id: 'all',
    department_id: 'all',
    status: 'all' // all, in, out
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

      const response = await axios.get(`/admin/gate-logs?${params.toString()}`)
      setReportData(response.data.logs)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format) => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key])
        }
      })
      params.append('format', format)

      const response = await axios.get(`/admin/gate-logs?${params.toString()}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
      link.setAttribute('download', `Gate_Entry_Report_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to export report:', error)
      alert('Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const calculateSummary = () => {
    const totalEntries = reportData.filter(item => item.entry_time).length
    const totalExits = reportData.filter(item => item.exit_time).length
    const currentlyInside = reportData.filter(item => item.status === 'in').length
    const uniqueVisitors = new Set(reportData.map(item => item.user_id)).size

    return { totalEntries, totalExits, currentlyInside, uniqueVisitors }
  }

  const summary = calculateSummary()

  return (
    <div className="gate-entry-reports">
      <div className="page-header">
        <div>
          <h1>Gate Entry Reports</h1>
          <p>Monitor library entry and exit activities</p>
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
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">All Activities</option>
                <option value="in">Entry Only</option>
                <option value="out">Exit Only</option>
              </select>
            </div>
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

      {/* Summary Cards */}
      {reportData.length > 0 && (
        <div className="summary-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon entry">
                <LogIn size={24} />
              </div>
              <div className="card-content">
                <h3>{summary.totalEntries}</h3>
                <p>Total Entries</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon exit">
                <LogOut size={24} />
              </div>
              <div className="card-content">
                <h3>{summary.totalExits}</h3>
                <p>Total Exits</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon inside">
                <Users size={24} />
              </div>
              <div className="card-content">
                <h3>{summary.currentlyInside}</h3>
                <p>Currently Inside</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon visitors">
                <Shield size={24} />
              </div>
              <div className="card-content">
                <h3>{summary.uniqueVisitors}</h3>
                <p>Unique Visitors</p>
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
              <Shield size={48} />
              <h3>No Data Found</h3>
              <p>No gate entry activities match the selected criteria.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>College</th>
                  <th>Department</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.user_id}</td>
                    <td>{item.user_name}</td>
                    <td>{item.college || 'N/A'}</td>
                    <td>{item.department || 'N/A'}</td>
                    <td>
                      {item.entry_time ? (
                        <div className="time-cell">
                          <Clock size={14} />
                          {new Date(item.entry_time).toLocaleTimeString()}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {item.exit_time ? (
                        <div className="time-cell">
                          <Clock size={14} />
                          {new Date(item.exit_time).toLocaleTimeString()}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <span className={`status ${item.status}`}>
                        {item.status === 'in' ? 'Inside' : 'Exited'}
                      </span>
                    </td>
                    <td>{new Date(item.created_date).toLocaleDateString()}</td>
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

export default GateEntryReports
