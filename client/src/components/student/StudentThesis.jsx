import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Download,
  FileText,
  Calendar,
  Building,
  GraduationCap,
  Tag,
  Filter,
  Eye,
  User,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const StudentThesis = () => {
  const navigate = useNavigate()
  const [thesis, setThesis] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollege, setSelectedCollege] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [thesisTypes, setThesisTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedThesis, setSelectedThesis] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleBack = () => {
    navigate('/student/dashboard')
  }

  useEffect(() => {
    fetchThesis()
    fetchColleges()
    fetchDepartments()
    fetchThesisTypes()
  }, [currentPage, searchTerm, selectedCollege, selectedDepartment, selectedType])

  const fetchThesis = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        ...(selectedCollege && { college_id: selectedCollege }),
        ...(selectedDepartment && { department_id: selectedDepartment }),
        ...(selectedType && { type: selectedType })
      })

      // Use public endpoint instead of protected student endpoint
      const response = await fetch(`http://localhost:5000/api/public/thesis?${params}`)
      if (response.ok) {
        const data = await response.json()
        setThesis(data.thesis || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching thesis:', error)
      toast.error('Failed to fetch thesis')
      setThesis([])
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/public/colleges')
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges)
      }
    } catch (error) {
      console.error('Error fetching colleges:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/public/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchThesisTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/public/thesis/types')
      if (response.ok) {
        const data = await response.json()
        setThesisTypes(data.thesis_types || [])
      }
    } catch (error) {
      console.error('Error fetching thesis types:', error)
      setThesisTypes([])
    }
  }

  const handleDownload = async (id, title) => {
    try {
      // Use public download endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/api/public/thesis/${id}/download`, {
        method: 'GET',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${title}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        toast.success('Download started')
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
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

  const showThesisDetails = (thesisItem) => {
    setSelectedThesis(thesisItem)
    setShowDetails(true)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCollege('')
    setSelectedDepartment('')
    setSelectedType('')
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchThesis()
  }

  const ThesisCard = ({ thesisItem }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center text-indigo-600 mb-2">
            <FileText className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">{thesisItem.type}</span>
          </div>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
            {thesisItem.type}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {thesisItem.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Tag className="w-4 h-4 mr-2" />
            <span>#{thesisItem.thesis_number}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <User className="w-4 h-4 mr-2" />
            <span>{thesisItem.author}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>Guide: {thesisItem.project_guide}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Building className="w-4 h-4 mr-2" />
            <span>{thesisItem.college_name}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>{thesisItem.department_name}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(thesisItem.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={() => showThesisDetails(thesisItem)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>
          
          {thesisItem.pdf_file_name && (
            <button
              onClick={() => handleDownload(thesisItem.id, thesisItem.title)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const Pagination = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-white hover:text-gray-900 transition-colors mr-6"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Thesis Collection</h1>
                  <p className="text-gray-600">Browse and download academic thesis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Search & Filter</h3>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Colleges</option>
                  {colleges && colleges.map(college => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments && departments.map(department => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {thesisTypes && thesisTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : thesis.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No thesis found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thesis && thesis.map(thesisItem => (
                <ThesisCard key={thesisItem.id} thesisItem={thesisItem} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination />
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedThesis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Thesis Details</h2>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedThesis.title}</h3>
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                    {selectedThesis.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thesis Number</label>
                    <p className="text-gray-900">#{selectedThesis.thesis_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <p className="text-gray-900">{selectedThesis.author}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Guide</label>
                    <p className="text-gray-900">{selectedThesis.project_guide}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College</label>
                    <p className="text-gray-900">{selectedThesis.college_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="text-gray-900">{selectedThesis.department_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="text-gray-900">{formatDate(selectedThesis.created_at)}</p>
                  </div>
                </div>                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 text-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {selectedThesis.pdf_file_name && (
                    <button
                      onClick={() => handleDownload(selectedThesis.id, selectedThesis.title)}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentThesis
