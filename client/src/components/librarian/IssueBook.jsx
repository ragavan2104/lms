import React, { useState, useEffect, useCallback } from 'react'
import { Search, User, Book, Calendar, AlertCircle, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const IssueBook = () => {
  const { user } = useAuth()
  const [userInfo, setUserInfo] = useState(null)
  const [userLoading, setUserLoading] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [bookSearch, setBookSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [bookSearchTimeout, setBookSearchTimeout] = useState(null)
  const [isBookSearching, setIsBookSearching] = useState(false)
  const [settings, setSettings] = useState({
    max_books_per_student: 3,
    max_books_per_staff: 5
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [reservationWarning, setReservationWarning] = useState(null)
  const [showReservationModal, setShowReservationModal] = useState(false)

  const [formData, setFormData] = useState({
    userId: '',
    bookId: '',
    dueDate: ''
  })

  // Check if current user is admin (can modify due dates)
  const isAdmin = user?.role === 'admin'

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      const response = await axios.get('/librarian/settings')
      setSettings(response.data.settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Keep default values if fetch fails
    }
  }

  useEffect(() => {
    // Set default dates
    const today = new Date()
    const defaultDue = new Date()
    defaultDue.setDate(today.getDate() + 14) // 14 days from today

    setIssueDate(today.toISOString().split('T')[0])
    setDueDate(defaultDue.toISOString().split('T')[0])
    setFormData(prev => ({ ...prev, dueDate: defaultDue.toISOString().split('T')[0] }))

    // Fetch settings
    fetchSettings()
  }, [])

  // Debounced user search function
  const debouncedUserSearch = useCallback((userId) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      handleUserSearch(userId)
    }, 500) // Wait 500ms after user stops typing

    setSearchTimeout(newTimeout)
  }, [searchTimeout])

  const handleUserSearch = async (userId) => {
    if (!userId.trim()) {
      setUserInfo(null)
      setErrors(prev => ({ ...prev, user: '' }))
      return
    }

    setUserLoading(true)
    try {
      const response = await axios.get(`/admin/circulation/user/${userId}`)
      setUserInfo(response.data)
      setFormData(prev => ({ ...prev, userId: userId }))
      setErrors(prev => ({ ...prev, user: '' }))
    } catch (error) {
      setUserInfo(null)

      let errorMessage = 'User not found'
      if (error.response?.data?.available_student_ids) {
        const availableIds = error.response.data.available_student_ids
        errorMessage = `User "${userId}" not found. Available student IDs: ${availableIds.join(', ')}`
      }

      setErrors(prev => ({
        ...prev,
        user: errorMessage
      }))
    } finally {
      setUserLoading(false)
    }
  }

  // Debounced book search function
  const debouncedBookSearch = useCallback((searchTerm) => {
    // Clear existing timeout
    if (bookSearchTimeout) {
      clearTimeout(bookSearchTimeout)
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      handleBookSearch(searchTerm)
    }, 400) // Wait 400ms after user stops typing

    setBookSearchTimeout(newTimeout)
  }, [bookSearchTimeout])

  const handleBookSearch = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      setShowSuggestions(false)
      setIsBookSearching(false)
      return
    }

    setIsBookSearching(true)
    try {
      const response = await axios.get(`/admin/books/search?search=${searchTerm}`)
      const books = response.data.books || []
      setSearchResults(books)
      setShowSuggestions(books.length > 0 || searchTerm.length >= 2)
    } catch (error) {
      setSearchResults([])
      setShowSuggestions(false)
    } finally {
      setIsBookSearching(false)
    }
  }

  const handleBookInputChange = (e) => {
    const value = e.target.value
    setBookSearch(value)
    setSelectedSuggestionIndex(-1) // Reset selection when typing

    if (value.length >= 2) {
      setIsBookSearching(true)
      debouncedBookSearch(value)
    } else {
      setSearchResults([])
      setShowSuggestions(false)
      setIsBookSearching(false)
    }
  }

  const checkReservationStatus = async (book) => {
    try {
      const response = await axios.get(`/api/books/${book.access_no}/reservation-status`)
      if (response.data.has_reservations) {
        setReservationWarning({
          book: book,
          reservations: response.data.reservations,
          total_reservations: response.data.total_reservations
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to check reservation status:', error)
      return false
    }
  }

  const selectBook = async (book) => {
    setSelectedBook(book)
    setFormData(prev => ({ ...prev, bookId: book.id }))
    setBookSearch(book.title) // Set the search field to the book title
    setSearchResults([])
    setShowSuggestions(false)
    setErrors(prev => ({ ...prev, book: '' })) // Clear any book selection errors
    setReservationWarning(null) // Clear previous warnings

    // Check for reservations
    await checkReservationStatus(book)
  }

  const handleSuggestionClick = (book) => {
    selectBook(book)
  }

  // Close suggestions when clicking outside
  const handleBookInputBlur = () => {
    // Delay hiding suggestions to allow for clicks on suggestions
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const handleBookInputFocus = () => {
    if (searchResults.length > 0 && bookSearch.length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchResults.length) {
          selectBook(searchResults[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
      default:
        setSelectedSuggestionIndex(-1)
    }
  }

  const handleSubmit = async (e, overrideReservation = false) => {
    e.preventDefault()

    // Validation
    const newErrors = {}
    if (!userInfo) {
      newErrors.user = 'Please search and select a valid user'
    }
    if (!selectedBook) {
      newErrors.book = 'Please search and select a book'
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Check if user has outstanding fines
    if (userInfo && userInfo.total_fine && userInfo.total_fine > 0) {
      setErrors({ user: `User has outstanding fines of ₹${userInfo.total_fine}. Please clear fines before issuing books.` })
      return
    }

    // Check borrowing limits
    if (userInfo && userInfo.current_books) {
      const currentBorrowedCount = userInfo.current_books.length
      let maxBooks = settings.max_books_per_student // Use setting for students

      if (userInfo.user.role === 'staff') {
        maxBooks = settings.max_books_per_staff // Use setting for staff
      }

      if (currentBorrowedCount >= maxBooks) {
        setErrors({
          user: `User has reached the maximum borrowing limit of ${maxBooks} books. Currently borrowed: ${currentBorrowedCount} books. Please return some books before issuing new ones.`
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post('/admin/circulation/issue', {
        user_id: userInfo.user.user_id,
        book_id: selectedBook.id,
        due_date: formData.dueDate,
        override_reservation: overrideReservation
      })

      alert('Book issued successfully!')

      // Reset form
      setFormData({ userId: '', bookId: '', dueDate: dueDate })
      setUserInfo(null)
      setSelectedBook(null)
      setBookSearch('')
      setSearchResults([])
      setReservationWarning(null)
      setShowReservationModal(false)

      // Refresh user info if same user
      if (userInfo) {
        handleUserSearch(userInfo.user.user_id)
      }

    } catch (error) {
      if (error.response?.data?.error === 'RESERVATION_CONFLICT') {
        // Show reservation conflict modal
        setReservationWarning({
          book: selectedBook,
          conflict: true,
          reservation_details: error.response.data.reservation_details,
          message: error.response.data.message,
          can_override: error.response.data.can_override
        })
        setShowReservationModal(true)
      } else {
        alert(error.response?.data?.error || 'Failed to issue book')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverrideReservation = async () => {
    await handleSubmit({ preventDefault: () => {} }, true)
  }

  return (
    <div className="issue-book">
      <div className="page-header">
        <h1>Issue Book</h1>
        <p>Issue books to students and staff</p>
      </div>

      <div className="issue-book-container">
        <div className="issue-form-section">
          <div className="form-card">
            <h2>Book Issue Form</h2>

            <form onSubmit={handleSubmit}>
              {/* User Search */}
              <div className="form-group">
                <label>Student/Staff ID *</label>
                <div className="search-input">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="Enter user ID (roll number)"
                    value={formData.userId}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      setFormData(prev => ({ ...prev, userId: value }))
                      if (value.length >= 1) {
                        debouncedUserSearch(value)
                      } else {
                        setUserInfo(null)
                        setErrors(prev => ({ ...prev, user: '' }))
                      }
                    }}
                    className={errors.user ? 'error' : ''}
                  />
                  {userLoading && <div className="loading-spinner">Loading...</div>}
                </div>
                {errors.user && <span className="error-text">{errors.user}</span>}
              </div>

              {/* Book Search */}
              <div className="form-group">
                <label>Search Book *</label>
                <div className="search-input-container" style={{ position: 'relative' }}>
                  <div className="search-input">
                    <Book size={16} />
                    <input
                      type="text"
                      placeholder="Search by title, author, access number, or ISBN"
                      value={bookSearch}
                      onChange={handleBookInputChange}
                      onFocus={handleBookInputFocus}
                      onBlur={handleBookInputBlur}
                      onKeyDown={handleKeyDown}
                      className={errors.book ? 'error' : ''}
                      autoComplete="off"
                    />
                    {isBookSearching && (
                      <div className="search-loading" style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        Searching...
                      </div>
                    )}
                  </div>

                  {/* Autocomplete Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="suggestions-dropdown" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderTop: 'none',
                      borderRadius: '0 0 4px 4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {searchResults.length > 0 ? (
                        searchResults.map((book, index) => (
                          <div
                            key={book.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(book)}
                            style={{
                              padding: '12px',
                              borderBottom: '1px solid #f0f0f0',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              backgroundColor: selectedSuggestionIndex === index ? '#e3f2fd' : 'white'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = selectedSuggestionIndex === index ? '#e3f2fd' : '#f8f9fa'
                              setSelectedSuggestionIndex(index)
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = selectedSuggestionIndex === index ? '#e3f2fd' : 'white'
                            }}
                          >
                            <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                              {book.title} by {book.author}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              Access No: {book.access_no} • {book.available_copies} copies available
                              {book.isbn && ` • ISBN: ${book.isbn}`}
                            </div>
                            {book.available_copies === 0 && (
                              <div style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '2px' }}>
                                Currently unavailable
                              </div>
                            )}
                          </div>
                        ))
                      ) : bookSearch.length >= 2 && !isBookSearching ? (
                        <div style={{
                          padding: '12px',
                          textAlign: 'center',
                          color: '#666',
                          fontStyle: 'italic'
                        }}>
                          No books found matching "{bookSearch}"
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                {errors.book && <span className="error-text">{errors.book}</span>}

                {/* Selected Book Display */}
                {selectedBook && (
                  <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    backgroundColor: '#e8f5e8',
                    border: '1px solid #4caf50',
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} style={{ color: '#4caf50' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: '#2e7d32' }}>
                          Selected: {selectedBook.title}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#388e3c' }}>
                          by {selectedBook.author} • Access No: {selectedBook.access_no} • {selectedBook.available_copies} available
                          {selectedBook.isbn && ` • ISBN: ${selectedBook.isbn}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reservation Warning Display */}
                {reservationWarning && !reservationWarning.conflict && (
                  <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={16} style={{ color: '#856404', marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#856404', marginBottom: '4px' }}>
                          ⚠️ This book has active reservations
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#856404', marginBottom: '8px' }}>
                          {reservationWarning.total_reservations} student(s) have reserved this book.
                          Please ensure you're issuing to the correct student.
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                          <strong>Next in queue:</strong> {reservationWarning.reservations[0]?.student_name}
                          (ID: {reservationWarning.reservations[0]?.student_id})
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Issue and Due Dates */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Issue Date</label>
                  <div className="date-input">
                    <Calendar size={16} />
                    <input
                      type="date"
                      value={issueDate}
                      disabled
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Due Date * {!isAdmin && <span className="restriction-note">(Auto-calculated - 14 days)</span>}</label>
                  <div className="date-input">
                    <Calendar size={16} />
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={isAdmin ? (e) => setFormData(prev => ({ ...prev, dueDate: e.target.value })) : undefined}
                      min={issueDate}
                      className={errors.dueDate ? 'error' : ''}
                      disabled={!isAdmin} // Librarians cannot modify due date
                      readOnly={!isAdmin} // Additional protection for librarians
                      style={!isAdmin ? {
                        backgroundColor: '#f5f5f5 !important',
                        color: '#666 !important',
                        cursor: 'not-allowed !important',
                        border: '1px solid #d1d5db !important'
                      } : {}}
                    />
                  </div>
                  {!isAdmin && (
                    <small className="help-text">
                      Due date is automatically set to 14 days from issue date. Only administrators can modify this.
                    </small>
                  )}
                  {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !userInfo || !selectedBook}
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Book'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User Information Panel */}
        {userInfo && (
          <div className="user-info-section">
            <div className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  <User size={24} />
                </div>
                <div className="user-details">
                  <h3>{userInfo.user.name}</h3>
                  <p>ID: {userInfo.user.user_id}</p>
                  <p>{userInfo.user.email}</p>
                  {userInfo.user.college && (
                    <p>{userInfo.user.college} - {userInfo.user.department}</p>
                  )}
                </div>
                <div className="user-status">
                  {userInfo.can_borrow ? (
                    <div className="status-badge success">
                      <CheckCircle size={16} />
                      Can Borrow
                    </div>
                  ) : (
                    <div className="status-badge danger">
                      <AlertCircle size={16} />
                      Has Fines
                    </div>
                  )}
                </div>
              </div>

              {/* Current Fine Amount */}
              {userInfo.total_fine > 0 && (
                <div className="fine-alert">
                  <AlertCircle size={16} />
                  <span>Outstanding Fine: ₹{userInfo.total_fine.toFixed(2)}</span>
                </div>
              )}

              {/* Account Status */}
              <div className="section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4>Account Status</h4>
                  {(() => {
                    const user = userInfo.user
                    const isExpired = user.is_expired
                    const isActive = user.is_account_active
                    const expirationStatus = user.expiration_status

                    if (isExpired) {
                      return (
                        <div className="status-badge danger">
                          <AlertCircle size={16} />
                          Expired
                        </div>
                      )
                    } else if (expirationStatus?.status === 'expires_soon') {
                      return (
                        <div className="status-badge warning">
                          <AlertCircle size={16} />
                          Expires Soon
                        </div>
                      )
                    } else if (isActive) {
                      return (
                        <div className="status-badge success">
                          <CheckCircle size={16} />
                          Active
                        </div>
                      )
                    } else {
                      return (
                        <div className="status-badge danger">
                          <AlertCircle size={16} />
                          Inactive
                        </div>
                      )
                    }
                  })()}
                </div>
                {(() => {
                  const user = userInfo.user
                  const isExpired = user.is_expired
                  const expirationStatus = user.expiration_status

                  if (isExpired) {
                    return (
                      <div className="fine-alert" style={{ marginBottom: '15px' }}>
                        <AlertCircle size={16} />
                        <span>{expirationStatus?.message || 'Account has expired'}</span>
                      </div>
                    )
                  } else if (expirationStatus?.status === 'expires_soon') {
                    return (
                      <div className="warning-alert" style={{ marginBottom: '15px', backgroundColor: '#fff3cd', borderColor: '#ffeaa7', color: '#856404' }}>
                        <AlertCircle size={16} />
                        <span>{expirationStatus?.message}</span>
                      </div>
                    )
                  } else if (user.validity_date) {
                    return (
                      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                        <span>Valid until: {new Date(user.validity_date).toLocaleDateString()}</span>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Borrowing Limit Status */}
              <div className="section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4>Borrowing Status</h4>
                  {(() => {
                    const currentCount = userInfo.current_books.length
                    const maxBooks = userInfo.user.role === 'staff' ? settings.max_books_per_staff : settings.max_books_per_student
                    const isAtLimit = currentCount >= maxBooks

                    return (
                      <div className={`status-badge ${isAtLimit ? 'danger' : 'success'}`}>
                        {isAtLimit ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {currentCount}/{maxBooks} books
                      </div>
                    )
                  })()}
                </div>
                {(() => {
                  const currentCount = userInfo.current_books.length
                  const maxBooks = userInfo.user.role === 'staff' ? settings.max_books_per_staff : settings.max_books_per_student
                  const isAtLimit = currentCount >= maxBooks

                  if (isAtLimit) {
                    return (
                      <div className="fine-alert" style={{ marginBottom: '15px' }}>
                        <AlertCircle size={16} />
                        <span>User has reached the maximum borrowing limit of {maxBooks} books</span>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Currently Borrowed Books */}
              <div className="section">
                <h4>Currently Borrowed Books ({userInfo.current_books.length})</h4>
                {userInfo.current_books.length === 0 ? (
                  <p className="no-data">No books currently borrowed</p>
                ) : (
                  <div className="books-list">
                    {userInfo.current_books.map((item) => (
                      <div key={item.circulation_id} className="book-item">
                        <div className="book-details">
                          <strong>{item.title}</strong>
                          <span>by {item.author}</span>
                          <small>Access No: {item.access_no}</small>
                        </div>
                        <div className="book-dates">
                          <div className="date-info">
                            <span>Issued: {new Date(item.issue_date).toLocaleDateString()}</span>
                            <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                          </div>
                          {item.is_overdue && (
                            <div className="overdue-badge">
                              <Clock size={14} />
                              Overdue ({item.days_overdue} days)
                              {item.fine_amount > 0 && (
                                <span className="fine-amount">₹{item.fine_amount.toFixed(2)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Borrowing History */}
              <div className="section">
                <h4>Recent Borrowing History</h4>
                {userInfo.borrowing_history.length === 0 ? (
                  <p className="no-data">No borrowing history</p>
                ) : (
                  <div className="history-list">
                    {userInfo.borrowing_history.slice(0, 5).map((item, index) => (
                      <div key={index} className="history-item">
                        <div className="book-info">
                          <strong>{item.book_title}</strong>
                          <span>by {item.author}</span>
                        </div>
                        <div className="history-dates">
                          <span>Issued: {new Date(item.issue_date).toLocaleDateString()}</span>
                          {item.return_date && (
                            <span>Returned: {new Date(item.return_date).toLocaleDateString()}</span>
                          )}
                          <span className={`status ${item.status}`}>{item.status}</span>
                          {item.fine_amount > 0 && (
                            <span className="fine">Fine: ₹{item.fine_amount.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Conflict Modal */}
      {showReservationModal && reservationWarning?.conflict && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(55, 65, 81, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} style={{ color: '#dc3545' }} />
              <h3 style={{ margin: 0, color: '#dc3545' }}>Reservation Conflict</h3>
              <button
                onClick={() => setShowReservationModal(false)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>
                {reservationWarning.message}
              </p>

              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Reservation Details:</h4>
                <div style={{ fontSize: '0.9rem', color: '#495057' }}>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Student:</strong> {reservationWarning.reservation_details?.student_name}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Student ID:</strong> {reservationWarning.reservation_details?.student_id}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Email:</strong> {reservationWarning.reservation_details?.student_email}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Queue Position:</strong> #{reservationWarning.reservation_details?.queue_position}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Total Reservations:</strong> {reservationWarning.reservation_details?.total_reservations}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReservationModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #6c757d',
                  backgroundColor: 'white',
                  color: '#6c757d',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {reservationWarning?.can_override && (
                <button
                  onClick={handleOverrideReservation}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Processing...' : 'Override & Issue Book'}
                </button>
              )}
              <button
                onClick={() => {
                  // Navigate to reservation management
                  window.location.href = '/librarian/reservations'
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Manage Reservations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IssueBook
