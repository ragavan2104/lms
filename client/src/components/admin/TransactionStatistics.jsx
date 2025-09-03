import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, BarChart3, TrendingUp, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const TransactionStatistics = () => {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchColleges();
    fetchDepartments();
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Fetch departments when college changes
  useEffect(() => {
    if (selectedCollege) {
      fetchDepartments(selectedCollege);
      setSelectedDepartment(''); // Reset department selection
    } else {
      fetchDepartments();
    }
  }, [selectedCollege]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/admin/colleges');
      setColleges(response.data.colleges || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setError('Failed to load colleges');
    }
  };

  const fetchDepartments = async (collegeId = null) => {
    try {
      const params = collegeId ? { college_id: collegeId } : {};
      const response = await api.get('/admin/departments', { params });
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
    }
  };

  const fetchStatistics = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        start_date: startDate,
        end_date: endDate
      };

      if (selectedCollege) {
        params.college_id = selectedCollege;
      }

      if (selectedDepartment) {
        params.department_id = selectedDepartment;
      }

      const response = await api.get('/admin/transaction-statistics', { params });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load transaction statistics');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format = 'pdf') => {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
        format: format
      };

      if (selectedCollege) {
        params.college_id = selectedCollege;
      }

      if (selectedDepartment) {
        params.department_id = selectedDepartment;
      }

      const response = await api.get('/admin/transaction-statistics/download', {
        params,
        responseType: 'blob'
      });

      const mimeType = format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      const fileExtension = format === 'excel' ? 'xlsx' : 'pdf';

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const collegeName = selectedCollege
        ? colleges.find(c => c.id === parseInt(selectedCollege))?.name || 'Selected'
        : 'All';

      const departmentName = selectedDepartment
        ? departments.find(d => d.id === parseInt(selectedDepartment))?.name || 'Selected'
        : 'All';

      const fileName = selectedDepartment
        ? `Transaction_Statistics_${departmentName}_${startDate}_to_${endDate}.${fileExtension}`
        : `Transaction_Statistics_${collegeName}_${startDate}_to_${endDate}.${fileExtension}`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 border-${color}-500 p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Statistics</h1>
        <p className="text-gray-600">View detailed statistics of book transactions by department and date range</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Colleges</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.college_name ? `${dept.college_name} - ${dept.name}` : dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchStatistics}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="Books Issued"
              value={statistics.issued_books || 0}
              icon={BookOpen}
              color="blue"
              subtitle="Total books issued in selected period"
            />
            <StatCard
              title="Books Returned"
              value={statistics.returned_books || 0}
              icon={RotateCcw}
              color="green"
              subtitle="Total books returned in selected period"
            />
            <StatCard
              title="Outstanding Books"
              value={statistics.outstanding_books || 0}
              icon={TrendingUp}
              color="orange"
              subtitle="Books currently not returned"
            />
          </div>

          {/* Download Buttons */}
          <div className="flex justify-end mb-6 gap-3">
            <button
              onClick={() => downloadReport('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={() => downloadReport('excel')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </button>
          </div>

          {/* Detailed Statistics Table */}
          {statistics.detailed_stats && statistics.detailed_stats.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Statistics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        College
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Books Issued
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Books Returned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outstanding
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistics.detailed_stats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {stat.college_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.department_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.issued_books}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.returned_books}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.outstanding_books}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.return_rate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionStatistics;
