import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  FileText,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  Eye,
  ChevronRight,
  Menu,
  X,
  Book,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';

// Create axios instance for public API calls (no auth required)
const publicApi = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const PublicThesis = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [thesisList, setThesisList] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [thesisTypes, setThesisTypes] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [showThesisDetails, setShowThesisDetails] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    per_page: 12
  });

  // Fetch initial data on component mount
  useEffect(() => {
    fetchColleges();
    fetchDepartments();
    fetchThesisTypes();
    fetchThesis();
  }, []);

  // Debounced effect for search and filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchThesis();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCollege, selectedDepartment, selectedType, pagination.page]);

  // Filter departments when college changes
  useEffect(() => {
    if (selectedCollege) {
      const filtered = departments.filter(dept => dept.college_id === parseInt(selectedCollege));
      setFilteredDepartments(filtered);
      setSelectedDepartment(''); // Reset department selection
    } else {
      setFilteredDepartments(departments);
    }
  }, [selectedCollege, departments]);

  const fetchColleges = async () => {
    try {
      console.log('Fetching colleges...');
      const response = await publicApi.get('/public/colleges');
      console.log('Colleges response:', response.data);
      setColleges(response.data.colleges || []);
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
      setColleges([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const response = await publicApi.get('/public/departments');
      console.log('Departments response:', response.data);
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    }
  };

  const fetchThesisTypes = async () => {
    try {
      const response = await publicApi.get('/public/thesis/types');
      setThesisTypes(response.data.thesis_types || []);
    } catch (error) {
      console.error('Failed to fetch thesis types:', error);
      setThesisTypes([]);
    }
  };

  const fetchThesis = async () => {
    try {
      setLoading(true);
      setIsSearching(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString()
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (selectedCollege) {
        params.append('college_id', selectedCollege);
      }
      if (selectedDepartment) {
        params.append('department_id', selectedDepartment);
      }
      if (selectedType) {
        params.append('type', selectedType);
      }

      console.log('Fetching thesis with params:', params.toString());

      const response = await publicApi.get(`/public/thesis?${params}`);
      
      console.log('Thesis API response:', response.data);
      
      setThesisList(response.data.thesis || []);
      setPagination(response.data.pagination || pagination);
      setHasSearched(true);

    } catch (error) {
      console.error('Failed to fetch thesis:', error);
      setThesisList([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    // The useEffect will trigger fetchThesis when pagination changes
  };

  const handleThesisClick = (thesis) => {
    setSelectedThesis(thesis);
    setShowThesisDetails(true);
  };

  const handleDownload = async (thesisId) => {
    try {
      const response = await publicApi.get(`/public/thesis/${thesisId}/download`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1] || 'thesis.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading thesis:', error);
      alert('Failed to download thesis. Please try again.');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCollege('');
    setSelectedDepartment('');
    setSelectedType('');
    setPagination({ ...pagination, page: 1 });
    // The useEffect will trigger fetchThesis when these values change
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center space-x-2 text-white hover:text-gray-900 transition-colors"
                onClick={() => navigate('/')}
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to OPAC</span>
              </button>
              <div className="flex items-center space-x-3">
                <FileText size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Thesis Collection</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Academic Research Repository</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">OPAC</a>
              <a href="/question-banks" className="text-gray-600 hover:text-gray-900 transition-colors">Question Banks</a>
              <a href="/ebooks" className="text-gray-600 hover:text-gray-900 transition-colors">E-books</a>
              <a href="/news-clippings" className="text-gray-600 hover:text-gray-900 transition-colors">News Clippings</a>
              <a href="/thesis" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Thesis</a>
            </nav>

            {/* Login Button and Mobile Menu */}
            <div className="flex items-center space-x-3">
              <button 
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleLoginClick}
              >
                <User size={16} />
                <span className="hidden sm:inline">Login</span>
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <nav className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">OPAC</a>
                <a href="/question-banks" className="text-gray-600 hover:text-gray-900 transition-colors">Question Banks</a>
                <a href="/ebooks" className="text-gray-600 hover:text-gray-900 transition-colors">E-books</a>
                <a href="/news-clippings" className="text-gray-600 hover:text-gray-900 transition-colors">News Clippings</a>
                <a href="/thesis" className="text-blue-600 font-medium">Thesis</a>
              </div>
            </nav>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Academic Thesis Collection</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse and download academic research projects and thesis documents from various departments
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search thesis titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              disabled={!selectedCollege}
            >
              <option value="">All Departments</option>
              {filteredDepartments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {thesisTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Hidden submit button for form submission */}
            <button type="submit" style={{ display: 'none' }}>Search</button>
          </form>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading thesis...</span>
          </div>
        )}

        {/* No Results */}
        {!loading && hasSearched && thesisList.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No thesis found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={resetFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Results Header */}
        {!loading && thesisList.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {pagination.total} thesis found
              </h3>
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Thesis Grid */}
        {!loading && thesisList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {thesisList.map((thesis) => (
              <div
                key={thesis.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6 cursor-pointer"
                onClick={() => handleThesisClick(thesis)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Thesis</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    thesis.type === 'mini project' ? 'bg-green-100 text-green-800' :
                    thesis.type === 'design project' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {thesis.type.toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {thesis.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Thesis Number:</strong> {thesis.thesis_number}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Author:</strong> {thesis.author}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Project Guide:</strong> {thesis.project_guide}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>College:</strong> {thesis.college_name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Department:</strong> {thesis.department_name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(thesis.created_at).toLocaleDateString()}
                    </span>
                    {thesis.download_count > 0 && (
                      <span>Downloads: {thesis.download_count}</span>
                    )}
                  </div>
                </div>

                {/* File Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">File:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{thesis.pdf_file_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Size:</span>
                    <span className="text-gray-900">{thesis.pdf_file_size}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Added {new Date(thesis.created_at).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(thesis.id);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thesis Details Modal */}
      {showThesisDetails && selectedThesis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowThesisDetails(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedThesis.title}</h2>
              <button
                className="text-white p-1"
                onClick={() => setShowThesisDetails(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedThesis.type === 'mini project' ? 'bg-green-100 text-green-800' :
                    selectedThesis.type === 'design project' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedThesis.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Thesis Number:</span>
                  <span className="text-gray-900">{selectedThesis.thesis_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Author:</span>
                  <span className="text-gray-900">{selectedThesis.author}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Project Guide:</span>
                  <span className="text-gray-900">{selectedThesis.project_guide}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">College:</span>
                  <span className="text-gray-900">{selectedThesis.college_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Department:</span>
                  <span className="text-gray-900">{selectedThesis.department_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">File Name:</span>
                  <span className="text-gray-900 text-sm">{selectedThesis.pdf_file_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">File Size:</span>
                  <span className="text-gray-900">{selectedThesis.pdf_file_size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Downloads:</span>
                  <span className="text-gray-900">{selectedThesis.download_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Added:</span>
                  <span className="text-gray-900">{new Date(selectedThesis.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => handleDownload(selectedThesis.id)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowThesisDetails(false)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Library System</h4>
              <p className="text-gray-300">Your gateway to knowledge and academic resources</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors">OPAC</a></li>
                <li><a href="/thesis" className="text-gray-300 hover:text-white transition-colors">Thesis</a></li>
                <li><a href="/ebooks" className="text-gray-300 hover:text-white transition-colors">E-books</a></li>
                <li><a href="/question-banks" className="text-gray-300 hover:text-white transition-colors">Question Banks</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-300">Library Address</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-300">+1 234 567 8900</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-300">library@institution.edu</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 mt-8">
            <p className="text-center text-gray-400">&copy; 2025 Library Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicThesis;
