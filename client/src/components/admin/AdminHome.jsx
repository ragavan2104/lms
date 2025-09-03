import React, { useState, useEffect } from 'react'
import { Book, Users, Monitor, RotateCcw, Building, GraduationCap, IndianRupee, AlertTriangle, Plus, FileText, BookOpen, BarChart3, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const AdminHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalEbooks: 0,
    totalStudents: 0,
    totalLibrarians: 0,
    totalColleges: 0,
    activeCirculations: 0,
    availableBooks: 0,
    totalFines: 0,
    overdueBooks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log('Fetching dashboard stats...')
      const response = await api.get('/admin/dashboard-stats')
      console.log('Dashboard stats response:', response.data)
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      // Fallback to default values if API fails
      setStats({
        totalBooks: 0,
        totalEbooks: 0,
        totalStudents: 0,
        totalLibrarians: 0,
        totalColleges: 0,
        activeCirculations: 0,
        availableBooks: 0,
        totalFines: 0,
        overdueBooks: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: Book,
      color: 'blue',
      description: 'Physical books in library'
    },
    {
      title: 'Total E-books',
      value: stats.totalEbooks,
      icon: Monitor,
      color: 'green',
      description: 'Digital books available'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'purple',
      description: 'Registered students'
    },
    {
      title: 'Total Librarians',
      value: stats.totalLibrarians,
      icon: Users,
      color: 'orange',
      description: 'Active librarians'
    },
    {
      title: 'Total Colleges',
      value: stats.totalColleges,
      icon: Building,
      color: 'red',
      description: 'Registered colleges'
    },
    {
      title: 'Active Circulations',
      value: stats.activeCirculations,
      icon: RotateCcw,
      color: 'teal',
      description: 'Books currently issued'
    },
    {
      title: 'Available Books',
      value: stats.availableBooks,
      icon: Book,
      color: 'green',
      description: 'Books available for borrowing'
    },
    {
      title: 'Pending Fines',
      value: `₹${stats.totalFines.toFixed(2)}`,
      icon: IndianRupee,
      color: 'yellow',
      description: 'Total unpaid fines'
    },
    {
      title: 'Overdue Books',
      value: stats.overdueBooks,
      icon: AlertTriangle,
      color: 'red',
      description: 'Books past due date'
    }
  ]

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="admin-home">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the Library Management System</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{stat.value.toLocaleString()}</h3>
                <p className="stat-title">{stat.title}</p>
                <small className="stat-description">{stat.description}</small>
              </div>
            </div>
          )
        })}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <div className="action-card">
            <div className="action-icon">
              <Plus size={24} />
            </div>
            <h3>Add New Student</h3>
            <p>Register a new student in the system and manage their library access</p>
            <button
              className="btn btn-primary action-button"
              onClick={() => navigate('/admin/students')}
            >
              Add Student
            </button>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <BookOpen size={24} />
            </div>
            <h3>Add New Book</h3>
            <p>Add a new book to the library collection with complete metadata</p>
            <button
              className="btn btn-primary action-button"
              onClick={() => navigate('/admin/books')}
            >
              Add Book
            </button>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <RotateCcw size={24} />
            </div>
            <h3>Issue Book</h3>
            <p>Issue a book to a student and manage circulation records</p>
            <button
              className="btn btn-primary action-button"
              onClick={() => navigate('/admin/issue-book')}
            >
              Issue Book
            </button>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <BarChart3 size={24} />
            </div>
            <h3>View Reports</h3>
            <p>Generate and view comprehensive system reports and analytics</p>
            <button
              className="btn btn-primary action-button"
              onClick={() => navigate('/admin/fine-reports')}
            >
              View Reports
            </button>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <Shield size={24} />
            </div>
            <h3>Gate Entry</h3>
            <p>Manage library gate entry records and visitor tracking</p>
            <button
              className="btn btn-primary action-button"
              onClick={() => navigate('/admin/gate-entry')}
            >
              Gate Entry
            </button>
          </div>
        </div>
      </div>
{/* 
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <Book size={16} />
            </div>
            <div className="activity-content">
              <p><strong>New book added:</strong> "Introduction to Computer Science"</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Users size={16} />
            </div>
            <div className="activity-content">
              <p><strong>New student registered:</strong> John Doe (CS2024001)</p>
              <small>4 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <RotateCcw size={16} />
            </div>
            <div className="activity-content">
              <p><strong>Book returned:</strong> "Data Structures and Algorithms"</p>
              <small>6 hours ago</small>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default AdminHome
