import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Calendar, Clock, DollarSign, User,
  Filter, Eye, RotateCcw, AlertCircle,
  CheckCircle, XCircle, Plus, Minus, Star,
  RefreshCw, Bell, Settings, LogOut,
  Monitor, FileText, Newspaper, IndianRupee, HelpCircle
} from 'lucide-react'
import axios from 'axios'
import { OverviewTab, CurrentBooksTab } from './DashboardTabs'
import ReservationModal from './ReservationModal'
import { getBaseUrl } from '../../utils/apiConfig'



const NewStudentDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [reservationLoading, setReservationLoading] = useState(false)
  const [reservationDate, setReservationDate] = useState('')


  useEffect(() => {
    fetchDashboardData()
  }, [])



  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/student/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      showNotification('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const handleReserveBook = (book) => {
    setSelectedBook(book)
    setReservationDate('')
    setShowReservationModal(true)
  }

  const confirmReservation = async (reservationData) => {
    try {
      setReservationLoading(true)
      const token = localStorage.getItem('token')
      await axios.post(`http://localhost:5000/api/student/books/${selectedBook.id}/reserve`, reservationData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      showNotification('Book reserved successfully!', 'success')
      setShowReservationModal(false)
      setSelectedBook(null)
      fetchDashboardData()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to reserve book'
      showNotification(message, 'error')
    } finally {
      setReservationLoading(false)
    }
  }

  // Book Details Modal handlers
  const handleBookClick = (bookId) => {
    setSelectedBookId(bookId)
    setIsBookDetailsOpen(true)
  }

  const handleCloseBookDetails = () => {
    setSelectedBookId(null)
    setIsBookDetailsOpen(false)
  }

  const handleRenewBook = async (circulationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`http://localhost:5000/api/student/circulations/${circulationId}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      showNotification('Book renewed successfully!', 'success')
      fetchDashboardData()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to renew book'
      showNotification(message, 'error')
    }
  }

  const handleCancelReservation = async (reservationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/student/reservations/${reservationId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      showNotification('Reservation cancelled successfully!', 'success')
      fetchDashboardData()
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to cancel reservation'
      showNotification(message, 'error')
    }
  }



  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'due-soon': return 'text-yellow-600 bg-yellow-100'
      case 'paid': return 'text-green-600 bg-green-100'
      case 'unpaid': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProfilePictureUrl = (path) => {
    if (!path) return null
    return `${getBaseUrl()}/uploads/${path}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {dashboardData?.user?.name || 'Student'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh Dashboard"
              >
                <RefreshCw size={20} />
              </button>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                {dashboardData?.user?.profile_picture && (
                  <img
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    src={getProfilePictureUrl(dashboardData.user.profile_picture)}
                    alt="Profile"
                  />
                )}
                <span>{dashboardData?.user?.user_id}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-500 text-white hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books Borrowed</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.books_borrowed || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books Reserved</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.books_reserved || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books Read</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.total_books_read || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <IndianRupee className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fines</p>
                <p className="text-2xl font-bold text-gray-900">₹{dashboardData?.stats?.total_fines || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex overflow-x-auto scrollbar-hide gap-3" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BookOpen },
              { id: 'current-books', name: 'Current Books', icon: BookOpen },
              { id: 'reservations', name: 'Reservations', icon: Clock },
              { id: 'history', name: 'Borrowing History', icon: Calendar },
              { id: 'fines', name: 'Fines & Payments', icon: DollarSign },
              { id: 'profile', name: 'My Profile', icon: User }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white hover:bg-gray-50'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 rounded-t-lg shadow-sm`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
            

          </nav>
        </div>
      </div>

      {/* Browse Library Resources */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Browse Library Resources</h3>
            <p className="text-sm text-gray-600 mt-1">Explore our comprehensive collection of books, digital resources, and academic materials</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Books */}
              <button
                onClick={() => navigate('/student/browse/books')}
                className="group p-6 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 text-left hover:bg-white"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Books</h4>
                </div>
                <p className="text-sm text-gray-600">Browse our physical book collection and check availability</p>
              </button>

              {/* E-Resources */}
              <button
                onClick={() => navigate('/student/browse/e-resources')}
                className="group p-6 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 text-left hover:bg-white"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Monitor className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">E-Resources</h4>
                </div>
                <p className="text-sm text-gray-600">Access digital books, e-journals, and online databases</p>
              </button>

              {/* Thesis */}
              <button
                onClick={() => navigate('/student/browse/thesis')}
                className="group p-6 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 text-left hover:bg-white"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Thesis</h4>
                </div>
                <p className="text-sm text-gray-600">Explore academic thesis papers and research documents</p>
              </button>

              {/* News Clippings */}
              <button
                onClick={() => navigate('/student/browse/news-clippings')}
                className="group p-6 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 text-left hover:bg-white"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Newspaper className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">News Clippings</h4>
                </div>
                <p className="text-sm text-gray-600">Browse news articles and current affairs clippings</p>
              </button>

              {/* Journals */}
              <button
                onClick={() => navigate('/student/browse/journals')}
                className="group p-6 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 text-left hover:bg-white"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Journals</h4>
                </div>
                <p className="text-sm text-gray-600">Access academic and research journals</p>
              </button>

              {/* Question Banks */}
              <button
                onClick={() => navigate('/student/browse/question-banks')}
                className="group p-6 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 text-left hover:bg-white"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Question Banks (QB)</h4>
                </div>
                <p className="text-sm text-gray-600">Find question papers and practice materials</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2">
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          dashboardData={dashboardData}
          onReserveBook={handleReserveBook}
          onRenewBook={handleRenewBook}
          onCancelReservation={handleCancelReservation}
          formatDate={formatDate}
          getDaysRemaining={getDaysRemaining}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'current-books' && (
        <CurrentBooksTab
          dashboardData={dashboardData}
          onRenewBook={handleRenewBook}
          formatDate={formatDate}
          getDaysRemaining={getDaysRemaining}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'reservations' && (
        <ReservationsTab
          dashboardData={dashboardData}
          onCancelReservation={handleCancelReservation}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'history' && (
        <HistoryTab
          dashboardData={dashboardData}
          formatDate={formatDate}
        />
      )}

      {activeTab === 'fines' && (
        <FinesTab
          dashboardData={dashboardData}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileTab
          dashboardData={dashboardData}
          showNotification={showNotification}
          updateDashboardData={setDashboardData}
        />
      )}

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false)
          setSelectedBook(null)
        }}
        book={selectedBook}
        onConfirm={confirmReservation}
        loading={reservationLoading}
      />
    </div>
  )
}

