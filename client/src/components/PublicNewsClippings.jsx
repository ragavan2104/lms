import React, { useState, useEffect } from 'react'
import {
  Search,
  Download,
  FileText,
  Calendar,
  Newspaper,
  Tag,
  Filter,
  ArrowLeft,
  ExternalLink,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getApiBaseUrl } from '../utils/apiConfig'

const PublicNewsClippings = () => {
  const [clippings, setClippings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNewsType, setSelectedNewsType] = useState('')
  const [newsTypes, setNewsTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
      setClippings([])
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

  const handleDownload = (id, fileName) => {
    toast.error('Please login to download news clippings', {
      duration: 3000,
      icon: '🔒',
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a 
                href="/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to OPAC
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">News Clippings</h1>
            </div>
            <a 
              href="/login" 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Login to Download
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Newspaper className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">News Clippings Archive</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our collection of news articles and clippings from various newspapers and publications
          </p>
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

                  {/* Abstract */}
                  {clipping.abstract && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {clipping.abstract}
                      </p>
                    </div>
                  )}

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
                    <button
                      onClick={() => handleDownload(clipping.id, clipping.pdf_file_name)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
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

        {/* Login Prompt */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Want to Download News Clippings?</h3>
            <p className="text-blue-700 mb-4">
              Login to your account to download news clippings and access additional features.
            </p>
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Login Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicNewsClippings
