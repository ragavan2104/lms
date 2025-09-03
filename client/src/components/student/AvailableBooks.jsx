import React, { useState, useEffect, Fragment } from 'react';
import { Book, Search, Filter, Building, User, Calendar, Hash } from 'lucide-react';
import axios from 'axios';
// Assuming InlineBookDetails is in the same directory or correctly imported
import InlineBookDetails from './InlineBookDetails'; // Make sure this path is correct
import ReservationModal from './ReservationModal';

const AvailableBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    availability: 'available'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 12;

  // Book Details Modal State
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Reservation Modal State
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedBookForReservation, setSelectedBookForReservation] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [currentPage, searchTerm, filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/student/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to empty array if API fails
      setCategories([]);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: booksPerPage,
        search: searchTerm,
        ...filters
      });

      const response = await axios.get(`/student/books?${params.toString()}`);
      setBooks(response.data.books);
      setTotalPages(Math.ceil(response.data.total / booksPerPage));
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Book Details Modal handlers
  const handleBookClick = (bookId) => {
    setSelectedBookId(bookId);
    setIsBookDetailsOpen(true);
  };

  const handleCloseBookDetails = () => {
    setIsBookDetailsOpen(false);
    setSelectedBookId(null);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Open reservation modal
  const handleReserveBook = (book) => {
    setSelectedBookForReservation(book);
    setShowReservationModal(true);
  };

  // Confirm reservation with pickup date
  const handleConfirmReservation = async (reservationData, onError) => {
    if (!selectedBookForReservation) return;

    setReservationLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/student/books/${selectedBookForReservation.id}/reserve`,
        reservationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showNotification('Book reserved successfully!', 'success');
      setShowReservationModal(false);
      setSelectedBookForReservation(null);
      fetchBooks(); // Refresh books list

    } catch (error) {
      // Call the error callback if provided (for availability date errors)
      if (onError && error.response?.data?.earliest_available_date) {
        onError(error);
      } else {
        const message = error.response?.data?.error || 'Failed to reserve book';
        showNotification(message, 'error');
      }
    } finally {
      setReservationLoading(false);
    }
  };

  // Renewal handler (for borrowed books)
  const handleRenewBook = async (circulationId) => {
    try {
      const token = localStorage.getItem('token');
      // This path is also handled by the proxy
      await axios.post(`http://localhost:5000/api/student/circulations/${circulationId}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showNotification('Book renewed successfully!', 'success');
      fetchBooks(); // Refresh books list

    } catch (error) {
      const message = error.response?.data?.error || 'Failed to renew book';
      showNotification(message, 'error');
    }
  };

  const getAvailabilityStatus = (book) => {
    if (book.available_copies > 0) {
      return { status: 'available', text: `${book.available_copies} available` };
    } else {
      return { status: 'unavailable', text: 'Not available' };
    }
  };

  return (
    <div className="available-books">
      <div className="page-header">
        <div>
          <h1>Available Books</h1>
          <p>Browse and discover books in our library collection</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search size={20} />
        </div>
        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
            >
              <option value="all">All Books</option>
              <option value="available">Available Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="books-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="no-data">
            <Book size={48} />
            <h3>No Books Found</h3>
            <p>No books match your search criteria. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book, index) => {
              const availability = getAvailabilityStatus(book);
              return (
                <Fragment key={book.id}>
                  <div
                    className="book-card clickable"
                    onClick={() => handleBookClick(book.id)}
                  >
                    <div className="book-header">
                      <div className="book-icon">
                        <Book size={24} />
                      </div>
                      <div className={`availability-badge ${availability.status}`}>
                        {availability.text}
                      </div>
                    </div>

                    <div className="book-content">
                      <h3 className="book-title">{book.title}</h3>
                      <div className="book-details">
                        <div className="detail-item">
                          <User size={14} />
                          <span>{book.author}</span>
                        </div>
                        <div className="detail-item">
                          <Hash size={14} />
                          <span>Access No: {book.access_no}</span>
                        </div>
                        {book.isbn && (
                          <div className="detail-item">
                            <Hash size={14} />
                            <span>ISBN: {book.isbn}</span>
                          </div>
                        )}
                        <div className="detail-item">
                          <Building size={14} />
                          <span>{book.category || 'General'}</span>
                        </div>
                        <div className="detail-item">
                          <Calendar size={14} />
                          <span>Added: {new Date(book.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="book-footer">
                      <div className="copies-info">
                        <span>Total Copies: {book.number_of_copies}</span>
                        <span>Available: {book.available_copies}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inline Book Details */}
                  {selectedBookId === book.id && (
                    <InlineBookDetails
                      bookId={selectedBookId}
                      isOpen={isBookDetailsOpen}
                      onClose={handleCloseBookDetails}
                      onReserve={handleReserveBook}
                      onRenew={handleRenewBook}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? 'active' : ''}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            ×
          </button>
        </div>
      )}

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false);
          setSelectedBookForReservation(null);
        }}
        book={selectedBookForReservation}
        onConfirm={handleConfirmReservation}
        loading={reservationLoading}
      />
    </div>
  );
};

export default AvailableBooks;