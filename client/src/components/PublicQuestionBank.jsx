import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  FileText,
  Filter,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getApiBaseUrl } from '../utils/apiConfig';
import api from '../services/api';

const PublicQuestionBank = () => {
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

  useEffect(() => {
    if (selectedCollege) {
      fetchDepartmentsByCollege(selectedCollege);
    }
  }, [selectedCollege]);

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

      // For public access, we'll create a public endpoint that doesn't require auth
      const response = await fetch(`${getApiBaseUrl()}/public/question-banks/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuestionBanks(data.question_banks);
        setTotalPages(data.pagination.pages);
      } else {
        // Fallback to empty array if API fails
        setQuestionBanks([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching question banks:', error);
      setQuestionBanks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/api/public/colleges`);
      if (response.ok) {
        const data = await response.json();
        setColleges(data.colleges);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setColleges([]);
    }
  };

  const fetchDepartmentsByCollege = async (collegeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/public/colleges/${collegeId}/departments`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const handleCollegeChange = (collegeId) => {
    setSelectedCollege(collegeId);
    setSelectedDepartment('');
    setCurrentPage(1);
  };

  const handleDownload = (id, fileName) => {
    toast.error('Please login to download question papers', {
      duration: 3000,
      icon: '🔒',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
              <h1 className="text-xl font-semibold text-gray-900">Question Bank</h1>
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
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Question Bank Repository</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access previous year question papers and study materials for various subjects and departments
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
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
              {departments
                .filter(dept => !selectedCollege || dept.college_id.toString() === selectedCollege)
                .map(department => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ))}
          </div>
        )}

        {/* Login Prompt */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Want to Download Question Papers?</h3>
            <p className="text-blue-700 mb-4">
              Login to your account to download question papers and access additional study materials.
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
  );
};

export default PublicQuestionBank;
