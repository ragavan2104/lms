import React, { useState, useEffect } from 'react'
import { Plus, Upload, Download, Search, Edit, Trash2, Book, Tag, Settings } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const ManageBooks = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingBook, setEditingBook] = useState(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })
  const [editingCategory, setEditingCategory] = useState(null)
  const [showEditCategory, setShowEditCategory] = useState(false)

  const [formData, setFormData] = useState({
    access_no: '',
    call_no: '',
    title: '',
    author_1: '',
    author_2: '',
    author_3: '',
    author_4: '',
    publisher: '',
    department: '',
    category: '',
    location: '',
    number_of_copies: 1,
    isbn: '',
    pages: '',
    price: '',
    edition: ''
  })

  const [bulkFile, setBulkFile] = useState(null)

  useEffect(() => {
    fetchBooks()
  }, [currentPage, searchTerm])

  const fetchBooks = async () => {
    try {
      const response = await api.get('/admin/books', {
        params: {
          page: currentPage,
          per_page: 10,
          search: searchTerm
        }
      })
      setBooks(response.data.books)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/admin/books', formData)

      // Handle multiple copies response
      const { books_created, access_numbers, message } = response.data

      if (books_created > 1) {
        alert(`${message}\nAccess Numbers: ${access_numbers.join(', ')}`)
      } else {
        alert('Book added successfully!')
      }

      setShowAddForm(false)
      setFormData({
        access_no: '',
        call_no: '',
        title: '',
        author_1: '',
        author_2: '',
        author_3: '',
        author_4: '',
        publisher: '',
        department: '',
        category: '',
        location: '',
        number_of_copies: 1,
        isbn: '',
        pages: '',
        price: '',
        edition: ''
      })
      fetchBooks()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add book')
    }
  }

  const handleEdit = (book) => {
    setEditingBook(book)
    setFormData({
      access_no: book.access_no,
      call_no: book.call_no || '',
      title: book.title,
      author_1: book.author_1 || book.author || '',
      author_2: book.author_2 || '',
      author_3: book.author_3 || '',
      author_4: book.author_4 || '',
      publisher: book.publisher,
      department: book.department,
      category: book.category,
      location: book.location,
      number_of_copies: book.number_of_copies,
      isbn: book.isbn,
      pages: book.pages || '',
      price: book.price || '',
      edition: book.edition || ''
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/admin/books/${editingBook.id}`, formData)
      alert('Book updated successfully!')
      setShowEditForm(false)
      setEditingBook(null)
      setFormData({
        access_no: '',
        call_no: '',
        title: '',
        author_1: '',
        author_2: '',
        author_3: '',
        author_4: '',
        publisher: '',
        department: '',
        category: '',
        location: '',
        number_of_copies: 1,
        isbn: '',
        pages: '',
        price: '',
        edition: ''
      })
      fetchBooks()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update book')
    }
  }

  const handleDelete = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/books/${book.id}`)
        alert('Book deleted successfully!')
        fetchBooks()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete book')
      }
    }
  }

  const handleDeleteAllBooks = async () => {
    const confirmMessage = `⚠️ WARNING: This will permanently delete ALL books from the library!

This action will:
• Delete all ${books.length} book records
• Remove all circulation history
• Cannot be undone

Are you absolutely sure you want to proceed?`

    if (window.confirm(confirmMessage)) {
      const secondConfirm = window.confirm('This is your final warning! Click OK to continue with deletion.')

      if (secondConfirm) {
        const userInput = window.prompt('Type "DELETE ALL" to confirm (case sensitive):')

        if (userInput === 'DELETE ALL') {
          try {
            setLoading(true)
            const response = await api.delete('/admin/books/delete-all')
            alert(`✅ ${response.data.message}\nDeleted ${response.data.deleted_count} books.`)
            fetchBooks()
          } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete all books')
          } finally {
            setLoading(false)
          }
        } else {
          alert('Deletion cancelled. You must type "DELETE ALL" exactly to confirm.')
        }
      }
    }
  }

  const fetchNextAccessNumber = async () => {
    try {
      const response = await api.get('/admin/books/next-access-number')
      return response.data.next_access_number
    } catch (error) {
      console.error('Failed to fetch next access number:', error)
      return ''
    }
  }

  const handleAddBookClick = async () => {
    const nextAccessNumber = await fetchNextAccessNumber()
    setFormData(prev => ({
      ...prev,
      access_no: nextAccessNumber
    }))
    setShowAddForm(true)
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (!bulkFile) {
      toast.error('Please select a file')
      return
    }

    if (!formData.category) {
      toast.error('Please select a category for the books')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!allowedTypes.includes(bulkFile.type) && !bulkFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please select a valid Excel (.xlsx, .xls) or CSV file')
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append('file', bulkFile)
    formDataToSend.append('category', formData.category)

    console.log('FormData created with file:', bulkFile)
    console.log('File size:', bulkFile.size, 'bytes')
    console.log('Selected category:', formData.category)

    const loadingToast = toast.loading('Uploading books...')

    try {
      console.log('Uploading bulk books file:', bulkFile.name, 'Type:', bulkFile.type)

      const response = await api.post('/admin/books/bulk', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 second timeout for large files
      })

      console.log('Upload response received:', response)
      console.log('Upload response status:', response.status)
      console.log('Upload response data:', response.data)

      toast.dismiss(loadingToast)

      const { created_books, errors } = response.data

      console.log('Created books:', created_books)
      console.log('Errors:', errors)

      if (created_books && created_books.length > 0) {
        toast.success(`Successfully added ${created_books.length} books!`)

        if (errors && errors.length > 0) {
          console.warn('Upload errors:', errors)
          toast(`${errors.length} rows had errors. Check console for details.`, {
            icon: '⚠️',
            style: {
              background: '#FEF3C7',
              color: '#92400E',
            },
          })
        }
      } else {
        toast('No books were added. Please check your file format.', {
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        })
      }

      setShowBulkUpload(false)
      setBulkFile(null)
      setFormData(prev => ({ ...prev, category: '' }))
      fetchBooks()

    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Bulk upload error:', error)
      console.error('Error response data:', error.response?.data)
      console.error('Error response status:', error.response?.status)
      console.error('Error response headers:', error.response?.headers)

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Invalid file format or data'
        console.error('400 Error details:', errorMessage)
        toast.error(errorMessage)
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.')
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check if pandas is installed.')
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Upload timeout. Please try with a smaller file.')
      } else {
        toast.error(error.response?.data?.error || 'Failed to upload books')
      }
      // Reset form on error
      setShowBulkUpload(false)
      setBulkFile(null)
      setFormData(prev => ({ ...prev, category: '' }))
    }
  }

  const downloadSample = async () => {
    try {
      const response = await api.get('/admin/books/sample', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'books_sample.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Failed to download sample file')
    }
  }

  // Category management functions
  const fetchCategories = async (showLoading = false) => {
    if (showLoading) {
      setCategoriesLoading(true)
    }
    try {
      const response = await api.get('/admin/categories')
      const fetchedCategories = response.data.categories || []
      setCategories(fetchedCategories)

      // If no categories exist, provide some default ones for better UX
      if (fetchedCategories.length === 0) {
        console.log('No categories found. Consider adding default categories.')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      // Fallback to empty array if API fails
      setCategories([])
    } finally {
      if (showLoading) {
        setCategoriesLoading(false)
      }
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      alert('Category name is required')
      return
    }

    // Check if category already exists
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
    )
    if (existingCategory) {
      alert('A category with this name already exists')
      return
    }

    try {
      const response = await api.post('/admin/categories', newCategory)

      // Store the new category name before resetting
      const addedCategoryName = newCategory.name

      // Show success message
      alert(`Category "${addedCategoryName}" added successfully! It's now available in the book forms.`)

      // Reset form and close modal
      setNewCategory({ name: '', description: '' })
      setShowAddCategory(false)

      // Refresh categories list with loading indicator
      await fetchCategories(true)

      // Auto-select the new category in the form if Add Book form is open
      if (showAddForm) {
        setFormData(prev => ({ ...prev, category: addedCategoryName }))
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add category'
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description || ''
    })
    setShowEditCategory(true)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      alert('Category name is required')
      return
    }

    // Check if category name already exists (excluding current category)
    const existingCategory = categories.find(
      cat => cat.id !== editingCategory.id &&
      cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
    )
    if (existingCategory) {
      alert('A category with this name already exists')
      return
    }

    try {
      await api.put(`/admin/categories/${editingCategory.id}`, newCategory)

      alert(`Category "${newCategory.name}" updated successfully!`)

      // Reset form and close modal
      setNewCategory({ name: '', description: '' })
      setEditingCategory(null)
      setShowEditCategory(false)

      // Refresh categories list
      await fetchCategories(true)

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update category'
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleDeleteCategory = async (category) => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?\n\nThis action cannot be undone. Books using this category will need to be reassigned to other categories.`)) {
      return
    }

    try {
      await api.delete(`/admin/categories/${category.id}`)
      alert(`Category "${category.name}" deleted successfully!`)

      // Refresh categories list
      await fetchCategories(true)

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete category'
      alert(`Error: ${errorMessage}`)
    }
  }

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Helper function to validate category selection
  const validateCategorySelection = () => {
    if (!formData.category && categories.length > 0) {
      return 'Please select a category for the book'
    }
    if (categories.length === 0) {
      return 'No categories available. Please add a category first.'
    }
    return null
  }

  // Enhanced form submission with category validation
  const handleSubmitWithValidation = (e) => {
    e.preventDefault()

    const categoryError = validateCategorySelection()
    if (categoryError) {
      alert(categoryError)
      return
    }

    handleSubmit(e)
  }

  if (loading) {
    return <div className="loading">Loading books...</div>
  }

  return (
    <div className="manage-books">
      <div className="page-header">
        <div>
          <h1>Manage Books</h1>
          <p>Add and manage physical book collection</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleAddBookClick}
          >
            <Plus size={16} />
            Add Book
          </button>
          <button
            className="btn btn-success"
            onClick={() => setShowAddCategory(true)}
          >
            <Tag size={16} />
            Add Category
          </button>
          <button
            className="btn btn-info"
            onClick={() => setShowCategoryManagement(true)}
          >
            <Settings size={16} />
            Manage Categories
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowBulkUpload(true)}
          >
            <Upload size={16} />
            Bulk Upload
          </button>
          <button
            className="btn btn-secondary"
            onClick={downloadSample}
          >
            <Download size={16} />
            Sample Sheet
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteAllBooks}
            title="Delete all books from the library"
          >
            <Trash2 size={16} />
            Delete All Books
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Books Statistics */}
      {books.length > 0 && (
        <div className="books-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>{books.length}</h4>
              <p>Total Books</p>
            </div>
            <div className="stat-card">
              <h4>{books.reduce((sum, book) => sum + (book.number_of_copies || 0), 0)}</h4>
              <p>Total Copies</p>
            </div>
            
            <div className="stat-card">
              <h4>
                ₹{books.reduce((sum, book) => sum + (parseFloat(book.price) || 0), 0).toFixed(2)}
              </h4>
              <p>Total Value</p>
            </div>
            
          </div>
        </div>
      )}

      <div className="books-table">
        <table>
          <thead>
            <tr>
              <th>Access No</th>
              <th>Call No</th>
              <th>Title</th>
              <th>Authors</th>
              <th>Publisher</th>
              <th title="Book Edition">Edition</th>
              <th title="Number of Pages">Pages</th>
              <th title="Book Price">Price</th>
              <th>Category</th>
              <th title="Total Copies">Copies</th>
              <th title="Available Copies">Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.access_no}</td>
                <td>
                  <span
                    className="call-no-info"
                    title={book.call_no ? `Call Number: ${book.call_no}` : 'No call number assigned'}
                  >
                    {book.call_no || 'N/A'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Book size={16} color="#667eea" />
                    {book.title}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '500' }}>{book.author_1 || book.author}</div>
                    {book.author_2 && <div style={{ color: '#666', fontSize: '0.8rem' }}>+ {book.author_2}</div>}
                    {(book.author_3 || book.author_4) && <div style={{ color: '#666', fontSize: '0.8rem' }}>+ others</div>}
                  </div>
                </td>
                <td>{book.publisher || 'N/A'}</td>
                <td>
                  <span
                    className="edition-badge"
                    title={`Book Edition: ${book.edition || '1st Edition'}`}
                  >
                    {book.edition || '1st Edition'}
                  </span>
                </td>
                <td>
                  <span
                    className="pages-info"
                    title={book.pages ? `Total pages: ${book.pages}` : 'Page count not specified'}
                  >
                    {book.pages ? `${book.pages} pages` : 'N/A'}
                  </span>
                </td>
                <td>
                  <span
                    className="price-info"
                    title={book.price ? `Book price: ₹${parseFloat(book.price).toFixed(2)}` : 'Price not set'}
                  >
                    {book.price ? `₹${parseFloat(book.price).toFixed(2)}` : '₹0.00'}
                  </span>
                </td>
                <td>{book.category || 'Uncategorized'}</td>
                <td>{book.number_of_copies}</td>
                <td>{book.available_copies}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(book)}
                      title="Edit Book"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(book)}
                      title="Delete Book"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Add Book Modal */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Book</h2>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitWithValidation}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Access Number <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="access_no"
                    value={formData.access_no}
                    onChange={handleInputChange}
                    placeholder="Leave empty for auto-generation"
                  />
                  <small className="help-text">
                    Leave empty to auto-generate sequential access numbers.
                    {formData.number_of_copies > 1 && (
                      <span className="copies-info">
                        <br />Sequential numbers will be generated for all {formData.number_of_copies} copies.
                      </span>
                    )}
                  </small>
                </div>
                <div className="form-group">
                  <label>Call Number <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="call_no"
                    value={formData.call_no}
                    onChange={handleInputChange}
                    placeholder="e.g., QA76.73.P98, 004.1 SMI"
                    maxLength="100"
                  />
                  <small className="help-text">
                    Library classification number for cataloging (Dewey Decimal, Library of Congress, etc.)
                  </small>
                </div>
                <div className="form-group">
                  <label>Book Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author 1 <span className="required">*</span></label>
                  <input
                    type="text"
                    name="author_1"
                    value={formData.author_1}
                    onChange={handleInputChange}
                    placeholder="Primary author (required)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author 2 <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="author_2"
                    value={formData.author_2}
                    onChange={handleInputChange}
                    placeholder="Second author (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Author 3 <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="author_3"
                    value={formData.author_3}
                    onChange={handleInputChange}
                    placeholder="Third author (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Author 4 <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="author_4"
                    value={formData.author_4}
                    onChange={handleInputChange}
                    placeholder="Fourth author (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <div className="select-wrapper">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id || category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && (
                      <div className="loading-indicator">
                        <span>Refreshing categories...</span>
                      </div>
                    )}
                  </div>
                  {!categoriesLoading && categories.length === 0 && (
                    <small className="help-text">
                      No categories available.
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setShowAddCategory(true)}
                      >
                        Click here to add a category
                      </button>
                    </small>
                  )}
                  {!categoriesLoading && categories.length > 0 && (
                    <small className="help-text">
                      Don't see your category?
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setShowAddCategory(true)}
                      >
                        Add a new one
                      </button>
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Copies <span className="required">*</span></label>
                  <input
                    type="number"
                    name="number_of_copies"
                    value={formData.number_of_copies}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    placeholder="Enter number of physical copies"
                    required
                  />
                  <small className="help-text">
                    Each copy will be created as a separate book record with sequential access numbers.
                    {formData.number_of_copies > 1 && (
                      <span className="copies-info">
                        <br />Will create {formData.number_of_copies} individual book records.
                      </span>
                    )}
                  </small>
                </div>
                <div className="form-group">
                  <label>Pages <span className="required">*</span></label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Number of pages"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price <span className="required">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Book price (e.g., 29.99)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Edition <span className="required">*</span></label>
                  <input
                    type="text"
                    name="edition"
                    value={formData.edition}
                    onChange={handleInputChange}
                    placeholder="e.g., 1st Edition, 2nd Edition"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="International Standard Book Number"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Bulk Upload Books</h2>
              <button onClick={() => {
                setShowBulkUpload(false)
                setBulkFile(null)
                setFormData(prev => ({ ...prev, category: '' }))
              }}>×</button>
            </div>
            <form onSubmit={handleBulkUpload}>
              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <div className="select-wrapper">
                  <select
                    name="bulkCategory"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select a category for all books'}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id || category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoriesLoading && (
                    <div className="loading-indicator">
                      <span>Refreshing categories...</span>
                    </div>
                  )}
                </div>
                <small className="help-text">
                  This category will be applied to all books in the uploaded file.
                  {!categoriesLoading && categories.length === 0 && (
                    <span>
                      <br />No categories available.
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setShowAddCategory(true)}
                      >
                        Click here to add a category first
                      </button>
                    </span>
                  )}
                </small>
              </div>
              <div className="form-group">
                <label>Excel/CSV File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  required
                />
                <small>
                  Excel (.xlsx, .xls) or CSV file should contain columns: access_no, title, author_1, author_2, author_3, author_4, publisher, department, location, pages, price, edition, isbn
                  <br />
                  <strong>Required:</strong> access_no, title, author_1, publisher, price
                  <br />
                  <strong>Optional:</strong> author_2, author_3, author_4, department, location, pages, edition, isbn
                  <br />
                  <strong>Note:</strong> Category and number_of_copies are not needed in the file - category will be set from the dropdown above, and each row will create 1 book copy.
                </small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowBulkUpload(false)
                  setBulkFile(null)
                  setFormData(prev => ({ ...prev, category: '' }))
                }}>
                  Cancel
                </button>
                <button type="button" onClick={downloadSample} className="btn btn-secondary">
                  Download Sample
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Books
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Book</h2>
              <button onClick={() => {
                setShowEditForm(false)
                setEditingBook(null)
                setFormData({
                  access_no: '',
                  title: '',
                  author_1: '',
                  author_2: '',
                  author_3: '',
                  author_4: '',
                  publisher: '',
                  department: '',
                  category: '',
                  location: '',
                  number_of_copies: 1,
                  isbn: '',
                  pages: '',
                  price: '',
                  edition: ''
                })
              }}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Access Number</label>
                  <input
                    type="text"
                    name="access_no"
                    value={formData.access_no}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Call Number <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="call_no"
                    value={formData.call_no}
                    onChange={handleInputChange}
                    placeholder="e.g., QA76.73.P98, 004.1 SMI"
                    maxLength="100"
                  />
                  <small className="help-text">
                    Library classification number for cataloging
                  </small>
                </div>
                <div className="form-group">
                  <label>Book Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author 1 <span className="required">*</span></label>
                  <input
                    type="text"
                    name="author_1"
                    value={formData.author_1}
                    onChange={handleInputChange}
                    placeholder="Primary author (required)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author 2 <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="author_2"
                    value={formData.author_2}
                    onChange={handleInputChange}
                    placeholder="Second author (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Author 3 <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="author_3"
                    value={formData.author_3}
                    onChange={handleInputChange}
                    placeholder="Third author (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Author 4 <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    name="author_4"
                    value={formData.author_4}
                    onChange={handleInputChange}
                    placeholder="Fourth author (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <div className="select-wrapper">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id || category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && (
                      <div className="loading-indicator">
                        <span>Refreshing categories...</span>
                      </div>
                    )}
                  </div>
                  {!categoriesLoading && categories.length === 0 && (
                    <small className="help-text">
                      No categories available.
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setShowAddCategory(true)}
                      >
                        Click here to add a category
                      </button>
                    </small>
                  )}
                  {!categoriesLoading && categories.length > 0 && (
                    <small className="help-text">
                      Don't see your category?
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setShowAddCategory(true)}
                      >
                        Add a new one
                      </button>
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Copies</label>
                  <input
                    type="number"
                    name="number_of_copies"
                    value={1}
                    disabled
                    title="Each book record represents one physical copy"
                  />
                  <small className="help-text">
                    This record represents one physical copy. To add more copies, use the "Add Book" form.
                  </small>
                </div>
                <div className="form-group">
                  <label>Pages <span className="required">*</span></label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Number of pages"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price <span className="required">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Book price (e.g., 29.99)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Edition <span className="required">*</span></label>
                  <input
                    type="text"
                    name="edition"
                    value={formData.edition}
                    onChange={handleInputChange}
                    placeholder="e.g., 1st Edition, 2nd Edition"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="International Standard Book Number"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEditForm(false)
                  setEditingBook(null)
                  setFormData({
                    access_no: '',
                    title: '',
                    author_1: '',
                    author_2: '',
                    author_3: '',
                    author_4: '',
                    publisher: '',
                    department: '',
                    category: '',
                    location: '',
                    number_of_copies: 1,
                    isbn: '',
                    pages: '',
                    price: '',
                    edition: ''
                  })
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button onClick={() => setShowAddCategory(false)}>×</button>
            </div>
            {(showAddForm || showEditForm) && (
              <div className="modal-info">
                <p>After adding this category, it will automatically appear in your book form dropdown.</p>
              </div>
            )}
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name (e.g., Fiction, Science, History)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description (optional)"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCategory(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryManagement && (
        <div className="modal">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>Manage Categories</h2>
              <button onClick={() => setShowCategoryManagement(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="category-management-header">
                <p>Manage book categories. You can edit or delete existing categories.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddCategory(true)}
                >
                  <Plus size={16} />
                  Add New Category
                </button>
              </div>

              {categoriesLoading ? (
                <div className="loading">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="empty-state">
                  <p>No categories found. Add your first category to get started.</p>
                </div>
              ) : (
                <div className="categories-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td>
                            <strong>{category.name}</strong>
                          </td>
                          <td>
                            {category.description || <em>No description</em>}
                          </td>
                          <td>
                            {category.created_at
                              ? new Date(category.created_at).toLocaleDateString()
                              : 'N/A'
                            }
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEditCategory(category)}
                                title="Edit category"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteCategory(category)}
                                title="Delete category"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCategoryManagement(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategory && editingCategory && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button onClick={() => {
                setShowEditCategory(false)
                setEditingCategory(null)
                setNewCategory({ name: '', description: '' })
              }}>×</button>
            </div>
            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description (optional)"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditCategory(false)
                    setEditingCategory(null)
                    setNewCategory({ name: '', description: '' })
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageBooks
