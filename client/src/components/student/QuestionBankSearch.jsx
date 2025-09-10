import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  Filter,
  BookOpen,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const QuestionBankSearch = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuestionBanks();
    fetchColleges();
  }, [currentPage, searchTerm, selectedCollege, selectedDepartment]);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        ...(selectedCollege && { college_id: selectedCollege }),
        ...(selectedDepartment && { department_id: selectedDepartment })
      });

      const response = await api.get(`/question-banks/search?${params}`);
      setQuestionBanks(response.data.question_banks);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching question banks:', error);
      toast.error('Failed to fetch question banks');
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.colleges);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const fetchDepartmentsByCollege = async (collegeId) => {
    try {
      const response = await api.get(`/colleges/${collegeId}/departments`);
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCollegeChange = (collegeId) => {
    setSelectedCollege(collegeId);
    setSelectedDepartment('');
    if (collegeId) {
      fetchDepartmentsByCollege(collegeId);
    } else {
      setDepartments([]);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Preparing download...');

      console.log(`Attempting to download question bank ID: ${id}, File: ${fileName}`);

      const response = await api.get(`/question-banks/${id}/download`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Check if response is actually a blob (file) or JSON error
      if (response.data.type === 'application/json') {
        // This means we got an error response as JSON
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || 'Download failed');
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Download started: ${fileName}`);

      // Refresh the question banks list to update download count
      fetchQuestionBanks();

    } catch (error) {
      console.error('Error downloading file:', error);

      // Provide specific error messages
      if (error.response?.status === 404) {
        if (error.response.data?.error?.includes('Question bank not found')) {
          toast.error('Question bank not found');
        } else if (error.response.data?.error?.includes('File not found')) {
          toast.error('File not found on server. Please contact administrator.');
        } else {
          toast.error('File not found');
        }
      } else if (error.response?.status === 401) {
        toast.error('Please login to download files');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to download this file');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Download timeout. Please try again.');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to download file';
        toast.error(`Download failed: ${errorMessage}`);
      }
    }
  };

  const handleDebugInfo = async (id) => {
    try {
      const response = await api.get(`/question-banks/${id}/info`);
      console.log('Question Bank Debug Info:', response.data);
      toast.success('Debug info logged to console');
    } catch (error) {
      console.error('Error getting debug info:', error);
      toast.error('Failed to get debug info');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Bank</h1>
          <p className="text-gray-600">Search and download question papers for your subjects</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject, code, or regulation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCollege}
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedCollege}
            >
              <option value="">All Departments</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCollege('');
                setSelectedDepartment('');
                setCurrentPage(1);
                setDepartments([]);
              }}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Question Banks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading question banks...</p>
          </div>
        ) : questionBanks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Banks Found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {questionBanks.map((qb) => (
                <div key={qb.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {qb.download_count} downloads
                      </span>
                    </div>

                    {/* Subject Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {qb.subject_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Subject Code: <span className="font-medium">{qb.subject_code}</span>
                      </p>
                      {qb.regulation && (
                        <p className="text-sm text-blue-600">
                          Regulation: {qb.regulation}
                        </p>
                      )}
                    </div>

                    {/* College/Department */}
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {qb.college.name}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {qb.department.name}
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">File:</span>
                        <span className="font-medium text-gray-900">{qb.file_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Size:</span>
                        <span className="text-gray-900">{qb.file_size}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(qb.created_at)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDebugInfo(qb.id)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                          title="Debug Info"
                        >
                          Debug
                        </button>
                        <button
                          onClick={() => handleDownload(qb.id, qb.file_name)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionBankSearch;
