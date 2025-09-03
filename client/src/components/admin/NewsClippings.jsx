import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Calendar,
  Newspaper,
  Tag,
  Filter,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const NewsClippings = () => {
  const [clippings, setClippings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClipping, setEditingClipping] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNewsType, setSelectedNewsType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [newsTypes] = useState([
    'Politics', 'Sports', 'Technology', 'Education', 'Health',
    'Business', 'Entertainment', 'Science', 'Environment', 'Local News'
  ])

  const [formData, setFormData] = useState({
    clipping_no: '',
    newspaper_name: '',
    news_type: '',
    date: '',
    pages: '',
    news_title: '',
    news_subject: '',
    keywords: '',
    abstract: '',
    content: '',
    pdf_file: null
  })

  useEffect(() => {
    fetchClippings()
  }, [currentPage, searchTerm, selectedNewsType])

  const fetchClippings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        ...(selectedNewsType && { news_type: selectedNewsType })
      })

      const response = await api.get(`/admin/news-clippings?${params}`)
      setClippings(response.data.news_clippings)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching news clippings:', error)
      toast.error('Failed to fetch news clippings')
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        pdf_file: file
      }))
    } else {
      toast.error('Please select a PDF file')
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const submitData = new FormData()

      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'pdf_file' && formData[key]) {
          submitData.append('pdf_file', formData[key])
        } else if (key !== 'pdf_file' && formData[key]) {
          submitData.append(key, formData[key])
        }
      })

      if (editingClipping) {
        // Update existing clipping
        await api.put(`/admin/news-clippings/${editingClipping.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        toast.success('News clipping updated successfully')
      } else {
        // Create new clipping
        await api.post('/admin/news-clippings', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        toast.success('News clipping created successfully')
      }

      setShowModal(false)
      resetForm()
      fetchClippings()
    } catch (error) {
      console.error('Error saving news clipping:', error)
      toast.error(error.response?.data?.error || 'Failed to save news clipping')
    }
  }

  const handleEdit = (clipping) => {
    setEditingClipping(clipping)
    setFormData({
      clipping_no: clipping.clipping_no,
      newspaper_name: clipping.newspaper_name,
      news_type: clipping.news_type,
      date: clipping.date,
      pages: clipping.pages,
      news_title: clipping.news_title,
      news_subject: clipping.news_subject,
      keywords: clipping.keywords,
      abstract: clipping.abstract || '',
      content: clipping.content || '',
      pdf_file: null
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news clipping?')) {
      try {
        await api.delete(`/admin/news-clippings/${id}`)
        toast.success('News clipping deleted successfully')
        fetchClippings()
      } catch (error) {
        console.error('Error deleting news clipping:', error)
        toast.error('Failed to delete news clipping')
      }
    }
  }

  const handleDownload = async (id, fileName) => {
    try {
      const response = await api.get(`/news-clippings/${id}/download`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Download started')
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const resetForm = () => {
    setFormData({
      clipping_no: '',
      newspaper_name: '',
      news_type: '',
      date: '',
      pages: '',
      news_title: '',
      news_subject: '',
      keywords: '',
      abstract: '',
      content: '',
      pdf_file: null
    })
    setEditingClipping(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">News Clippings</h1>
            <p className="text-gray-600">Manage news articles and clippings</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add News Clipping
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, newspaper, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedNewsType}
              onChange={(e) => setSelectedNewsType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All News Types</option>
              {newsTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedNewsType('')
                setCurrentPage(1)
              }}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* News Clippings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading news clippings...</p>
          </div>
        ) : clippings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Newspaper size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No News Clippings Found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first news clipping.</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add News Clipping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clippings.map((clipping) => (
              <div key={clipping.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{clipping.clipping_no}
                        </span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded ml-2">
                          {clipping.news_type}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {clipping.download_count} downloads
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {clipping.news_title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Subject:</strong> {clipping.news_subject}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Newspaper:</strong> {clipping.newspaper_name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(clipping.date)}
                      </span>
                      <span>Pages: {clipping.pages}</span>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {clipping.keywords.split(',').slice(0, 3).map((keyword, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {keyword.trim()}
                        </span>
                      ))}
                      {clipping.keywords.split(',').length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{clipping.keywords.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">File:</span>
                      <span className="font-medium text-gray-900">{clipping.pdf_file_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-900">{clipping.pdf_file_size}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Added {formatDate(clipping.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(clipping.id, clipping.pdf_file_name)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(clipping)}
                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(clipping.id)}
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
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingClipping ? 'Edit News Clipping' : 'Add News Clipping'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Clipping Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clipping Number *
                    </label>
                    <input
                      type="text"
                      name="clipping_no"
                      value={formData.clipping_no}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={editingClipping}
                    />
                  </div>

                  {/* Newspaper Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Newspaper Name *
                    </label>
                    <input
                      type="text"
                      name="newspaper_name"
                      value={formData.newspaper_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* News Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      News Type *
                    </label>
                    <select
                      name="news_type"
                      value={formData.news_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select News Type</option>
                      {newsTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Pages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pages *
                    </label>
                    <input
                      type="text"
                      name="pages"
                      value={formData.pages}
                      onChange={handleInputChange}
                      placeholder="e.g., 1-3 or 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* PDF File */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PDF File *
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!editingClipping}
                    />
                    {editingClipping && (
                      <p className="text-sm text-gray-500 mt-1">
                        Leave empty to keep current file
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="mt-6 space-y-6">
                  {/* News Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      News Title *
                    </label>
                    <input
                      type="text"
                      name="news_title"
                      value={formData.news_title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* News Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      News Subject *
                    </label>
                    <input
                      type="text"
                      name="news_subject"
                      value={formData.news_subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords *
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="Separate keywords with commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Abstract */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Abstract (Optional)
                    </label>
                    <textarea
                      name="abstract"
                      value={formData.abstract}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content (Optional)
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    {editingClipping ? 'Update' : 'Create'} News Clipping
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

export default NewsClippings
