import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  Filter,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ManageEbooks = () => {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEbook, setEditingEbook] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const ebookTypes = [
    'E-journal', 'E-book', 'E-journal Portal', 'E-journal Book', 'Database', 'Others'
  ]

  const [formData, setFormData] = useState({
    access_no: '',
    website: '',
    web_detail: '',
    web_title: '',
    subject: '',
    type: ''
  })

  useEffect(() => {
    fetchEbooks()
  }, [currentPage, searchTerm, selectedType])

  const fetchNextAccessNumber = async () => {
    try {
      const response = await api.get('/admin/ebooks/next-access-number')
      return response.data.next_access_number
    } catch (error) {
      console.error('Error fetching next access number:', error)
      return 'E1' // Default fallback
    }
  }

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        ...(selectedType && { type: selectedType })
      })

      console.log('Fetching e-books with params:', params.toString())
      const response = await api.get(`/admin/ebooks?${params}`)
      console.log('E-books response:', response.data)

      setEbooks(response.data.ebooks || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching e-books:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      // Show more specific error messages
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please login again.')
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.')
      } else if (error.response?.status === 404) {
        toast.error('E-books endpoint not found.')
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch e-books')
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      console.log('Submitting e-book data:', formData)

      if (editingEbook) {
        // Update existing e-book
        console.log('Updating e-book ID:', editingEbook.id)
        const response = await api.put(`/admin/ebooks/${editingEbook.id}`, formData)
        console.log('Update response:', response.data)
        toast.success('E-book updated successfully')
      } else {
        // Create new e-book
        console.log('Creating new e-book')
        const response = await api.post('/admin/ebooks', formData)
        console.log('Create response:', response.data)
        toast.success('E-book created successfully')
      }

      setShowModal(false)
      resetForm()
      fetchEbooks()
    } catch (error) {
      console.error('Error saving e-book:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      toast.error(error.response?.data?.error || 'Failed to save e-book')
    }
  }

  const handleEdit = (ebook) => {
    setEditingEbook(ebook)
    setFormData({
      access_no: ebook.access_no,
      website: ebook.website,
      web_detail: ebook.web_detail || '',
      web_title: ebook.web_title,
      subject: ebook.subject,
      type: ebook.type
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this e-book?')) {
      try {
        await api.delete(`/admin/ebooks/${id}`)
        toast.success('E-book deleted successfully')
        fetchEbooks()
      } catch (error) {
        console.error('Error deleting e-book:', error)
        toast.error('Failed to delete e-book')
      }
    }
  }

  const resetForm = async () => {
    const nextAccessNumber = await fetchNextAccessNumber()
    setFormData({
      access_no: nextAccessNumber,
      website: '',
      web_detail: '',
      web_title: '',
      subject: '',
      type: ''
    })
    setEditingEbook(null)
  }

  const getTypeColor = (type) => {
    const colors = {
      'E-journal': 'bg-blue-100 text-blue-800',
      'E-book': 'bg-green-100 text-green-800',
      'E-journal Portal': 'bg-purple-100 text-purple-800',
      'E-journal Book': 'bg-orange-100 text-orange-800',
      'Database': 'bg-red-100 text-red-800',
      'Others': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage E-books</h1>
            <p className="text-gray-600">Add, edit, and manage digital books and resources</p>
          </div>
          <button
            onClick={async () => {
              await resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add E-book
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, subject, access number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {ebookTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('')
                setCurrentPage(1)
              }}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* E-books List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading e-books...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <BookOpen size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No E-books Found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first e-book.</p>
            <button
              onClick={async () => {
                await resetForm()
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add E-book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {ebook.access_no}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ml-2 ${getTypeColor(ebook.type)}`}>
                          {ebook.type}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {ebook.download_count} visits
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {ebook.web_title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Subject:</strong> {ebook.subject}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate">{ebook.website}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {ebook.web_detail && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {ebook.web_detail}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Added {new Date(ebook.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(ebook)}
                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ebook.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEbook ? 'Edit E-book' : 'Add E-book'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Access Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Number *
                    </label>
                    <input
                      type="text"
                      name="access_no"
                      value={formData.access_no}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={editingEbook}
                    />
                  </div>

                  {/* Website URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Web Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Web Title *
                    </label>
                    <input
                      type="text"
                      name="web_title"
                      value={formData.web_title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Type</option>
                      {ebookTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Web Detail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Web Detail (Optional)
                    </label>
                    <textarea
                      name="web_detail"
                      value={formData.web_detail}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description or additional details about the resource..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingEbook ? 'Update' : 'Create'} E-book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageEbooks
