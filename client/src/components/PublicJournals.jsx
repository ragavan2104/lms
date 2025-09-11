import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  BookOpen,
  Building,
  Tag,
  ArrowLeft,
  Grid,
  List,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getApiBaseUrl } from '../utils/apiConfig'

// Refactored to use Tailwind CSS for styling

const PublicJournals = () => {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJournalType, setSelectedJournalType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    fetchJournals()
  }, [currentPage, searchTerm, selectedJournalType])

  const fetchJournals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        ...(selectedJournalType && { journal_type: selectedJournalType })
      })

      const response = await fetch(`${getApiBaseUrl()}/public/journals?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJournals(data.journals)
        setTotalPages(data.pagination.pages)
      } else {
        toast.error('Failed to fetch journals.')
        setJournals([])
      }
    } catch (error) {
      console.error('Error fetching journals:', error)
      toast.error('An error occurred while fetching journals.')
      setJournals([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    // fetchJournals is already called by the useEffect hook when searchTerm changes
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <button
              onClick={goBack}
              className="flex items-center gap-2 self-start bg-blue-800 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="header-text">
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-4">
                <span className="bg-blue-800 p-3 rounded-xl inline-block">
                  <BookOpen />
                </span>
                Browse Journals
              </h1>
              <p className="mt-2 text-lg text-blue-100">
                Explore our collection of academic and research journals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white py-6 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="mb-5">
            <div className="relative flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl p-1 focus-within:border-indigo-500 transition-colors">
              <Search className="absolute right-28 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by journal name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-3 text-base text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-slate-500" />
              <select
                value={selectedJournalType}
                onChange={(e) => setSelectedJournalType(e.target.value)}
                className="p-3 border border-slate-200 rounded-lg bg-white text-sm w-full md:w-auto md:min-w-[180px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="National Journal">National Journal</option>
                <option value="International Journal">International Journal</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 border rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 border rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading journals...</p>
            </div>
          ) : journals.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800">No journals found</h3>
              <p className="text-slate-500 mt-2">
                Try adjusting your search criteria or browse all journals.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-800">
                  {journals.length} Journal{journals.length !== 1 ? 's' : ''} Found
                </h2>
              </div>

              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {journals.map((journal) => (
                  <div
                    key={journal.id}
                    className="bg-white rounded-xl p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
                  >
                    <div className="flex justify-center items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-slate-400" />
                        <span
                          className={`py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            journal.journal_type === 'International Journal'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {journal.journal_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-slate-800 leading-snug mb-3 text-center">
                        {journal.journal_name}
                      </h3>
                    </div>

                    <div className="mt-5">
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold bg-indigo-500 text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="py-2 px-4 border border-slate-300 bg-white rounded-md text-sm font-medium text-slate-700 hover:enabled:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="text-sm text-slate-600 font-medium">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="py-2 px-4 border border-slate-300 bg-white rounded-md text-sm font-medium text-slate-700 hover:enabled:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default PublicJournals