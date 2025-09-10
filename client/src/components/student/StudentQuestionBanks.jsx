import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  FileText,
  Building,
  GraduationCap,
  ArrowLeft,
  Grid,
  List,
  Eye,
  Download,
  Calendar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../../utils/apiConfig'

const StudentQuestionBanks = () => {
  const navigate = useNavigate()
  const [questionBanks, setQuestionBanks] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollege, setSelectedCollege] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetchQuestionBanks()
    fetchColleges()
  }, [currentPage, searchTerm, selectedCollege, selectedDepartment])

  useEffect(() => {
    if (selectedCollege) {
      fetchDepartmentsByCollege(selectedCollege)
    } else {
      setDepartments([])
      setSelectedDepartment('')
    }
  }, [selectedCollege])

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        ...(selectedCollege && { college_id: selectedCollege }),
        ...(selectedDepartment && { department_id: selectedDepartment })
      })

      const response = await fetch(`${getApiBaseUrl()}/public/question-banks/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuestionBanks(data.question_banks)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching question banks:', error)
      setQuestionBanks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/public/colleges`)
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges)
      }
    } catch (error) {
      console.error('Error fetching colleges:', error)
      setColleges([])
    }
  }

  const fetchDepartmentsByCollege = async (collegeId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/public/colleges/${collegeId}/departments`)
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchQuestionBanks()
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    navigate('/student/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center space-x-2 text-white hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold text-gray-900">Browse Question Banks</h1>
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
                    placeholder="Search question banks by subject, year, or description..."
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400" size={16} />
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Colleges</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCollege && (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading question banks...</span>
          </div>
        ) : questionBanks.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No question banks found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all question banks.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {questionBanks.length} Question Bank{questionBanks.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {questionBanks.map((qb) => (
                <div key={qb.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{qb.year}</span>
                      </div>
                      <div className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        QB-{qb.id}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {qb.subject}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building size={16} />
                        <span className="text-sm">{qb.college_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <GraduationCap size={16} />
                        <span className="text-sm">{qb.department_name}</span>
                      </div>
                    </div>

                    {qb.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {qb.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                        <Eye size={16} />
                        <span className="text-sm font-medium">View Details</span>
                      </button>
                      {qb.file_path && (
                        <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors">
                          <Download size={16} />
                          <span className="text-sm font-medium">Download</span>
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
    </div>
  )
}

export default StudentQuestionBanks
