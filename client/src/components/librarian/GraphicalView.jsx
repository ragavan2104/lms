import React, { useState, useEffect } from 'react'
import { PieChart, BarChart3, TrendingUp, Users, Book, RotateCcw, Clock, DollarSign, RefreshCw, Filter, Calendar } from 'lucide-react'
import api from '../../services/api'

const GraphicalView = () => {
  const [data, setData] = useState({
    statistics: {
      totalBooks: 0,
      totalIssued: 0,
      totalOverdue: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalFinesCollected: 0,
      totalFinesPending: 0,
      returnRate: 0,
      fineCollectionRate: 0
    },
    userTypeDistribution: [],
    categoryDistribution: [],
    monthlyCirculation: [],
    hasData: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    reportType: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

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

      const response = await api.get(`/librarian/analytics/dashboard?${params}`)

      if (response.data) {
        setData(response.data)
        setError('')
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      if (error.response?.status === 403) {
        setError('Access denied. Librarian permissions required.')
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
      reportType: '',
      startDate: '',
      endDate: ''
    })
  }

  // Simple Pie Chart Component
  const PieChartComponent = ({ data, title, colors }) => {
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
                  stroke={colors[index % colors.length]}
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
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span>{item.label}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Simple Bar Chart Component
  const BarChartComponent = ({ data, title, color = '#3b82f6' }) => {
    const maxValue = Math.max(...data.map(item => item.value))

    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div 
                className="bar"
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              >
                <span className="bar-value">{item.value}</span>
              </div>
              <span className="bar-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="graphical-view">
        <div className="page-header">
          <h1>Graphical View</h1>
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
          <h1>Graphical View</h1>
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

  return (
    <div className="graphical-view">
      <div className="page-header">
        <div className="header-content">
          <h1>Graphical View</h1>
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
          <button onClick={refreshData} className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => handleFilterChange('reportType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Reports</option>
                <option value="issue_book">Issue Book</option>
                <option value="return_book">Return Book</option>
                <option value="fine">Fine Collection</option>
                <option value="reservation">Reservations</option>
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
            <h3>₹{data.statistics.totalFinesCollected + data.statistics.totalFinesPending}</h3>
            <p>Total Fines</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {data.hasData ? (
        <div className="charts-grid">
          {/* Book Distribution Pie Chart */}
          <div className="chart-card">
            <PieChartComponent 
              data={bookDistributionData}
              title="Book Distribution"
              colors={pieColors}
            />
          </div>

          {/* User Distribution Pie Chart */}
          <div className="chart-card">
            <PieChartComponent 
              data={userDistributionData}
              title="User Distribution"
              colors={['#3b82f6', '#10b981']}
            />
          </div>

          {/* Fine Distribution Pie Chart */}
          <div className="chart-card">
            <PieChartComponent 
              data={fineDistributionData}
              title="Fine Distribution"
              colors={['#10b981', '#ef4444']}
            />
          </div>

          {/* Monthly Circulation Bar Chart */}
          <div className="chart-card wide">
            <BarChartComponent 
              data={data.monthlyCirculation}
              title="Monthly Circulation"
              color="#3b82f6"
            />
          </div>

          {/* Category Distribution Bar Chart */}
          <div className="chart-card wide">
            <BarChartComponent 
              data={data.categoryDistribution}
              title="Books by Category"
              color="#10b981"
            />
          </div>
        </div>
      ) : (
        <div className="no-data-message">
          <div className="no-data-card">
            <div className="no-data-icon">
              <BarChart3 size={48} />
            </div>
            <h3>No Data to Display</h3>
            <p>Please select a report type and date range to view analytics charts.</p>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {data.hasData && (
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
  )
}

export default GraphicalView