// Additional Tab Components
const ReservationsTab = ({ dashboardData, onCancelReservation, formatDate, getStatusColor }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          My Reservations ({dashboardData?.reservations?.length || 0})
        </h3>
      </div>
      <div className="p-6">
        {dashboardData?.reservations?.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.reservations.map((reservation) => (
              <div key={reservation.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{reservation.book_title}</h4>
                    <p className="text-gray-600">by {reservation.book_author}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">Reserved: {formatDate(reservation.reservation_date)}</p>
                      <p className="text-sm text-gray-500">Expires: {formatDate(reservation.expiry_date)}</p>
                      <p className="text-sm text-gray-500">Queue Position: #{reservation.queue_position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                    <button
                      onClick={() => onCancelReservation(reservation.id)}
                      className="mt-2 block px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No active reservations</h3>
            <p className="mt-2 text-gray-500">Reserve books when they're not immediately available</p>
          </div>
        )}
      </div>
    </div>
  </div>
)

const HistoryTab = ({ dashboardData, formatDate }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Borrowing History ({dashboardData?.borrowing_history?.length || 0})
        </h3>
      </div>
      <div className="p-6">
        {dashboardData?.borrowing_history?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.borrowing_history.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.book_title}</div>
                        <div className="text-sm text-gray-500">by {record.book_author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.issue_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.return_date ? formatDate(record.return_date) : 'Not returned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'returned' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No borrowing history</h3>
            <p className="mt-2 text-gray-500">Your borrowing history will appear here</p>
          </div>
        )}
      </div>
    </div>
  </div>
)

const FinesTab = ({ dashboardData, formatDate, getStatusColor }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Fines Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fines Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Fines:</span>
              <span className="font-semibold text-red-600">₹{dashboardData?.stats?.total_fines || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid:</span>
              <span className="font-semibold text-green-600">₹{dashboardData?.stats?.paid_fines || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding:</span>
              <span className="font-semibold text-red-600">₹{dashboardData?.stats?.outstanding_fines || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fines Details */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Fine Details ({dashboardData?.fines?.length || 0})
            </h3>
          </div>
          <div className="p-6">
            {dashboardData?.fines?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.fines.map((fine) => (
                  <div key={fine.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{fine.book_title}</h4>
                        <p className="text-sm text-gray-600">Fine Type: {fine.fine_type}</p>
                        <p className="text-sm text-gray-500">Date: {formatDate(fine.fine_date)}</p>
                        {fine.description && (
                          <p className="text-sm text-gray-500 mt-1">{fine.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">₹{fine.amount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fine.status)}`}>
                          {fine.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No fines</h3>
                <p className="mt-2 text-gray-500">Keep returning books on time to avoid fines</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Profile Tab Component
const ProfileTab = ({ dashboardData, showNotification, updateDashboardData }) => {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    phone: ''
  })

  useEffect(() => {
    // Use dashboard data first, then fetch additional profile data if needed
    if (dashboardData?.user) {
      setProfileData(dashboardData.user)
      setFormData({
        address: dashboardData.user.address || '',
        phone: dashboardData.user.phone || ''
      })
      setLoading(false)
    } else {
      fetchProfile()
    }
  }, [dashboardData])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfileData(response.data.user)
      setFormData({
        address: response.data.user.address || '',
        phone: response.data.user.phone || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      showNotification('Failed to load profile data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      const token = localStorage.getItem('token')
      const response = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfileData(response.data.user)
      setEditMode(false)
      showNotification('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update profile:', error)
      showNotification(error.response?.data?.error || 'Failed to update profile', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please select a valid image file (PNG, JPG, GIF, or WebP)', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', 'error')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('profile_picture', file)

      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:5000/api/auth/upload-profile-picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update profile data with new picture
      setProfileData(prev => ({
        ...prev,
        profile_picture: response.data.profile_picture
      }))
      
      // Also update dashboard data to reflect the change in the header
      updateDashboardData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          profile_picture: response.data.profile_picture
        }
      }))
      
      showNotification('Profile picture updated successfully', 'success')
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      showNotification(error.response?.data?.error || 'Failed to upload profile picture', 'error')
    } finally {
      setUploading(false)
    }
  }

  const getProfilePictureUrl = (path) => {
    if (!path) return null
    return `${getBaseUrl()}/uploads/${path}`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">Failed to load profile data</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your profile information and settings</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Profile Picture</h4>
                <div className="relative inline-block mb-6">
                  {profileData.profile_picture && (
                    <img
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                      src={getProfilePictureUrl(profileData.profile_picture)}
                      alt="Profile"
                    />
                  )}
                  
                  {!profileData.profile_picture && (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                      <User className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <label className={`inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploading}
                    />
                    <Settings className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Change Picture'}
                  </label>
                  <p className="text-xs text-gray-500">Max size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
                </div>
              </div>
            </div>
            
            {/* Profile Information Section */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* Basic Information (Read-only) */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {profileData.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Student ID</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {profileData.user_id}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {profileData.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                        {profileData.role}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">College</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {profileData.college || 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {profileData.department || 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Account Valid Until</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {profileData.validity_date ? new Date(profileData.validity_date).toLocaleDateString() : 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Member Since</label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Editable Contact Information */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Contact Info
                      </button>
                    )}
                  </div>
                  
                  {editMode ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Enter your complete address"
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          disabled={updating}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(false)
                            setFormData({
                              address: profileData.address || '',
                              phone: profileData.phone || ''
                            })
                          }}
                          className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {profileData.phone || 'Not provided'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[6rem] whitespace-pre-wrap">
                          {profileData.address || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewStudentDashboard
