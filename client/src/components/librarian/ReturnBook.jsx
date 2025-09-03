import React, { useState } from 'react'
import { Search, User, Book, Calendar, AlertCircle, CheckCircle, Clock, IndianRupee, RotateCcw, BookOpen } from 'lucide-react'
import axios from 'axios'

const ReturnBook = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [userLoading, setUserLoading] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const [errors, setErrors] = useState({})
  const [totalFine, setTotalFine] = useState(0)
  const [isbnSearchResults, setIsbnSearchResults] = useState([])
  const [isbnLoading, setIsbnLoading] = useState(false)

  const [formData, setFormData] = useState({
    userId: '',
    isbn: ''
  })

  const handleUserSearch = async (userId) => {
    if (!userId.trim()) {
      setUserInfo(null)
      setSelectedBooks([])
      setTotalFine(0)
      return
    }

    setUserLoading(true)
    try {
      const response = await axios.get(`/admin/circulation/user/${userId}`)
      setUserInfo(response.data)
      setFormData(prev => ({ ...prev, userId: userId }))
      setErrors(prev => ({ ...prev, user: '' }))
      setSelectedBooks([])
      setTotalFine(0)
    } catch (error) {
      setUserInfo(null)
      setSelectedBooks([])
      setTotalFine(0)
      setErrors(prev => ({ ...prev, user: error.response?.data?.error || 'User not found' }))
    } finally {
      setUserLoading(false)
    }
  }

  const handleIsbnSearch = async (isbn) => {
    if (!isbn.trim()) {
      setIsbnSearchResults([])
      setErrors(prev => ({ ...prev, isbn: '' }))
      return
    }

    setIsbnLoading(true)
    try {
      const response = await axios.get(`/librarian/circulation/search/isbn/${isbn}`)
      setIsbnSearchResults(response.data.issued_books)
      setFormData(prev => ({ ...prev, isbn: isbn }))
      setErrors(prev => ({ ...prev, isbn: '' }))
    } catch (error) {
      setIsbnSearchResults([])
      setErrors(prev => ({ ...prev, isbn: error.response?.data?.error || 'No issued books found with this ISBN' }))
    } finally {
      setIsbnLoading(false)
    }
  }

  const toggleBookSelection = (book) => {
    const isSelected = selectedBooks.some(b => b.circulation_id === book.circulation_id)

    if (isSelected) {
      const newSelected = selectedBooks.filter(b => b.circulation_id !== book.circulation_id)
      setSelectedBooks(newSelected)
      calculateTotalFine(newSelected)
    } else {
      const newSelected = [...selectedBooks, book]
      setSelectedBooks(newSelected)
      calculateTotalFine(newSelected)
    }
  }

  const calculateTotalFine = (books) => {
    const total = books.reduce((sum, book) => sum + (book.fine_amount || 0), 0)
    setTotalFine(total)
  }

  const selectAllBooks = () => {
    if (selectedBooks.length === userInfo.current_books.length) {
      setSelectedBooks([])
      setTotalFine(0)
    } else {
      setSelectedBooks([...userInfo.current_books])
      calculateTotalFine(userInfo.current_books)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedBooks.length === 0) {
      setErrors(prev => ({ ...prev, books: 'Please select at least one book to return' }))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post('/admin/circulation/return', {
        circulation_ids: selectedBooks.map(book => book.circulation_id)
      })

      alert(`Successfully returned ${selectedBooks.length} book(s)`)
      
      // Refresh user info
      if (userInfo) {
        await handleUserSearch(formData.userId)
      }
      
      setSelectedBooks([])
      setTotalFine(0)
      setErrors({})
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to return books')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRenewal = async () => {
    if (selectedBooks.length === 0) {
      setErrors(prev => ({ ...prev, books: 'Please select at least one book to renew' }))
      return
    }

    // Check if any selected books are overdue
    const overdueBooks = selectedBooks.filter(book => book.is_overdue)
    if (overdueBooks.length > 0) {
      alert('Cannot renew overdue books. Please return them first.')
      return
    }

    // Check if user has any pending fines
    if (userInfo.total_fine > 0) {
      alert('Cannot renew books while user has pending fines. Please clear all fines first.')
      return
    }

    setIsRenewing(true)
    try {
      const response = await axios.post('/admin/circulation/renew', {
        circulation_ids: selectedBooks.map(book => book.circulation_id)
      })

      alert(`Successfully renewed ${selectedBooks.length} book(s)`)
      
      // Refresh user info
      if (userInfo) {
        await handleUserSearch(formData.userId)
      }
      
      setSelectedBooks([])
      setTotalFine(0)
      setErrors({})
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to renew books')
    } finally {
      setIsRenewing(false)
    }
  }

  return (
    <div className="return-book">
      <div className="page-header">
        <h1>Return Book</h1>
        <p>Process book returns and calculate fines</p>
      </div>

      <div className="return-book-container">
        <div className="return-form-section">
          <div className="form-card">
            <h2>Book Return Form</h2>

            <form onSubmit={handleSubmit}>
              {/* User Search */}
              <div className="form-group">
                <label>Student/Staff ID</label>
                <div className="search-input">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="Enter user ID (roll number)"
                    value={formData.userId}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, userId: e.target.value }))
                      handleUserSearch(e.target.value)
                      // Clear ISBN results when searching by user
                      if (e.target.value) {
                        setIsbnSearchResults([])
                        setFormData(prev => ({ ...prev, isbn: '' }))
                      }
                    }}
                    className={errors.user ? 'error' : ''}
                  />
                  {userLoading && <div className="loading-spinner">Loading...</div>}
                </div>
                {errors.user && <span className="error-text">{errors.user}</span>}
              </div>

              {/* ISBN Search */}
              <div className="form-group">
                <label>OR Search by ISBN Number</label>
                <div className="search-input">
                  <BookOpen size={16} />
                  <input
                    type="text"
                    placeholder="Enter ISBN number to find all borrowers"
                    value={formData.isbn}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, isbn: e.target.value }))
                      handleIsbnSearch(e.target.value)
                      // Clear user results when searching by ISBN
                      if (e.target.value) {
                        setUserInfo(null)
                        setSelectedBooks([])
                        setFormData(prev => ({ ...prev, userId: '' }))
                      }
                    }}
                    className={errors.isbn ? 'error' : ''}
                  />
                  {isbnLoading && <div className="loading-spinner">Loading...</div>}
                </div>
                {errors.isbn && <span className="error-text">{errors.isbn}</span>}
              </div>

              {/* ISBN Search Results */}
              {isbnSearchResults.length > 0 && (
                <div className="isbn-search-results">
                  <div className="section-header">
                    <h3>Students with ISBN: {formData.isbn}</h3>
                    <span className="result-count">{isbnSearchResults.length} borrower(s) found</span>
                  </div>

                  <div className="isbn-results-grid">
                    {isbnSearchResults.map((book) => (
                      <div
                        key={book.circulation_id}
                        className={`isbn-result-card ${book.is_overdue ? 'overdue' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, userId: book.user.user_id, isbn: '' }))
                          setIsbnSearchResults([])
                          handleUserSearch(book.user.user_id)
                        }}
                      >
                        <div className="book-header">
                          <div className="book-status">
                            {book.is_overdue ? (
                              <div className="status-badge overdue">
                                <Clock size={12} />
                                Overdue
                              </div>
                            ) : (
                              <div className="status-badge on-time">
                                <CheckCircle size={12} />
                                On Time
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="book-details">
                          <h4>{book.title}</h4>
                          <p>by {book.author}</p>
                          <small>Access No: {book.access_no}</small>
                          <small>ISBN: {book.isbn}</small>
                        </div>

                        <div className="borrower-info">
                          <h5>Borrowed by:</h5>
                          <p><strong>{book.user.name}</strong></p>
                          <p>ID: {book.user.user_id}</p>
                          <p>{book.user.email}</p>
                          {book.user.college && (
                            <small>{book.user.college} - {book.user.department}</small>
                          )}
                        </div>

                        <div className="book-dates">
                          <div className="date-row">
                            <span>Issued: {new Date(book.issue_date).toLocaleDateString()}</span>
                          </div>
                          <div className="date-row">
                            <span>Due: {new Date(book.due_date).toLocaleDateString()}</span>
                          </div>
                          {book.is_overdue && (
                            <div className="overdue-info">
                              <span className="days-overdue">{book.days_overdue} days overdue</span>
                              {book.fine_amount > 0 && (
                                <span className="fine-amount">
                                  <IndianRupee size={12} />
                                  ₹{book.fine_amount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="isbn-result-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormData(prev => ({ ...prev, userId: book.user.user_id, isbn: '' }))
                              setIsbnSearchResults([])
                              handleUserSearch(book.user.user_id)
                            }}
                          >
                            Select This Student
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Books Selection */}
              {userInfo && userInfo.current_books.length > 0 && (
                <div className="books-selection-section">
                  <div className="section-header">
                    <h3>Select Books to Return</h3>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={selectAllBooks}
                    >
                      {selectedBooks.length === userInfo.current_books.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {errors.books && <span className="error-text">{errors.books}</span>}

                  <div className="books-grid">
                    {userInfo.current_books.map((book) => (
                      <div
                        key={book.circulation_id}
                        className={`book-card ${selectedBooks.some(b => b.circulation_id === book.circulation_id) ? 'selected' : ''} ${book.is_overdue ? 'overdue' : ''}`}
                        onClick={() => toggleBookSelection(book)}
                      >
                        <div className="book-header">
                          <div className="book-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedBooks.some(b => b.circulation_id === book.circulation_id)}
                              onChange={() => toggleBookSelection(book)}
                            />
                          </div>
                          <div className="book-status">
                            {book.is_overdue ? (
                              <div className="status-badge overdue">
                                <Clock size={12} />
                                Overdue
                              </div>
                            ) : (
                              <div className="status-badge on-time">
                                <CheckCircle size={12} />
                                On Time
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="book-details">
                          <h4>{book.title}</h4>
                          <p>by {book.author}</p>
                          <small>Access No: {book.access_no}</small>
                          {book.isbn && <small>ISBN: {book.isbn}</small>}
                        </div>

                        <div className="book-dates">
                          <div className="date-row">
                            <span>Issued: {new Date(book.issue_date).toLocaleDateString()}</span>
                          </div>
                          <div className="date-row">
                            <span>Due: {new Date(book.due_date).toLocaleDateString()}</span>
                          </div>
                          {book.is_overdue && (
                            <div className="overdue-info">
                              <span className="days-overdue">{book.days_overdue} days overdue</span>
                              {book.fine_amount > 0 && (
                                <span className="fine-amount">
                                  <IndianRupee size={12} />
                                  ₹{book.fine_amount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fine Summary */}
              {selectedBooks.length > 0 && totalFine > 0 && (
                <div className="fine-summary">
                  <div className="fine-header">
                    <IndianRupee size={20} />
                    <h3>Fine Summary</h3>
                  </div>
                  <div className="fine-details">
                    <p>Total Fine for Selected Books: <strong>₹{totalFine.toFixed(2)}</strong></p>
                    <small>Fine will be added to user's account upon return</small>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {userInfo && userInfo.current_books.length > 0 && (
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleRenewal}
                    disabled={isRenewing || selectedBooks.length === 0 || userInfo.total_fine > 0 || selectedBooks.some(book => book.is_overdue)}
                  >
                    <RotateCcw size={16} />
                    {isRenewing ? 'Renewing...' : `Renew ${selectedBooks.length} Book${selectedBooks.length !== 1 ? 's' : ''}`}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || selectedBooks.length === 0}
                  >
                    {isSubmitting ? 'Processing...' : `Return ${selectedBooks.length} Book${selectedBooks.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
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
                  <div className="status-badge info">
                    <Book size={16} />
                    {userInfo.current_books.length} Books
                  </div>
                </div>
              </div>

              {/* Current Fine Amount */}
              {userInfo.total_fine > 0 && (
                <div className="fine-alert">
                  <AlertCircle size={16} />
                  <span>Outstanding Fine: ₹{userInfo.total_fine.toFixed(2)}</span>
                </div>
              )}

              {/* Summary Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Book size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{userInfo.current_books.length}</span>
                    <span className="stat-label">Books Borrowed</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon overdue">
                    <Clock size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">
                      {userInfo.current_books.filter(book => book.is_overdue).length}
                    </span>
                    <span className="stat-label">Overdue Books</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon fine">
                    <IndianRupee size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">
                      ₹{userInfo.current_books.reduce((sum, book) => sum + (book.fine_amount || 0), 0).toFixed(2)}
                    </span>
                    <span className="stat-label">Pending Fines</span>
                  </div>
                </div>
              </div>

              {/* No Books Message */}
              {userInfo.current_books.length === 0 && (
                <div className="no-books-message">
                  <CheckCircle size={48} />
                  <h3>No Books to Return</h3>
                  <p>This user has no currently borrowed books.</p>
                </div>
              )}

              {/* Recent Returns */}
              {userInfo.borrowing_history.length > 0 && (
                <div className="section">
                  <h4>Recent Returns</h4>
                  <div className="history-list">
                    {userInfo.borrowing_history.filter(item => item.status === 'returned').slice(0, 3).map((item, index) => (
                      <div key={index} className="history-item">
                        <div className="book-info">
                          <strong>{item.book_title}</strong>
                          <span>by {item.author}</span>
                        </div>
                        <div className="history-dates">
                          <span>Returned: {new Date(item.return_date).toLocaleDateString()}</span>
                          {item.fine_amount > 0 && (
                            <span className="fine">Fine: ₹{item.fine_amount.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReturnBook
