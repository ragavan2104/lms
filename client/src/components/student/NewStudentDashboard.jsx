import React, { useState, useEffect, Fragment } from 'react'
import {
  BookOpen, Calendar, Clock, DollarSign, User,
  Search, Filter, Eye, RotateCcw, AlertCircle,
  CheckCircle, XCircle, Plus, Minus, Star,
  Download, RefreshCw, Bell, Settings, Hash,
  Building, MapPin
} from 'lucide-react'
import axios from 'axios'
import { OverviewTab, CurrentBooksTab } from './DashboardTabs'
import ReservationModal from './ReservationModal'
import InlineBookDetails from './InlineBookDetails'

const NewStudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [reservationLoading, setReservationLoading] = useState(false)
  const [availableBooks, setAvailableBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBookId, setSelectedBookId] = useState(null)
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false)

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
      if (activeTab === 'browse') {
        fetchAvailableBooks()
      }
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

  const handleReserveBook = (book) => {
    setSelectedBook(book)
    setShowReservationModal(true)
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

  const fetchAvailableBooks = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: 1,
        per_page: 20,
        search: searchTerm,
        category: selectedCategory,
        availability: 'all'
      })

      const response = await axios.get(`http://localhost:5000/api/student/books?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAvailableBooks(response.data.books)
    } catch (error) {
      console.error('Failed to fetch available books:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/student/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
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
              >
                <RefreshCw size={20} />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>{dashboardData?.user?.user_id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fines</p>
                <p className="text-2xl font-bold text-gray-900">₹{dashboardData?.stats?.total_fines || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: BookOpen },
                { id: 'current-books', name: 'Current Books', icon: BookOpen },
                { id: 'reservations', name: 'Reservations', icon: Clock },
                { id: 'history', name: 'Borrowing History', icon: Calendar },
                { id: 'fines', name: 'Fines & Payments', icon: DollarSign },
                { id: 'browse', name: 'Browse Books', icon: Search }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                className={`${
                      activeTab === tab.id
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon size={16} />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
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

      {activeTab === 'browse' && (
        <BrowseBooksTab
          availableBooks={availableBooks}
          categories={categories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onReserveBook={handleReserveBook}
          onBookClick={handleBookClick}
          selectedBookId={selectedBookId}
          isBookDetailsOpen={isBookDetailsOpen}
          onCloseBookDetails={handleCloseBookDetails}
          fetchAvailableBooks={fetchAvailableBooks}
          fetchCategories={fetchCategories}
          formatDate={formatDate}
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

const BrowseBooksTab = ({
  availableBooks,
  categories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onReserveBook,
  onBookClick,
  selectedBookId,
  isBookDetailsOpen,
  onCloseBookDetails,
  fetchAvailableBooks,
  fetchCategories,
  formatDate
}) => {
  React.useEffect(() => {
    fetchCategories()
    fetchAvailableBooks()
  }, [searchTerm, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {availableBooks.map((book) => (
          <Fragment key={book.id}>
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onBookClick(book.id)}
            >
              <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  book.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {book.available_copies > 0 ? 'Available' : 'Not Available'}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-4">by {book.author}</p>

              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <Hash size={12} className="mr-1" />
                  <span>Access No: {book.access_no}</span>
                </div>
                <div className="flex items-center">
                  <Building size={12} className="mr-1" />
                  <span>{book.category || 'General'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={12} className="mr-1" />
                  <span>{book.location || 'Library'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span>Total: {book.number_of_copies}</span>
                <span>Available: {book.available_copies}</span>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-500">Click to view details</span>
              </div>
            </div>
          </div>

          {/* Inline Book Details */}
          {selectedBookId === book.id && (
            <InlineBookDetails
              bookId={selectedBookId}
              isOpen={isBookDetailsOpen}
              onClose={onCloseBookDetails}
              onReserve={onReserveBook}
              onRenew={() => {}} // Not needed for browse tab
            />
          )}
        </Fragment>
        ))}
      </div>

      {availableBooks.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No books found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

export default NewStudentDashboard
