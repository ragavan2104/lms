import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart3, Download, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const LibraryCollection = () => {
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCollectionData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/reports/library-collection');
      
      if (response.data.success) {
        setCollectionData(response.data);
      } else {
        setError('Failed to load collection data');
      }
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setError(error.response?.data?.error || 'Failed to load collection data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, []);

  const downloadReport = async (format) => {
    try {
      const response = await api.post(`/admin/reports/library-collection/download/${format}`, {
        collection_data: collectionData
      }, {
        responseType: 'blob'
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `library_collection_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Error downloading ${format} report:`, error);
      alert(`Failed to download ${format.toUpperCase()} report: ${error.response?.data?.error || error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Library Collection Report</h1>
        <p className="text-gray-600">Overview of library collection statistics organized by category</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={fetchCollectionData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            
            {collectionData && (
              <span className="text-sm text-gray-500">
                Last updated: {formatDate(collectionData.generated_at)}
              </span>
            )}
          </div>

          {collectionData && (
            <div className="flex gap-2">
              <button
                onClick={() => downloadReport('pdf')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
              <button
                onClick={() => downloadReport('excel')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Download Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Overall Statistics */}
      {collectionData && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Overall Collection Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {collectionData.overall_statistics.total_titles.toLocaleString()}
              </div>
              <div className="text-blue-800 font-medium">Total Unique Titles</div>
              <div className="text-sm text-blue-600 mt-1">Different books in collection</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {collectionData.overall_statistics.total_volumes.toLocaleString()}
              </div>
              <div className="text-green-800 font-medium">Total Volumes</div>
              <div className="text-sm text-green-600 mt-1">Physical copies available</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {collectionData && collectionData.category_breakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Category-wise Breakdown
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Titles
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Volumes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collectionData.category_breakdown.map((category, index) => {

                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900 font-semibold">
                          {category.unique_titles.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900 font-semibold">
                          {category.total_volumes.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-purple-600">
                {collectionData.category_breakdown.length}
              </div>
              <div className="text-sm text-purple-800">Total Categories</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-orange-600">
                {collectionData.category_breakdown.length > 0 
                  ? Math.max(...collectionData.category_breakdown.map(c => c.unique_titles)).toLocaleString()
                  : 0
                }
              </div>
              <div className="text-sm text-orange-800">Largest Category (Titles)</div>
            </div>
            

          </div>
        </div>
      )}

      {/* No Data Message */}
      {collectionData && collectionData.category_breakdown.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Collection Data</h3>
          <p className="text-gray-600">No books found in the library collection.</p>
        </div>
      )}
    </div>
  );
};

export default LibraryCollection;
