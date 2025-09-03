import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Book, Users, Monitor, RotateCcw, Building, GraduationCap, IndianRupee, AlertTriangle, UserCheck } from 'lucide-react'
import api from '../../services/api'

const LibrarianHome = () => {
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
      console.log('Librarian fetching dashboard stats...')
      const response = await api.get('/admin/dashboard-stats')
      console.log('Librarian dashboard stats response:', response.data)
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
      description: 'Books in collection'
    },
    {
      title: 'Total E-books',
      value: stats.totalEbooks,
      icon: Monitor,
      color: 'purple',
      description: 'Digital books available'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'green',
      description: 'Registered students'
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
    },
    {
      title: 'Total Colleges',
      value: stats.totalColleges,
      icon: Building,   
      color: 'orange',
      description: 'Registered colleges'
    }
  ]

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="librarian-home">
      <div className="page-header">
        <h1 className="text-whi">Librarian Dashboard</h1>
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
                <h3>{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                <span className="stat-description">{stat.description}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card" onClick={() => navigate('/librarian/issue-book')}>
            <RotateCcw size={32} />
            <h3>Issue Book</h3>
            <p>Issue books to students</p>
          </div>
          <div className="action-card" onClick={() => navigate('/librarian/return-book')}>
            <Book size={32} />
            <h3>Return Book</h3>
            <p>Process book returns</p>
          </div>
          <div className="action-card" onClick={() => navigate('/librarian/fine-management')}>
            <IndianRupee size={32} />
            <h3>Manage Fines</h3>
            <p>Handle fine payments</p>
          </div>
          <div className="action-card" onClick={() => navigate('/librarian/students')}>
            <Users size={32} />
            <h3>Manage Students</h3>
            <p>View student information</p>
          </div>
          <div className="action-card" onClick={() => navigate('/librarian/gate-entry')}>
            <UserCheck size={32} />
            <h3>Gate Entry</h3>
            <p>Manage library gate entry</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LibrarianHome
