import React, { useState, useEffect } from 'react'
import { Download, FileText, Users, BookOpen, Building, GraduationCap, Newspaper, Monitor, RefreshCw } from 'lucide-react'
import axios from 'axios'

const OverallReport = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/admin/overall-report-detailed', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReportData(response.data)
    } catch (error) {
      console.error('Failed to fetch report data:', error)
      alert('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      setDownloading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/admin/overall-report-pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.setAttribute('download', `overall_report_${timestamp}.pdf`)
      
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download PDF:', error)
      alert('Failed to download PDF report')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No report data</h3>
          <p className="mt-1 text-sm text-gray-500">Failed to load report data.</p>
          <button
            onClick={fetchReportData}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { college_department_breakdown, library_collection_statistics, summary } = reportData

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overall Library Report</h1>
            <p className="mt-2 text-sm text-gray-600">
              Comprehensive overview of library resources and user statistics
            </p>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Physical Resources</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.total_physical_resources.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Monitor className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Digital Resources</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.total_digital_resources.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Academic Resources</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.total_academic_resources.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Resources</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.grand_total.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Library Collection Statistics */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Library Collection Statistics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed breakdown of library resources</p>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Books */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Books</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Unique Titles:</span>
                  <span className="font-medium text-blue-900">{library_collection_statistics.books.total_titles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Volumes:</span>
                  <span className="font-medium text-blue-900">{library_collection_statistics.books.total_volumes.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Journals */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Journals</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Total Journals:</span>
                  <span className="font-medium text-green-900">{library_collection_statistics.journals.total_journals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">National:</span>
                  <span className="font-medium text-green-900">{library_collection_statistics.journals.national_journals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">International:</span>
                  <span className="font-medium text-green-900">{library_collection_statistics.journals.international_journals.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* E-Resources */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-purple-900 mb-3">E-Resources</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">E-books:</span>
                  <span className="font-medium text-purple-900">{library_collection_statistics.eresources.total_ebooks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">E-journals:</span>
                  <span className="font-medium text-purple-900">{library_collection_statistics.eresources.total_ejournals.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* College and Department Breakdown */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">College and Department Breakdown</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Student distribution across {college_department_breakdown.total_colleges} colleges 
            (Total: {college_department_breakdown.total_students_system.toLocaleString()} students)
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="space-y-6 p-6">
            {college_department_breakdown.colleges.map((college) => (
              <div key={college.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      {college.name} ({college.code})
                    </h4>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-600">
                      {college.total_students.toLocaleString()} students
                    </span>
                  </div>
                </div>
                
                {college.departments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {college.departments.map((department) => (
                          <tr key={department.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {department.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {department.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {department.student_count.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No departments found for this college.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverallReport
