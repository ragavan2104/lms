import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Grid,
  List,
  Book,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Eye,
  ChevronRight,
  Menu,
  X,
  FileText
} from 'lucide-react'
import axios from 'axios'
import './OPAC.css'
import { getApiBaseUrl } from '../utils/apiConfig'

// Create axios instance for public API calls (no auth required)
const publicApi = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const OPAC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showBookDetails, setShowBookDetails] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Advanced search filters
  const [filters, setFilters] = useState({
    author: '',
    isbn: '',
    department: '',
    availability: 'all' // 'all', 'available', 'unavailable'
  })

  // Fetch categories on component mount (no initial books)
  useEffect(() => {
    fetchCategories()
  }, [])



  const fetchBooks = async (searchTerm = '', categoryFilter = '', advancedFilters = {}) => {
    setLoading(true)

    // Check if we have any search criteria
    const hasSearchCriteria = searchTerm || categoryFilter || Object.values(advancedFilters).some(v => v && v !== 'all')
    setIsSearching(hasSearchCriteria)
    setHasSearched(true) // Mark that a search has been performed

    try {
      let url = '/books/search'  // Remove /api prefix since it's added by axios baseURL
      const params = new URLSearchParams()

      // Set per_page for search results
      params.append('per_page', '50')

      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter) params.append('category', categoryFilter)
      if (advancedFilters.author) params.append('author', advancedFilters.author)
      if (advancedFilters.isbn) params.append('isbn', advancedFilters.isbn)
      if (advancedFilters.department) params.append('department', advancedFilters.department)
      if (advancedFilters.availability && advancedFilters.availability !== 'all') {
        params.append('availability', advancedFilters.availability)
      }

      url += `?${params.toString()}`

      console.log('Fetching books from:', url) // Debug log
      const response = await publicApi.get(url)
      console.log('Books response:', response.data) // Debug log
      setBooks(response.data.books || [])
    } catch (error) {
      console.error('Failed to fetch books:', error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await publicApi.get('/categories/public')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim() || selectedCategory || Object.values(filters).some(v => v && v !== 'all')) {
      fetchBooks(searchQuery, selectedCategory, filters)
    } else {
      // If no search criteria, clear results and show empty state
      setBooks([])
      setHasSearched(false)
      setIsSearching(false)
    }
  }

  const handleAdvancedSearch = () => {
    fetchBooks(searchQuery, selectedCategory, filters)
    setShowAdvancedSearch(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setFilters({
      author: '',
      isbn: '',
      department: '',
      availability: 'all'
    })
    setBooks([])
    setHasSearched(false)
    setIsSearching(false)
  }

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName)
    fetchBooks(searchQuery, categoryName, filters)
  }

  const handleBookClick = (book) => {
    setSelectedBook(book)
    setShowBookDetails(true)
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <div className="opac">
      {/* Header */}
      <header className="opac-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="library-logo">
                <Book size={32} />
                <div className="logo-text">
                  <h1>Library OPAC</h1>
                  <p>Online Public Access Catalog</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <a href="#catalog" className="nav-link">Catalog</a>
              <a href="/question-banks" className="nav-link">Question Banks</a>
              <a href="/e-resources" className="nav-link">E-Resources</a>
              <a href="/news-clippings" className="nav-link">News Clippings</a>
              <a href="/thesis" className="nav-link">Thesis</a>
              <a href="/journals" className="nav-link">Journals</a>
            </nav>

            {/* Login Button */}
            <div className="header-actions">
              <button className="btn btn-primary " onClick={handleLoginClick}>
                <User size={16} />
               Login
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-toggle"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <nav className="mobile-nav">
              <a href="#catalog" className="mobile-nav-link">Catalog</a>
              <a href="/question-banks" className="mobile-nav-link">Question Banks</a>
              <a href="/e-resources" className="mobile-nav-link">E-Resources</a>
              <a href="/news-clippings" className="mobile-nav-link">News Clippings</a>
              <a href="/thesis" className="mobile-nav-link">Thesis</a>
              <a href="/journals" className="mobile-nav-link">Journals</a>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h2>Discover Our Collection</h2>
            <p>Search through thousands of books, journals, and digital resources</p>
            
            {/* Main Search Bar */}
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search by title, author, ISBN, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-icon-button">
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => setShowAdvancedSearch(true)}
              >
                <Filter size={16} />
                Advanced Search
              </button>
              <button
                className="quick-action-btn"
                onClick={() => fetchBooks('', '', {})}
              >
                <Book size={16} />
                Browse All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories-section">
        <div className="container">
          <h3>Browse by Category</h3>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.name)}
              >
                <Book size={24} />
                <span>{category.name}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results / Catalog */}
      <section id="catalog" className="catalog-section">
        <div className="container">
          <div className="catalog-header">
            <div className="catalog-title">
              <h3>
                {hasSearched && (searchQuery || selectedCategory || Object.values(filters).some(v => v && v !== 'all'))
                  ? `Search Results ${selectedCategory ? `in ${selectedCategory}` : ''}`
                  : hasSearched
                  ? 'Search Results'
                  : 'Library Catalog'
                }
              </h3>
              {hasSearched && (
                <span className="results-count">
                  {books.length} book{books.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            {/* Search Status and Clear Button */}
            {hasSearched && (searchQuery || selectedCategory || Object.values(filters).some(v => v && v !== 'all')) && (
              <div className="search-status">
                {searchQuery && (
                  <span className="search-term">
                    Searching for: "<strong>{searchQuery}</strong>"
                  </span>
                )}
                <button onClick={clearSearch} className="clear-search-btn">
                  <X size={16} />
                  Clear Search
                </button>
              </div>
            )}

            {/* Browse All Books Button when search has been performed */}
            {hasSearched && (
              <div className="show-all-section">
                <button
                  onClick={() => fetchBooks('', '', {})}
                  className="show-all-btn"
                >
                  Browse All Books
                </button>
              </div>
            )}
            
            <div className="catalog-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Searching books...</p>
            </div>
          )}

          {/* Books Display */}
          {!loading && (
            <div className={`books-container ${viewMode}`}>
              {books.length > 0 ? (
                // Display search results
                books.map((book) => (
                  <div
                    key={book.id}
                    className="book-card"
                    onClick={() => handleBookClick(book)}
                  >
                    <div className="book-cover">
                      <Book size={48} />
                    </div>
                    <div className="book-info">
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-author">by {book.author}</p>
                      <p className="book-category">{book.category}</p>
                      <div className="book-availability">
                        <span className={`availability-badge ${book.available_copies > 0 ? 'available' : 'unavailable'}`}>
                          {book.available_copies > 0
                            ? `${book.available_copies} available`
                            : 'Not available'
                          }
                        </span>
                      </div>
                      {viewMode === 'list' && (
                        <div className="book-details-preview">
                          <p><strong>Publisher:</strong> {book.publisher}</p>
                          <p><strong>Location:</strong> {book.location}</p>
                          <p><strong>Access No:</strong> {book.access_no}</p>
                          {book.call_no && <p><strong>Call No:</strong> {book.call_no}</p>}
                        </div>
                      )}
                    </div>
                    <button className="view-details-btn">
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                // No results found after search
                <div className="no-results">
                  <Book size={64} />
                  <h4>No books found</h4>
                  <p>Try adjusting your search terms or browse by category</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Question Banks Section */}
      <section id="question-banks" className="question-banks-section">
        <div className="container">
          <div className="section-header">
            <h3>Question Banks</h3>
            <p>Access question papers and study materials for various subjects</p>
          </div>

          <div className="qb-features">
            <div className="qb-feature-card">
              <div className="qb-feature-icon">
                <FileText size={32} />
              </div>
              <h4>Download Question Papers</h4>
              <p>Access previous year question papers for all subjects and departments</p>
            </div>

            <div className="qb-feature-card">
              <div className="qb-feature-icon">
                <Search size={32} />
              </div>
              <h4>Search by Subject</h4>
              <p>Find question papers by subject name, code, or regulation</p>
            </div>

            <div className="qb-feature-card">
              <div className="qb-feature-icon">
                <Book size={32} />
              </div>
              <h4>Organized by Department</h4>
              <p>Browse question papers organized by college and department</p>
            </div>
          </div>

          <div className="qb-cta">
            <p>Browse and explore question papers from various departments</p>
            <div className="flex gap-4 justify-center">
              <a href="/question-banks" className="btn btn-primary">
                Browse Question Banks
              </a>
              <button className="btn btn-secondary" onClick={handleLoginClick}>
                Login to Download
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h3>About Our Library</h3>
              <p>
                Welcome to our digital library catalog. Browse our collection of books
                and resources across various subjects and disciplines.
              </p>
              <div className="library-stats">
                <div className="stat">
                  <h4>1000+</h4>
                  <p>Books Available</p>
                </div>
                <div className="stat">
                  <h4>{categories.length}</h4>
                  <p>Categories</p>
                </div>
                <div className="stat">
                  <h4>24/7</h4>
                  <p>Online Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h3>Contact Information</h3>
          <div className="contact-grid">
            <div className="contact-card">
              <MapPin size={24} />
              <h4>Address</h4>
              <p>123 University Avenue<br />Academic City, AC 12345</p>
            </div>
            <div className="contact-card">
              <Phone size={24} />
              <h4>Phone</h4>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="contact-card">
              <Mail size={24} />
              <h4>Email</h4>
              <p>library@university.edu</p>
            </div>
            <div className="contact-card">
              <Clock size={24} />
              <h4>Hours</h4>
              <p>Mon-Fri: 8:00 AM - 10:00 PM<br />Sat-Sun: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="opac-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#catalog">Search Catalog</a></li>
                <li><a href="#categories">Browse Categories</a></li>
                <li><a href="#about">About Library</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Book Reservations</a></li>
                <li><a href="#">Digital Resources</a></li>
                <li><a href="#">Research Assistance</a></li>
                <li><a href="#">Study Spaces</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Policies</h4>
              <ul>
                <li><a href="#">Borrowing Policy</a></li>
                <li><a href="#">Late Fees</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Use</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 University Library. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Advanced Search</h3>
              <button onClick={() => setShowAdvancedSearch(false)}>×</button>
            </div>
            <div className="advanced-search-form">
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  value={filters.author}
                  onChange={(e) => setFilters({...filters, author: e.target.value})}
                  placeholder="Enter author name"
                />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={filters.isbn}
                  onChange={(e) => setFilters({...filters, isbn: e.target.value})}
                  placeholder="Enter ISBN"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  placeholder="Enter department"
                />
              </div>
              <div className="form-group">
                <label>Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({...filters, availability: e.target.value})}
                >
                  <option value="all">All Books</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAdvancedSearch(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdvancedSearch}>
                Search
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <div className="modal">
          <div className="modal-content book-details-modal">
            <div className="modal-header">
              <h3>Book Details</h3>
              <button onClick={() => setShowBookDetails(false)}>×</button>
            </div>
            <div className="book-details-content">
              <div className="book-details-cover">
                <Book size={80} />
              </div>
              <div className="book-details-info">
                <h4>{selectedBook.title}</h4>
                <p className="book-author">by {selectedBook.author}</p>
                <div className="book-meta">
                  <div className="meta-item">
                    <strong>Category:</strong> {selectedBook.category}
                  </div>
                  <div className="meta-item">
                    <strong>Publisher:</strong> {selectedBook.publisher}
                  </div>
                  <div className="meta-item">
                    <strong>ISBN:</strong> {selectedBook.isbn || 'N/A'}
                  </div>
                  <div className="meta-item">
                    <strong>Location:</strong> {selectedBook.location}
                  </div>
                  <div className="meta-item">
                    <strong>Access Number:</strong> {selectedBook.access_no}
                  </div>
                  <div className="meta-item">
                    <strong>Total Copies:</strong> {selectedBook.number_of_copies}
                  </div>
                  <div className="meta-item">
                    <strong>Available:</strong>
                    <span className={`availability-badge ${selectedBook.available_copies > 0 ? 'available' : 'unavailable'}`}>
                      {selectedBook.available_copies > 0
                        ? `${selectedBook.available_copies} copies`
                        : 'Not available'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowBookDetails(false)}>
                Close
              </button>
              {selectedBook.available_copies > 0 && (
                <button className="btn btn-primary" onClick={handleLoginClick}>
                  Login to Reserve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OPAC
