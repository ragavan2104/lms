import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  Upload,
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const QuestionBankManagement = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    college_id: '',
    department_id: '',
    subject_name: '',
    subject_code: '',
    regulation: '',
    file: null
  });

  useEffect(() => {
    fetchQuestionBanks();
    fetchColleges();
  }, [currentPage, searchTerm, selectedCollege, selectedDepartment]);

  useEffect(() => {
    if (formData.college_id) {
      fetchDepartmentsByCollege(formData.college_id);
    }
  }, [formData.college_id]);

  useEffect(() => {
    if (selectedCollege) {
      fetchDepartmentsByCollege(selectedCollege);
    } else {
      setDepartments([]);
      setSelectedDepartment('');
    }
  }, [selectedCollege]);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        ...(selectedCollege && { college_id: selectedCollege }),
        ...(selectedDepartment && { department_id: selectedDepartment })
      });

      const response = await api.get(`/admin/question-banks?${params}`);
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
      console.log('Colleges response:', response.data);
      setColleges(response.data.colleges || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast.error('Failed to fetch colleges');
      setColleges([]);
    }
  };

  const fetchDepartmentsByCollege = async (collegeId) => {
    try {
      console.log('Fetching departments for college:', collegeId);
      const response = await api.get(`/colleges/${collegeId}/departments`);
      console.log('Departments response:', response.data);
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
      setDepartments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast.error('Please select a PDF file');
      return;
    }

    const submitData = new FormData();
    submitData.append('college_id', formData.college_id);
    submitData.append('department_id', formData.department_id);
    submitData.append('subject_name', formData.subject_name);
    submitData.append('subject_code', formData.subject_code);
    submitData.append('regulation', formData.regulation);
    submitData.append('file', formData.file);

    try {
      await api.post('/admin/question-banks', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Question bank uploaded successfully');
      setShowAddModal(false);
      setFormData({
        college_id: '',
        department_id: '',
        subject_name: '',
        subject_code: '',
        regulation: '',
        file: null
      });
      fetchQuestionBanks();
    } catch (error) {
      console.error('Error uploading question bank:', error);
      toast.error(error.response?.data?.error || 'Failed to upload question bank');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question bank?')) {
      return;
    }

    try {
      await api.delete(`/admin/question-banks/${id}`);
      toast.success('Question bank deleted successfully');
      fetchQuestionBanks();
    } catch (error) {
      console.error('Error deleting question bank:', error);
      toast.error('Failed to delete question bank');
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Preparing download...');

      console.log(`Admin downloading question bank ID: ${id}, File: ${fileName}`);

      const response = await api.get(`/question-banks/${id}/download`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Check if response is actually a blob (file) or JSON error
      if (response.data.type === 'application/json') {
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
          toast.error('File not found on server. Please check file storage.');
        } else {
          toast.error('File not found');
        }
      } else if (error.response?.status === 401) {
        toast.error('Authentication required');
      } else if (error.response?.status === 403) {
        toast.error('Access denied');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Download timeout. Please try again.');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to download file';
        toast.error(`Download failed: ${errorMessage}`);
      }
    }
  };

  const setupTestData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/setup-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Test data created: ${data.created_colleges} colleges, ${data.created_departments} departments`);
        fetchColleges();
      } else {
        toast.error(data.error || 'Failed to setup test data');
      }
    } catch (error) {
      console.error('Error setting up test data:', error);
      toast.error('Failed to setup test data');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question Bank
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search question banks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCollege}
            onChange={(e) => {
              setSelectedCollege(e.target.value);
              setSelectedDepartment(''); // Reset department when college changes
            }}
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
            }}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Question Banks Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College/Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : questionBanks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No question banks found
                  </td>
                </tr>
              ) : (
                questionBanks.map((qb) => (
                  <tr key={qb.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {qb.subject_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Code: {qb.subject_code}
                        </div>
                        {qb.regulation && (
                          <div className="text-xs text-blue-600">
                            Regulation: {qb.regulation}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{qb.college.name}</div>
                      <div className="text-sm text-gray-500">{qb.department.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-red-500 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{qb.file_name}</div>
                          <div className="text-xs text-gray-500">{qb.file_size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {qb.download_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(qb.id, qb.file_name)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(qb.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Question Bank Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Question Bank</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College *
                  </label>
                  <select
                    value={formData.college_id}
                    onChange={(e) => setFormData({...formData, college_id: e.target.value, department_id: ''})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select College</option>
                    {colleges.map(college => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    required
                    disabled={!formData.college_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Department</option>
                    {departments.map(department => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={formData.subject_name}
                    onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subject name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    value={formData.subject_code}
                    onChange={(e) => setFormData({...formData, subject_code: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subject code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regulation (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.regulation}
                    onChange={(e) => setFormData({...formData, regulation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter regulation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PDF File *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only PDF files are allowed</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManagement;
