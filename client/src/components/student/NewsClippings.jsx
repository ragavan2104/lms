import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Download,
  FileText,
  Calendar,
  Newspaper,
  Tag,
  Filter,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getApiBaseUrl } from '../../utils/apiConfig'
import api from '../../services/api'

const StudentNewsClippings = () => {
  const navigate = useNavigate()
  const [clippings, setClippings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNewsType, setSelectedNewsType] = useState('')
  const [newsTypes, setNewsTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedClipping, setSelectedClipping] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleBack = () => {
    navigate('/student/dashboard')
  }

  useEffect(() => {
    fetchClippings()
    fetchNewsTypes()
  }, [currentPage, searchTerm, selectedNewsType])

  const fetchClippings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        ...(selectedNewsType && { news_type: selectedNewsType })
      })

      const response = await fetch(`${getApiBaseUrl()}/public/news-clippings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setClippings(data.news_clippings)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching news clippings:', error)
      toast.error('Failed to fetch news clippings')
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsTypes = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/public/news-clippings/types`)
      if (response.ok) {
        const data = await response.json()
        setNewsTypes(data.news_types)
      }
    } catch (error) {
      console.error('Error fetching news types:', error)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const showClippingDetails = (clipping) => {
    setSelectedClipping(clipping)
    setShowDetails(true)
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
              <Newspaper className="text-orange-600" size={24} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">News Clippings</h1>
                <p className="text-sm text-gray-600">Browse and download news articles and clippings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
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

        {/* News Clippings Grid */}
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
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        onClick={() => showClippingDetails(clipping)}
                        className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(clipping.id, clipping.pdf_file_name)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
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
      </div>
    </div>
  )
}

export default StudentNewsClippings
