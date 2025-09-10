import React, { useState, useEffect } from 'react'
import { Book, Users, Monitor, RotateCcw, Building, GraduationCap, IndianRupee, AlertTriangle, Plus, FileText, BookOpen, BarChart3, Shield, Library, Globe, Newspaper } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const AdminHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalBookTitles: 0,
    totalBookVolumes: 0,
    totalEbooks: 0,
    totalEjournals: 0,
    totalJournals: 0,
    totalNationalJournals: 0,
    totalInternationalJournals: 0,
    totalThesis: 0
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
        totalBookTitles: 0,
        totalBookVolumes: 0,
        totalEbooks: 0,
        totalEjournals: 0,
        totalJournals: 0,
        totalNationalJournals: 0,
        totalInternationalJournals: 0,
        totalThesis: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Book Titles',
      value: stats.totalBookTitles,
      icon: Book,
      color: 'blue',
      description: 'Total number of titles in collection'
    },
    {
      title: 'Book Volumes',
      value: stats.totalBookVolumes,
      icon: Library,
      color: 'teal',
      description: 'Total number of volumes in collection'
    },
    {
      title: 'E-Books',
      value: stats.totalEbooks,
      icon: Monitor,
      color: 'green',
      description: 'Total number of e-books'
    },
    {
      title: 'E-Journals',
      value: stats.totalEjournals,
      icon: Globe,
      color: 'teal',
      description: 'Total number of e-journals'
    },
    {
      title: 'Total Journals',
      value: stats.totalJournals,
      icon: Newspaper,
      color: 'purple',
      description: 'Overall journal count'
    },
    {
      title: 'National Journals',
      value: stats.totalNationalJournals,
      icon: Newspaper,
      color: 'orange',
      description: 'Total number of national journals'
    },
    {
      title: 'International Journals',
      value: stats.totalInternationalJournals,
      icon: Newspaper,
      color: 'red',
      description: 'Total number of international journals'
    },
    {
      title: 'Thesis Documents',
      value: stats.totalThesis,
      icon: FileText,
      color: 'yellow',
      description: 'Total number of thesis documents'
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
