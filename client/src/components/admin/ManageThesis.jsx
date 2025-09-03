import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Trash2, Search, Filter, Upload, AlertCircle, CheckCircle } from 'lucide-react';
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
    // Filter departments when college changes
    if (filters.college_id) {
      const filtered = departments.filter(dept => dept.college_id === parseInt(filters.college_id));
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(departments);
    }
  }, [filters.college_id, departments]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/admin/colleges');
      setColleges(response.data.colleges || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchThesis = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filters.college_id) params.append('college_id', filters.college_id);
      if (filters.department_id) params.append('department_id', filters.department_id);
      if (filters.type) params.append('type', filters.type);

      const response = await api.get(`/admin/thesis?${params}`);

      setThesisList(response.data.thesis || []);
      setPagination(response.data.pagination || pagination);
      setError('');
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

      const response = await api.post('/admin/thesis', submitData, {
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

  const handleDelete = async (thesisId) => {
    if (!window.confirm('Are you sure you want to delete this thesis? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/thesis/${thesisId}`);
      
      setSuccess('Thesis deleted successfully!');
      fetchThesis();
    } catch (error) {
      console.error('Error deleting thesis:', error);
      setError(error.response?.data?.error || 'Failed to delete thesis. Please try again.');
    }
  };

  const handleDownload = async (thesisId) => {
    try {
      const response = await api.get(`/admin/thesis/${thesisId}/download`, {
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
      setError('Failed to download thesis. Please try again.');
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

  return (
    <div className="manage-thesis">
      <div className="page-header">
        <div className="header-content">
          <FileText size={32} className="page-icon" />
          <div>
            <h1>Manage Thesis</h1>
            <p>Add and manage thesis projects</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          disabled={showForm}
        >
          <Plus size={20} />
          Add Thesis
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {success}
          <button 
            onClick={() => setSuccess('')} 
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
          <button 
            onClick={() => setError('')} 
            className="alert-close"
          >
            ×
          </button>
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
            placeholder="Search thesis..."
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
                    {(user?.role === 'admin' || user?.role === 'librarian') && (
                      <button
                        onClick={() => handleDelete(thesis.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete thesis"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn btn-outline"
                >
                  Previous
                </button>
                
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-outline"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageThesis;
