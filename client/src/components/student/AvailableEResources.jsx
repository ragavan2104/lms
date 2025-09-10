import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  Eye,
  Globe,
  X,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const AvailableEResources = () => {
  const navigate = useNavigate()
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [ebookTypes, setEbookTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEbook, setSelectedEbook] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleBack = () => {
    navigate('/student/dashboard')
  }

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
      console.error('Error fetching e-resources:', error)
      toast.error('Failed to fetch e-resources')
      setEbooks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEbookTypes = async () => {
    try {
      const response = await api.get('/public/ebooks/types')
      setEbookTypes(response.data.ebook_types)
    } catch (error) {
      console.error('Error fetching e-resource types:', error)
      setEbookTypes([])
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchEbooks()
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEbookClick = (ebook) => {
    setSelectedEbook(ebook)
    setShowDetails(true)
  }

  const handleAccessEbook = (url) => {
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.error('E-resource URL not available')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-white hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <Globe className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold text-gray-900">Browse E-Resources</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search e-resources by title, author, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400" size={16} />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {ebookTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading e-resources...</span>
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-12">
            <Globe size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No e-resources found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all e-resources.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {ebooks.length} E-Resource{ebooks.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {ebooks.map((ebook) => (
                <div key={ebook.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {ebook.type}
                      </span>
                      <div className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {ebook.access_no}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {ebook.web_title}
                    </h3>

                    <div className="text-gray-600 mb-4">
                      <p className="text-sm">Subject: {ebook.subject}</p>
                    </div>

                    {ebook.web_detail && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {ebook.web_detail}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => handleEbookClick(ebook)}
                        className="flex items-center space-x-2 text-white hover:text-blue-700 transition-colors"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium text-white">View Details</span>
                      </button>
                      {ebook.website && (
                        <button
                          onClick={() => handleAccessEbook(ebook.website)}
                          className="flex items-center space-x-2 text-white hover:text-green-700 transition-colors"
                        >
                          <ExternalLink size={16} />
                          <span className="text-sm font-medium ">Access</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* E-Resource Details Modal */}
      {showDetails && selectedEbook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedEbook.web_title}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Access Number</h3>
                  <p className="text-gray-900">{selectedEbook.access_no}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                  <p className="text-gray-900">{selectedEbook.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
                  <p className="text-gray-900">{selectedEbook.subject}</p>
                </div>
                {selectedEbook.download_count && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Access Count</h3>
                    <p className="text-gray-900">{selectedEbook.download_count}</p>
                  </div>
                )}
              </div>

              {selectedEbook.web_detail && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedEbook.web_detail}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              {selectedEbook.website && (
                <button
                  onClick={() => handleAccessEbook(selectedEbook.website)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <ExternalLink size={16} />
                  <span>Access E-Resource</span>
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AvailableEResources
