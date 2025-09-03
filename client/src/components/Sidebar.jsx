import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Users,
  Settings,
  RotateCcw,
  Book,
  Monitor,
  GraduationCap,
  Building,
  Newspaper,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  DollarSign,
  CreditCard,
  Clock,
  Settings as SettingsIcon,
  Shield,
  FileText,
  BarChart3,
  TrendingUp,
  Home,
  Database,
  PieChart,
  GraduationCap as ThesisIcon
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = ({ userRole }) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState({
    management: false,
    circulation: false,
    reports: false
  })

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }))
  }

  const isActive = (path) => {
    return location.pathname.includes(path)
  }

  const isDashboardActive = () => {
    // Dashboard is active when on the root path of the user role
    return location.pathname === `/${userRole}` || location.pathname === `/${userRole}/`
  }

  const baseUrl = `/${userRole}`

  const getMenuItems = () => {
    
    const managementItems = [
      { path: `${baseUrl}/books`, label: 'Manage Books', icon: Book },
      { path: `${baseUrl}/ebooks`, label: 'Manage E-books', icon: Monitor },
    ]

    if (userRole === 'admin') {
      managementItems.push(
        { path: `${baseUrl}/students`, label: 'Manage Students', icon: GraduationCap },
        { path: `${baseUrl}/librarians`, label: 'Manage Librarians', icon: Users },
        { path: `${baseUrl}/colleges`, label: 'Manage Colleges', icon: Building },
        { path: `${baseUrl}/departments`, label: 'Manage Departments', icon: Settings },
        { path: `${baseUrl}/thesis`, label: 'Manage Thesis', icon: ThesisIcon },
        { path: `${baseUrl}/question-banks`, label: 'Question Banks', icon: FileText },
        { path: `${baseUrl}/news`, label: 'News Clippings', icon: Newspaper },
        { path: `${baseUrl}/gate-entry`, label: 'Gate Entry', icon: Shield },
        { path: '/gate', label: 'Gate Entry Dashboard', icon: Shield, external: true }
      )
    } else if (userRole === 'librarian') {
      managementItems.push(
        { path: `${baseUrl}/students`, label: 'Manage Students', icon: GraduationCap },
        { path: `${baseUrl}/colleges`, label: 'Manage Colleges', icon: Building },
        { path: `${baseUrl}/departments`, label: 'Manage Departments', icon: Settings },
        { path: `${baseUrl}/thesis`, label: 'Manage Thesis', icon: ThesisIcon },
        { path: `${baseUrl}/question-banks`, label: 'Question Banks', icon: FileText },
        { path: `${baseUrl}/news-clippings`, label: 'News Clippings', icon: Newspaper },
        { path: `${baseUrl}/gate-entry`, label: 'Gate Entry', icon: Shield },
        { path: '/gate', label: 'Gate Entry Dashboard', icon: Shield, external: true }
      )
    }

    const circulationItems = [
      { path: `${baseUrl}/issue-book`, label: 'Issue Book', icon: BookOpen },
      { path: `${baseUrl}/return-book`, label: 'Return Book', icon: RotateCcw },
      { path: `${baseUrl}/circulation-history`, label: 'Circulation History', icon: Settings },
      { path: `${baseUrl}/reservations`, label: 'Reservation Management', icon: Clock },
      { path: `${baseUrl}/fine-management`, label: 'Fine Management', icon: DollarSign },
      { path: `${baseUrl}/payment-management`, label: 'Payment Management', icon: CreditCard }
    ]

    // Reports items
    const reportItems = [
      { path: `${baseUrl}/fine-reports`, label: 'Fine Reports', icon: FileText },
      { path: `${baseUrl}/counter-reports`, label: 'Counter Reports', icon: BarChart3 },
      { path: `${baseUrl}/gate-entry-reports`, label: 'Gate Entry Reports', icon: Shield },
      { path: `${baseUrl}/pending-returns`, label: 'Pending Book Returns', icon: RotateCcw },
      { path: `${baseUrl}/transaction-statistics`, label: 'Transaction Statistics', icon: TrendingUp },
      { path: `${baseUrl}/frequently-accessed-resources`, label: 'Frequently Accessed Resources', icon: BookOpen },
      { path: `${baseUrl}/library-collection`, label: 'Library Collection', icon: Book }
    ]

    return { managementItems, circulationItems, reportItems }
  }

  const { managementItems, circulationItems, reportItems } = getMenuItems()

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <BookOpen size={32} className="sidebar-logo" />
        <h2>Library System</h2>
        <div className="user-info">
          <User size={16} />
          <span>{user?.name}</span>
          <small>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard Section - First item */}
        <div className="nav-section">
          <Link
            to={userRole === 'admin' ? '/admin' : '/librarian'}
            className={`nav-link dashboard-link ${isDashboardActive() ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="nav-section">
          <button
            className={`nav-toggle ${expandedMenus.management ? 'expanded' : ''}`}
            onClick={() => toggleMenu('management')}
          >
            <Settings size={20} />
            <span>Management</span>
            {expandedMenus.management ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {expandedMenus.management && (
            <div className="nav-submenu">
              {managementItems.map((item) => {
                const Icon = item.icon
                if (item.external) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      className="nav-link"
                      target="_self"
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </a>
                  )
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="nav-section">
          <button 
            className={`nav-toggle ${expandedMenus.circulation ? 'expanded' : ''}`}
            onClick={() => toggleMenu('circulation')}
          >
            <RotateCcw size={20} />
            <span>Circulation</span>
            {expandedMenus.circulation ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {expandedMenus.circulation && (
            <div className="nav-submenu">
              {circulationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Analytics Section - Admin and Librarian */}
        {(userRole === 'admin' || userRole === 'librarian') && (
          <div className="nav-section">
            <Link
              to={`/${userRole}/graphical-view`}
              className={`nav-link ${location.pathname.includes('/graphical-view') ? 'active' : ''}`}
            >
              <PieChart size={18} />
              <span>Graphical View</span>
            </Link>
          </div>
        )}

        {/* Reports Section */}
        <div className="nav-section">
          <button
            className={`nav-toggle ${expandedMenus.reports ? 'expanded' : ''}`}
            onClick={() => toggleMenu('reports')}
          >
            <BarChart3 size={20} />
            <span>Reports</span>
            {expandedMenus.reports ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedMenus.reports && (
            <div className="nav-submenu">
              {reportItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Backup Section - Admin Only */}
        {userRole === 'admin' && (
          <div className="nav-section">
            <Link
              to={`${baseUrl}/backup`}
              className={`nav-link ${isActive(`${baseUrl}/backup`) ? 'active' : ''}`}
            >
              <Database size={18} />
              <span>Database Backup</span>
            </Link>
          </div>
        )}

        {/* Settings Section - Admin Only */}
        {userRole === 'admin' && (
          <div className="nav-section">
            <Link
              to={`${baseUrl}/settings`}
              className={`nav-link ${isActive(`${baseUrl}/settings`) ? 'active' : ''}`}
            >
              <SettingsIcon size={18} />
              <span>Settings</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar;
