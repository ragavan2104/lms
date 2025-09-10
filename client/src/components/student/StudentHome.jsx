import React, { useState, useEffect, Fragment } from 'react'
import {
  BookOpen, User, Calendar, Clock, AlertCircle, CheckCircle,
  RefreshCw, Search, History, X, CreditCard, Mail, Building,
  GraduationCap, Book, FileText
} from 'lucide-react'
import axios from 'axios'
import InlineBookDetails from './InlineBookDetails'
import ReservationModal from './ReservationModal'

const StudentHome = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  // Book Details Modal State
  const [selectedBookId, setSelectedBookId] = useState(null)
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false)

  // Reservation Modal State
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedBookForReservation, setSelectedBookForReservation] = useState(null)
  const [reservationLoading, setReservationLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (dueDateString) => {
    const dueDate = new Date(dueDateString)
    const today = new Date()
    const diffTime = dueDate - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Book Details Modal handlers
  const handleBookClick = (bookId) => {
    setSelectedBookId(bookId)
    setIsBookDetailsOpen(true)
  }

  const handleCloseBookDetails = () => {
    setIsBookDetailsOpen(false)
    setSelectedBookId(null)
  }

  // Reservation and Renewal handlers
  const handleReserveBook = (book) => {
    setSelectedBookForReservation(book)
    setShowReservationModal(true)
  }

  // Confirm reservation with pickup date
  const handleConfirmReservation = async (reservationData, onError) => {
    if (!selectedBookForReservation) return

    setReservationLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`http://localhost:5000/api/student/books/${selectedBookForReservation.id}/reserve`,
        reservationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      showNotification('Book reserved successfully!', 'success')
      setShowReservationModal(false)
      setSelectedBookForReservation(null)
      fetchDashboardData() // Refresh data

    } catch (error) {
      // Call the error callback if provided (for availability date errors)
      if (onError && error.response?.data?.earliest_available_date) {
        onError(error)
      } else {
        const message = error.response?.data?.error || 'Failed to reserve book'
        showNotification(message, 'error')
      }
    } finally {
      setReservationLoading(false)
    }
  }

  const handleRenewBook = async (circulationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`renew_${circulationId}`]: true }))

      const token = localStorage.getItem('token')
      await axios.post(`http://localhost:5000/api/student/circulations/${circulationId}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      showNotification('Book renewed successfully!', 'success')
      fetchDashboardData() // Refresh data

    } catch (error) {
      const message = error.response?.data?.error || 'Failed to renew book'
      showNotification(message, 'error')
    } finally {
      setActionLoading(prev => ({ ...prev, [`renew_${circulationId}`]: false }))
    }
  }

  const handleCancelReservation = async (reservationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`cancel_${reservationId}`]: true }))

      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/student/reservations/${reservationId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      showNotification('Reservation cancelled successfully!', 'success')
      fetchDashboardData() // Refresh data

    } catch (error) {
      const message = error.response?.data?.error || 'Failed to cancel reservation'
      showNotification(message, 'error')
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel_${reservationId}`]: false }))
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/student/dashboard', {
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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (!dashboardData) {
    return <div>Failed to load dashboard data</div>
  }

  const { user, stats, borrowed_books } = dashboardData

  return (
    <div className="student-home">
      <div className="welcome-section">
        <h1>Welcome back, {user.name}!</h1>
        <div className="user-details">
          <p><strong>Student ID:</strong> {user.user_id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>College:</strong> {user.college}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Account Valid Until:</strong> {new Date(user.validity_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card blue">
          <div className="stat-icon">
            <Book size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.books_borrowed}</h3>
            <p className="stat-title">Currently Borrowed</p>
          </div>
        </div>
        
        <div className="stat-card green">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total_books_read}</h3>
            <p className="stat-title">Total Books Read</p>
          </div>
        </div>
        
        <div className="stat-card red">
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>₹{stats.total_fines}</h3>
            <p className="stat-title">Total Fines</p>
          </div>
        </div>
      </div>

      <div className="borrowed-books-section">
        <h2>Currently Borrowed Books</h2>
        {borrowed_books.length === 0 ? (
          <div className="empty-state">
            <Book size={48} color="#ccc" />
            <p>No books currently borrowed</p>
            <a href="/student/books" className="btn btn-primary">Browse Books</a>
          </div>
        ) : (
          <div className="borrowed-books-grid">
            {borrowed_books.map((book, index) => (
              <Fragment key={book.id}>
                <div
                  className={`book-card ${book.is_overdue ? 'overdue' : ''} clickable`}
                  onClick={() => handleBookClick(book.book_id)}
                >
                  <div className="book-info">
                    <h3>{book.book_title}</h3>
                    <p>by {book.book_author}</p>
                    <p className="book-access">Access No: {book.access_no}</p>
                  </div>
                  <div className="book-dates">
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>Issued: {new Date(book.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>Due: {new Date(book.due_date).toLocaleDateString()}</span>
                    </div>
                    {book.is_overdue ? (
                      <div className="overdue-warning">
                        <AlertCircle size={14} />
                        <span>Overdue!</span>
                      </div>
                    ) : (
                      <div className="days-remaining">
                        <span>{book.days_remaining} days remaining</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Book Details */}
                {selectedBookId === book.book_id && (
                  <InlineBookDetails
                    bookId={selectedBookId}
                    isOpen={isBookDetailsOpen}
                    onClose={handleCloseBookDetails}
                    onReserve={handleReserveBook}
                    onRenew={handleRenewBook}
                  />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Access library services and manage your account</p>
        </div>
        <div className="quick-actions-grid">
          <a href="/student/books" className="quick-action-card browse-books">
            <div className="card-header">
              <div className="action-icon-wrapper">
                <Book size={24} />
              </div>
              <div className="action-details">
                <h3>Browse Books</h3>
                <p>Find and explore our book collection</p>
              </div>
            </div>
            <div className="card-footer">
              <span className="action-link">Explore Books →</span>
            </div>
          </a>

          <a href="/student/e-resources" className="quick-action-card browse-e-resources">
            <div className="card-header">
              <div className="action-icon-wrapper">
                <BookOpen size={24} />
              </div>
              <div className="action-details">
                <h3>Browse E-Resources</h3>
                <p>Access digital resources and e-books</p>
              </div>
            </div>
            <div className="card-footer">
              <span className="action-link">View E-Resources →</span>
            </div>
          </a>

          <a href="/student/question-banks" className="quick-action-card question-banks">
            <div className="card-header">
              <div className="action-icon-wrapper">
                <FileText size={24} />
              </div>
              <div className="action-details">
                <h3>Question Banks</h3>
                <p>Download question papers and study materials</p>
              </div>
            </div>
            <div className="card-footer">
              <span className="action-link">Browse Papers →</span>
            </div>
          </a>

          <a href="/student/reservations" className="quick-action-card my-reservations">
            <div className="card-header">
              <div className="action-icon-wrapper">
                <Clock size={24} />
              </div>
              <div className="action-details">
                <h3>My Reservations</h3>
                <p>Manage your book reservations</p>
              </div>
            </div>
            <div className="card-footer">
              <span className="action-link">View Reservations →</span>
            </div>
          </a>

          <a href="/student/history" className="quick-action-card borrowing-history">
            <div className="card-header">
              <div className="action-icon-wrapper">
                <Calendar size={24} />
              </div>
              <div className="action-details">
                <h3>Borrowing History</h3>
                <p>View your past borrowing records</p>
              </div>
            </div>
            <div className="card-footer">
              <span className="action-link">View History →</span>
            </div>
          </a>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false)
          setSelectedBookForReservation(null)
        }}
        book={selectedBookForReservation}
        onConfirm={handleConfirmReservation}
        loading={reservationLoading}
      />
    </div>
  )
}

export default StudentHome
