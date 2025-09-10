import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Book, Users, Monitor, RotateCcw, Building, GraduationCap, IndianRupee, AlertTriangle, UserCheck, Library, Globe, Newspaper, FileText } from 'lucide-react'
import api from '../../services/api'

const LibrarianHome = () => {
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
      color: 'indigo',
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
                <h3>{stat.value.toLocaleString()}</h3>
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
