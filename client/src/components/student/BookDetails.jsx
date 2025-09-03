import React, { useState, useEffect } from 'react'
import { 
  X, Book, User, Calendar, MapPin, Hash, 
  Clock, AlertCircle, CheckCircle, RefreshCw,
  BookOpen, FileText, DollarSign, Building
} from 'lucide-react'
import axios from 'axios'

const BookDetails = ({ bookId, isOpen, onClose, onReserve, onRenew }) => {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && bookId) {
      fetchBookDetails()
    }
  }, [isOpen, bookId])

  const fetchBookDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/student/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBook(response.data.book)
    } catch (error) {
      setError('Failed to load book details')
      console.error('Error fetching book details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async () => {
    setActionLoading(true)
    try {
      await onReserve(book)
      onClose()
    } catch (error) {
      console.error('Reservation failed:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRenew = async () => {
    setActionLoading(true)
    try {
      await onRenew(book.circulation_id)
      fetchBookDetails() // Refresh book details
    } catch (error) {
      console.error('Renewal failed:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getAvailabilityStatus = () => {
    if (!book) return { status: 'unknown', text: 'Unknown', color: '#6b7280' }
    
    if (book.available_copies > 0) {
      return { status: 'available', text: 'Available', color: '#10b981' }
    } else if (book.user_has_borrowed) {
      return { status: 'borrowed', text: 'You have this book', color: '#3b82f6' }
    } else if (book.user_has_reserved) {
      return { status: 'reserved', text: 'You have reserved this', color: '#8b5cf6' }
    } else {
      return { status: 'unavailable', text: 'Currently unavailable', color: '#ef4444' }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  const availability = getAvailabilityStatus()

  return (
    <div className="book-details-overlay">
      <div className="book-details-modal">
        <div className="modal-header">
          <h2>Book Details</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading book details...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle size={48} />
              <h3>Error Loading Book</h3>
              <p>{error}</p>
              <button onClick={fetchBookDetails} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : book ? (
            <>
              {/* Book Header */}
              <div className="book-header-section">
                <div className="book-icon-large">
                  <BookOpen size={32} />
                </div>
                <div className="book-title-section">
                  <h1>{book.title}</h1>
                  <div className="authors-list">
                    {book.author_1 && <span className="author-primary">{book.author_1}</span>}
                    {book.author_2 && <span className="author-secondary">{book.author_2}</span>}
                    {book.author_3 && <span className="author-secondary">{book.author_3}</span>}
                    {book.author_4 && <span className="author-secondary">{book.author_4}</span>}
                  </div>
                  <div className="availability-status" style={{ color: availability.color }}>
                    <CheckCircle size={16} />
                    <span>{availability.text}</span>
                  </div>
                </div>
              </div>

              {/* Book Information Grid */}
              <div className="book-info-grid">
                <div className="info-card">
                  <div className="info-icon">
                    <Hash size={20} />
                  </div>
                  <div className="info-content">
                    <label>Access Number</label>
                    <span>{book.access_no}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Building size={20} />
                  </div>
                  <div className="info-content">
                    <label>Publisher</label>
                    <span>{book.publisher || 'Not specified'}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <FileText size={20} />
                  </div>
                  <div className="info-content">
                    <label>Edition</label>
                    <span>{book.edition || 'Not specified'}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Book size={20} />
                  </div>
                  <div className="info-content">
                    <label>Pages</label>
                    <span>{book.pages || 'Not specified'}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <DollarSign size={20} />
                  </div>
                  <div className="info-content">
                    <label>Price</label>
                    <span>₹{book.price || '0.00'}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="info-content">
                    <label>Location</label>
                    <span>{book.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Availability Information */}
              <div className="availability-section">
                <h3>Availability Information</h3>
                <div className="availability-details">
                  <div className="availability-item">
                    <span>Total Copies:</span>
                    <span>{book.number_of_copies || 1}</span>
                  </div>
                  <div className="availability-item">
                    <span>Available Copies:</span>
                    <span>{book.available_copies || 0}</span>
                  </div>
                  {book.current_due_date && (
                    <div className="availability-item">
                      <span>Expected Return:</span>
                      <span>{formatDate(book.current_due_date)}</span>
                    </div>
                  )}
                  {book.reservation_queue_length > 0 && (
                    <div className="availability-item">
                      <span>Reservation Queue:</span>
                      <span>{book.reservation_queue_length} people waiting</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                {book.available_copies > 0 ? (
                  <button className="btn btn-primary btn-large">
                    <BookOpen size={16} />
                    Contact Librarian to Borrow
                  </button>
                ) : book.user_has_borrowed ? (
                  book.can_renew ? (
                    <button 
                      className="btn btn-secondary btn-large"
                      onClick={handleRenew}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw size={16} className="spinning" />
                          Renewing...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Renew Book
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="renewal-disabled">
                      <AlertCircle size={16} />
                      <span>{book.renewal_reason}</span>
                    </div>
                  )
                ) : book.user_has_reserved ? (
                  <div className="reservation-status">
                    <Clock size={16} />
                    <span>You are #{book.user_queue_position} in the reservation queue</span>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={handleReserve}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        Reserving...
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        Reserve Book
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default BookDetails
