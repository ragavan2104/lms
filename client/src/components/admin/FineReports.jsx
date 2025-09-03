import React, { useState, useEffect } from 'react'
import { FileText, Download, Filter, Calendar, Building, Users, DollarSign, IndianRupee } from 'lucide-react'
import axios from 'axios'

const FineReports = () => {
  const [reportData, setReportData] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [filters, setFilters] = useState({
    status: 'all',
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

      const response = await axios.get(`/admin/reports/fines?${params.toString()}`)
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

      console.log('Exporting report with params:', params.toString())

      const response = await axios.get(`/admin/reports/fines?${params.toString()}`, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
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
      const filename = `Fine_Report_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      link.setAttribute('download', filename)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('Report exported successfully:', filename)

    } catch (error) {
      console.error('Failed to export report:', error)

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

  const calculateTotals = () => {
    const totalFines = reportData.reduce((sum, item) => sum + item.fine_amount, 0)
    const paidFines = reportData.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.fine_amount, 0)
    const unpaidFines = reportData.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.fine_amount, 0)

    return { totalFines, paidFines, unpaidFines }
  }

  const totals = calculateTotals()

  return (
    <div className="fine-reports">
      <div className="page-header">
        <div>
          <h1>Fine Reports</h1>
          <p>Generate and export comprehensive fine reports</p>
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
      <div className="filters-section ">
        <div className="filters-card">
          <div className="filters-header">
            <Filter size={20} />
            <h3>Report Filters</h3>
          </div>
          <div className="filters-grid text-">
            <div className="filter-group">
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="text-black"
              >
                <option value="all">All Fines</option>
                <option value="paid">Paid Only</option>
                <option value="unpaid">Unpaid Only</option>
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
              <div className="card-icon total">
                <IndianRupee size={24} />
              </div>
              <div className="card-content">
                <h3>₹{totals.totalFines.toFixed(2)}</h3>
                <p>Total Fines</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon paid">
                <IndianRupee size={24} />
              </div>
              <div className="card-content">
                <h3>₹{totals.paidFines.toFixed(2)}</h3>
                <p>Paid Fines</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon unpaid">
                <IndianRupee size={24} />
              </div>
              <div className="card-content">
                <h3>₹{totals.unpaidFines.toFixed(2)}</h3>
                <p>Unpaid Fines</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon count">
                <FileText size={24} />
              </div>
              <div className="card-content">
                <h3>{reportData.length}</h3>
                <p>Total Records</p>
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
              <p>No fines match the selected criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>College</th>
                  <th>Department</th>
                  <th>Fine Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.student_id}</td>
                    <td>{item.name}</td>
                    <td>{item.college}</td>
                    <td>{item.department}</td>
                    <td className="amount">₹{item.fine_amount.toFixed(2)}</td>
                    <td className="reason">{item.reason}</td>
                    <td>
                      <span className={`status ${item.status}`}>
                        {item.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>{item.paid_date !== 'N/A' ? new Date(item.paid_date).toLocaleDateString() : 'N/A'}</td>
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

export default FineReports
