import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  Eye,
  Globe,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const AvailableEbooks = () => {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [ebookTypes, setEbookTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEbook, setSelectedEbook] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchEbooks()
    fetchEbookTypes()
  }, [currentPage, searchTerm, selectedType])

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        ...(selectedType && { type: selectedType })
      })

      const response = await api.get(`/public/ebooks?${params}`)
      setEbooks(response.data.ebooks)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching e-books:', error)
      toast.error('Failed to fetch e-books')
    } finally {
      setLoading(false)
    }
  }

  const fetchEbookTypes = async () => {
    try {
      const response = await api.get('/public/ebooks/types')
      setEbookTypes(response.data.ebook_types)
    } catch (error) {
      console.error('Error fetching e-book types:', error)
    }
  }

  const handleVisit = async (ebook) => {
    try {
      // Track the visit
      await api.post(`/ebooks/${ebook.id}/visit`)

      // Open the website in a new tab
      window.open(ebook.website, '_blank')

      toast.success('Website opened in new tab')
    } catch (error) {
      console.error('Error tracking visit:', error)
      // Still open the website even if tracking fails
      window.open(ebook.website, '_blank')
    }
  }

  const showEbookDetails = (ebook) => {
    setSelectedEbook(ebook)
    setShowDetails(true)
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">E-books & Digital Resources</h1>
          <p className="text-gray-600">Browse and access our digital library collection</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
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

        {/* E-books Grid */}
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
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <Globe className="w-3 h-3" />
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
                        onClick={() => showEbookDetails(ebook)}
                        className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleVisit(ebook)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit
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

        {/* Details Modal */}
        {showDetails && selectedEbook && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">E-book Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Access Number</label>
                    <p className="text-gray-900">{selectedEbook.access_no}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="text-gray-900">{selectedEbook.web_title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-gray-900">{selectedEbook.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={`inline-block px-2 py-1 rounded text-sm ${getTypeColor(selectedEbook.type)}`}>
                      {selectedEbook.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <p className="text-blue-600 break-all">{selectedEbook.website}</p>
                  </div>
                  {selectedEbook.web_detail && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{selectedEbook.web_detail}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleVisit(selectedEbook)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailableEbooks
