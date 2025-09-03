import React, { useState, useEffect } from 'react'
import { PieChart, BarChart3, TrendingUp, Users, Book, RotateCcw, Clock, DollarSign, RefreshCw, Filter, Calendar, Download } from 'lucide-react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

const GraphicalView = () => {
  const location = useLocation()
  // Determine user role from the current path
  const userRole = location.pathname.includes('/admin') ? 'admin' : 'librarian'
  
  const [data, setData] = useState({
    statistics: {
      totalBooks: 0,
      totalEbooks: 0,
      totalUsers: 0,
      totalIssued: 0,
      totalReturned: 0,
      totalOverdue: 0,
      totalFines: 0,
      fineRecords: 0
    },
    categoryDistribution: [],
    monthlyCirculation: [],
    userTypeDistribution: [],
    popularBooks: [],
    collegeStats: [],
    departmentStats: [],
    hasData: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    reportType: 'overview',
    startDate: '',
    endDate: '',
    collegeId: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [colleges, setColleges] = useState([])

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  // Load colleges for filter dropdown
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const endpoint = `http://localhost:5000/api/${userRole}/colleges`
        const resp = await axios.get(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setColleges(resp.data?.colleges || [])
      } catch (e) {
        console.error('Failed to load colleges', e)
        setColleges([])
      }
    }
    fetchColleges()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Please login to view analytics')
        return
      }

      const params = new URLSearchParams()

      if (filters.reportType) {
        params.append('reportType', filters.reportType)
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate)
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate)
      }
      if (filters.collegeId) {
        params.append('collegeId', filters.collegeId)
      }

      const endpoint = `http://localhost:5000/api/${userRole}/analytics/dashboard?${params}`
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data) {
        setData(response.data)
        setError('')
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.')
        localStorage.removeItem('token')
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin permissions required.')
      } else {
        setError('Failed to load analytics data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchAnalyticsData()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      reportType: 'overview',
      startDate: '',
      endDate: '',
      collegeId: ''
    })
  }

  const downloadReport = async (format = 'excel') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to download reports')
        return
      }

      const params = new URLSearchParams()
      if (filters.reportType) params.append('reportType', filters.reportType)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.collegeId) params.append('collegeId', filters.collegeId)
      params.append('format', format)

      const downloadEndpoint = `http://localhost:5000/api/${userRole}/analytics/dashboard/download?${params}`
      
      console.log(`Downloading ${format} report from:`, downloadEndpoint)
      
      const response = await axios.get(downloadEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob'
      })

      console.log('Response received:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataSize: response.data.size
      })

      // Check if the response is actually a PDF for PDF format
      if (format === 'pdf') {
        const blob = response.data
        const text = await blob.slice(0, 100).text()
        console.log('PDF blob content check:', text.substring(0, 50))
        
        if (!text.startsWith('%PDF')) {
          console.error('Response is not a valid PDF, got:', text)
          setError('Server returned invalid PDF. Please check your login status and try again.')
          return
        }
      }

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      // Generate filename with current date and format
      const currentDate = new Date().toISOString().split('T')[0]
      const fileExtension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'html'
      link.setAttribute('download', `analytics-report-${currentDate}.${fileExtension}`)

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      console.log(`Successfully downloaded ${format} report`)
    } catch (error) {
      console.error('Error downloading report:', error)
      if (error.response && error.response.status === 401) {
        setError('Session expired. Please login again.')
      } else {
        setError(`Failed to download ${format.toUpperCase()} report. Please try again.`)
      }
    }
  }

  // Enhanced Pie Chart Component
  const PieChartComponent = ({ data, title, colors, useDepartmentColors = false }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercentage = 0

    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="pie-chart-wrapper">
          <svg viewBox="0 0 200 200" className="pie-chart">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const strokeDashoffset = -cumulativePercentage
              cumulativePercentage += percentage

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="transparent"
                  stroke={useDepartmentColors ? getDepartmentColor(item.label, index) : colors[index % colors.length]}
                  strokeWidth="40"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 100 100)"
                />
              )
            })}
          </svg>
          <div className="pie-chart-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: useDepartmentColors ? getDepartmentColor(item.label, index) : colors[index % colors.length] }}
                ></div>
                <span>{item.label}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Bar Chart Component
  const BarChartComponent = ({ data, title, color = '#3b82f6', useMultipleColors = false }) => {
    if (!data || data.length === 0) {
      return (
        <div className="chart-container">
          <h3>{title}</h3>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No data available</p>
          </div>
        </div>
      )
    }

    const maxValue = Math.max(...data.map(item => item.value), 1) // Ensure minimum of 1
    const minBarHeight = 8 // Minimum height in pixels for visibility

    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="relative bg-white border rounded-lg p-4">
          {/* Chart area with gridlines */}
          <div className="relative h-80 flex items-end justify-between gap-2 border-l border-b border-gray-200">
            {/* Y-axis gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <div key={i} className="w-full border-t border-gray-100 relative">
                  <span className="absolute -left-12 -top-2 text-xs text-gray-500">
                    {Math.round(maxValue * (1 - ratio))}
                  </span>
                </div>
              ))}
            </div>

            {/* Bars */}
            {data.map((item, index) => {
              const heightPercentage = (item.value / maxValue) * 100
              const barHeight = Math.max(heightPercentage, (minBarHeight / 320) * 100) // Ensure minimum visibility

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group relative"
                  style={{ maxWidth: `${Math.min(100 / data.length, 8)}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    {item.label}: {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </div>

                  {/* Value label on top of bar */}
                  <div className="mb-1 text-xs font-medium text-gray-700 text-center">
                    {typeof item.value === 'number' && item.value > 999
                      ? (item.value / 1000).toFixed(1) + 'k'
                      : item.value
                    }
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: useMultipleColors ? getDepartmentColor(item.label, index) : color,
                      minHeight: `${minBarHeight}px`
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-3 px-1">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex-1 text-center"
                style={{ maxWidth: `${Math.min(100 / data.length, 8)}%` }}
              >
                <span className="text-xs text-gray-600 break-words leading-tight">
                  {item.label.length > 10 ? item.label.substring(0, 8) + '...' : item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="graphical-view">
        <div className="page-header">
          <h1>{userRole === 'admin' ? 'Admin' : 'Librarian'} Graphical View</h1>
          <p>Loading analytics dashboard...</p>
        </div>
        <div className="loading-container">
          <RefreshCw className="loading-spinner" size={32} />
          <span>Loading charts and statistics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="graphical-view">
        <div className="page-header">
          <h1>{userRole === 'admin' ? 'Admin' : 'Librarian'} Graphical View</h1>
          <p>Library Analytics Dashboard</p>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={refreshData} className="btn btn-primary">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const bookDistributionData = [
    { label: 'Available', value: data.statistics.totalBooks - data.statistics.totalIssued },
    { label: 'Issued', value: data.statistics.totalIssued },
    { label: 'Overdue', value: data.statistics.totalOverdue }
  ]

  const userDistributionData = data.userTypeDistribution || []

  const fineDistributionData = [
    { label: 'Collected', value: data.statistics.totalFinesCollected || 0 },
    { label: 'Pending', value: data.statistics.totalFinesPending || 0 }
  ]

  const categoryDistributionData = data.categoryDistribution || []

  const pieColors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6']

  // Extended color palette for departments (accessible and distinct colors)
  const departmentColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#ef4444', // Red
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange-red
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#eab308', // Yellow
    '#dc2626', // Red-600
    '#7c3aed', // Violet
    '#059669'  // Green-600
  ]

  // Function to get consistent color for department
  const getDepartmentColor = (departmentName, index) => {
    // Create a simple hash of the department name for consistency
    let hash = 0
    for (let i = 0; i < departmentName.length; i++) {
      hash = departmentName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = Math.abs(hash) % departmentColors.length
    return departmentColors[colorIndex]
  }

  return (
    <>
    <div className="graphical-view">
      <div className="page-header">
        <div className="header-content">
          <h1>{userRole === 'admin' ? 'Admin' : 'Librarian'} Graphical View</h1>
          <p>Library Analytics Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </button>
          
          {/* Download Dropdown */}
          <div className="relative group">
            <button
              className="btn btn-success flex items-center gap-2"
              disabled={loading}
            >
              <Download size={16} />
              Download Report
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => downloadReport('excel')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                  disabled={loading}
                >
                  <Download size={14} />
                  Download as Excel (.xlsx)
                </button>
                
                <button
                  onClick={() => downloadReport('pdf')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                  disabled={loading}
                >
                  <Download size={14} />
                  Download as pdf
                </button>
              </div>
            </div>
          </div>
          
          <button onClick={refreshData} className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => handleFilterChange('reportType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Report Type</option>
                <option value="overview">Overview</option>
                <option value="issue_book">Issue Book</option>
                <option value="return_book">Return Book</option>
                <option value="fine">Fine Collection</option>
                <option value="reservation">Reservations</option>
                <option value="pending_books">Pending Books</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">College</label>
              <select
                value={filters.collegeId}
                onChange={(e) => handleFilterChange('collegeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Colleges</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon book">
            <Book size={24} />
          </div>
          <div className="stat-info">
            <h3>{data.statistics.totalBooks}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{data.statistics.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon circulation">
            <RotateCcw size={24} />
          </div>
          <div className="stat-info">
            <h3>{data.statistics.totalIssued}</h3>
            <p>Books Issued</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon fines">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{data.statistics.totalFines}</h3>
            <p>Total Fines</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {(data.hasData || filters.reportType === 'overview') ? (
        <div className="charts-grid">
          {/* Pending books charts when college selected */}
          {filters.reportType === 'pending_books' && filters.collegeId && (
            <>
              <div className="chart-card wide">
                <BarChartComponent
                  data={(data.pendingByDepartment || []).map(d => ({ label: d.department, value: d.count }))}
                  title="Pending Books by Department"
                  color="#6366f1"
                />
              </div>
              <div className="chart-card">
                <PieChartComponent
                  data={(data.pendingByDepartment || []).map(d => ({ label: d.department, value: d.count }))}
                  title="Pending Books Distribution"
                  colors={pieColors}
                />
              </div>
            </>
          )}

          {/* Report specific charts */}
          <div className="chart-card wide">
            {(!data.reportBar || data.reportBar.length === 0) ? (
              <div className="no-data-message"><p>No data available for bar chart</p></div>
            ) : (
              <BarChartComponent
                data={data.reportBar}
                title={filters.collegeId ?
                  `${data.selectedCollege?.name || 'Selected College'} - ${filters.reportType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Report'} by Department` :
                  (data.reportTitle || 'Report') + ' - Overview'
                }
                color="#3b82f6"
                useMultipleColors={!!filters.collegeId}
              />
            )}
          </div>

          <div className="chart-card">
            {(!data.reportPie || data.reportPie.length === 0) ? (
              <div className="no-data-message"><p>No data available for pie chart</p></div>
            ) : (
              <PieChartComponent
                data={data.reportPie}
                title={filters.collegeId ?
                  `${data.selectedCollege?.name || 'Selected College'} - Department Distribution` :
                  (data.reportTitle || 'Report') + ' - Distribution'
                }
                colors={pieColors}
                useDepartmentColors={!!filters.collegeId}
              />
            )}
          </div>

          {/* Department Color Legend when college is selected */}
          {filters.collegeId && data.reportBar && data.reportBar.length > 0 && (
            <div className="chart-card">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Department Legend</h3>
                <div className="grid grid-cols-2 gap-2">
                  {data.reportBar.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getDepartmentColor(item.label, index) }}
                      ></div>
                      <span className="text-sm text-gray-700 truncate" title={item.label}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data-message">
          <div className="no-data-card">
            <div className="no-data-icon">
              <BarChart3 size={48} />
            </div>
            <h3>No Data to Display</h3>
            <p>Please select "Overview" or another report type to view analytics charts.</p>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {(data.hasData || filters.reportType === 'overview') && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <TrendingUp size={20} />
              <h3>Return Rate</h3>
            </div>
            <div className="metric-value">
              {data.statistics.returnRate || 0}%
            </div>
            <div className="metric-description">
              Books returned on time
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Clock size={20} />
              <h3>Active Users</h3>
            </div>
            <div className="metric-value">
              {data.statistics.activeUsers || 0}
            </div>
            <div className="metric-description">
              Users with current borrowings
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <DollarSign size={20} />
              <h3>Fine Collection Rate</h3>
            </div>
            <div className="metric-value">
              {data.statistics.fineCollectionRate || 0}%
            </div>
            <div className="metric-description">
              Fines collected vs total
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default GraphicalView
