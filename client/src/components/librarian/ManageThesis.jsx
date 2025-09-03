import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Search, Filter, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ManageThesis = () => {
  const { user } = useAuth();
  const [thesisList, setThesisList] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    college_id: '',
    department_id: '',
    type: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    per_page: 10
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    thesis_number: '',
    author: '',
    project_guide: '',
    title: '',
    college_id: '',
    department_id: '',
    type: '',
    pdf_file: null
  });
  const [formLoading, setFormLoading] = useState(false);

  const thesisTypes = ['mini project', 'design project', 'major project'];

  useEffect(() => {
    fetchColleges();
    fetchDepartments();
    fetchThesis();
  }, []);

  useEffect(() => {
    fetchThesis();
  }, [searchTerm, filters, pagination.page]);

  useEffect(() => {
    if (filters.college_id) {
      const filtered = departments.filter(dept => dept.college_id === parseInt(filters.college_id));
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments([]);
    }
  }, [filters.college_id, departments]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/librarian/colleges');
      setColleges(response.data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/librarian/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchThesis = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.per_page,
        search: searchTerm,
        ...filters
      });

      const response = await api.get(`/librarian/thesis?${params}`);
      setThesisList(response.data.thesis);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching thesis:', error);
      setError('Failed to fetch thesis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.thesis_number || !formData.author || !formData.project_guide || !formData.title || !formData.college_id || !formData.department_id || !formData.type || !formData.pdf_file) {
      setError('All fields are required including thesis number, author, project guide, and PDF file');
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      
      submitData.append('thesis_number', formData.thesis_number);
      submitData.append('author', formData.author);
      submitData.append('project_guide', formData.project_guide);
      submitData.append('title', formData.title);
      submitData.append('college_id', formData.college_id);
      submitData.append('department_id', formData.department_id);
      submitData.append('type', formData.type);
      submitData.append('pdf_file', formData.pdf_file);

      const response = await api.post('/librarian/thesis', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Thesis added successfully!');
      setShowForm(false);
      setFormData({
        thesis_number: '',
        author: '',
        project_guide: '',
        title: '',
        college_id: '',
        department_id: '',
        type: '',
        pdf_file: null
      });
      fetchThesis();
    } catch (error) {
      console.error('Error adding thesis:', error);
      setError(error.response?.data?.error || 'Failed to add thesis. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        e.target.value = '';
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        e.target.value = '';
        return;
      }
      setFormData({ ...formData, pdf_file: file });
      setError('');
    }
  };

  const handleDownload = async (thesisId) => {
    try {
      const response = await api.get(`/librarian/thesis/${thesisId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'thesis.pdf';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading thesis:', error);
      setError('Failed to download thesis. Please try again.');
    }
  };

  return (
    <div className="manage-thesis">
      <div className="header-section">
        <div className="header-content">
          <div className="header-text">
            <h1>Thesis Management</h1>
            <p>Manage academic thesis and project documents</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Add New Thesis
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {/* Add Thesis Form */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h2>Add New Thesis</h2>
            <button
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
              disabled={formLoading}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="thesis-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="thesis_number">Thesis Number *</label>
                <input
                  type="text"
                  id="thesis_number"
                  value={formData.thesis_number}
                  onChange={(e) => setFormData({ ...formData, thesis_number: e.target.value })}
                  placeholder="Enter unique thesis number (e.g., TH2025001)"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="author">Author *</label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter student/author name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="project_guide">Project Guide *</label>
                <input
                  type="text"
                  id="project_guide"
                  value={formData.project_guide}
                  onChange={(e) => setFormData({ ...formData, project_guide: e.target.value })}
                  placeholder="Enter project guide/supervisor name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Thesis Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter thesis title"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="college">College *</label>
                <select
                  id="college"
                  value={formData.college_id}
                  onChange={(e) => {
                    setFormData({ ...formData, college_id: e.target.value, department_id: '' });
                  }}
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  required
                  disabled={!formData.college_id}
                >
                  <option value="">Select Department</option>
                  {departments
                    .filter(dept => dept.college_id === parseInt(formData.college_id))
                    .map(department => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Thesis Type *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  {thesisTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pdf_file">PDF File *</label>
                <input
                  type="file"
                  id="pdf_file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                <small className="form-help">Only PDF files allowed (max 50MB)</small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formLoading}
              >
                <Upload size={20} />
                {formLoading ? 'Adding...' : 'Add Thesis'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search thesis by title, author, or thesis number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={filters.college_id}
            onChange={(e) => setFilters({ ...filters, college_id: e.target.value, department_id: '' })}
          >
            <option value="">All Colleges</option>
            {colleges.map(college => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>

          <select
            value={filters.department_id}
            onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
            disabled={!filters.college_id}
          >
            <option value="">All Departments</option>
            {filteredDepartments.map(department => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            {thesisTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thesis List */}
      <div className="content-section">
        {loading ? (
          <div className="loading">Loading thesis...</div>
        ) : thesisList.length === 0 ? (
          <div className="no-data">
            <FileText size={48} />
            <h3>No thesis found</h3>
            <p>No thesis projects match your current filters.</p>
          </div>
        ) : (
          <>
            <div className="thesis-grid">
              {thesisList.map(thesis => (
                <div key={thesis.id} className="thesis-card">
                  <div className="thesis-header">
                    <h3>{thesis.title}</h3>
                    <div className="thesis-type">
                      <span className={`type-badge ${thesis.type.replace(' ', '-')}`}>
                        {thesis.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="thesis-details">
                    <p><strong>Thesis Number:</strong> {thesis.thesis_number}</p>
                    <p><strong>Author:</strong> {thesis.author}</p>
                    <p><strong>Project Guide:</strong> {thesis.project_guide}</p>
                    <p><strong>College:</strong> {thesis.college_name}</p>
                    <p><strong>Department:</strong> {thesis.department_name}</p>
                    <p><strong>File:</strong> {thesis.pdf_file_name}</p>
                    <p><strong>Size:</strong> {thesis.pdf_file_size}</p>
                    <p><strong>Downloads:</strong> {thesis.download_count}</p>
                    <p><strong>Added by:</strong> {thesis.created_by}</p>
                    <p><strong>Date:</strong> {new Date(thesis.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="thesis-actions">
                    <button
                      onClick={() => handleDownload(thesis.id)}
                      className="btn btn-sm btn-outline"
                      title="Download PDF"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                  className="btn btn-sm btn-outline"
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  className="btn btn-sm btn-outline"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .manage-thesis {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-section {
          margin-bottom: 30px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-text h1 {
          margin: 0 0 5px 0;
          color: #1f2937;
          font-size: 28px;
          font-weight: 600;
        }

        .header-text p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          position: relative;
        }

        .alert-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .alert-success {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin-left: auto;
          color: inherit;
        }

        .form-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h2 {
          margin: 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 600;
        }

        .thesis-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .form-group {
          flex: 1;
          min-width: 250px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-help {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-box {
          margin-bottom: 16px;
        }

        .search-box input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filters select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          min-width: 150px;
        }

        .content-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .no-data svg {
          margin: 0 auto 16px;
          opacity: 0.5;
        }

        .thesis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .thesis-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          transition: box-shadow 0.2s;
        }

        .thesis-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .thesis-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .thesis-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          flex: 1;
          margin-right: 12px;
        }

        .type-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .mini-project {
          background-color: #dbeafe;
          color: #1d4ed8;
        }

        .design-project {
          background-color: #fef3c7;
          color: #d97706;
        }

        .major-project {
          background-color: #dcfce7;
          color: #16a34a;
        }

        .thesis-details {
          margin-bottom: 16px;
        }

        .thesis-details p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .thesis-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .btn-secondary {
          background-color: #6b7280;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #4b5563;
        }

        .btn-outline {
          background-color: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
        }

        .btn-outline:hover:not(:disabled) {
          background-color: #3b82f6;
          color: white;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .pagination-info {
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .manage-thesis {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .form-row {
            flex-direction: column;
          }

          .form-group {
            min-width: auto;
          }

          .filters {
            flex-direction: column;
          }

          .filters select {
            min-width: auto;
          }

          .thesis-grid {
            grid-template-columns: 1fr;
          }

          .thesis-header {
            flex-direction: column;
            gap: 8px;
          }

          .thesis-header h3 {
            margin-right: 0;
          }

          .pagination {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageThesis;
