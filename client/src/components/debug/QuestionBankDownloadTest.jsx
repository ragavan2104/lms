import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Download, Info, RefreshCw } from 'lucide-react';

const QuestionBankDownloadTest = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestionBanks();
    fetchDebugInfo();
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/question-banks/search?per_page=5');
      setQuestionBanks(response.data.question_banks || []);
    } catch (error) {
      console.error('Error fetching question banks:', error);
      toast.error('Failed to fetch question banks');
    } finally {
      setLoading(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      const response = await api.get('/debug/uploads-directory');
      setDebugInfo(response.data);
    } catch (error) {
      console.error('Error fetching debug info:', error);
      toast.error('Failed to fetch debug info');
    }
  };

  const testDownload = async (id, fileName) => {
    try {
      const loadingToast = toast.loading('Testing download...');
      
      console.log(`Testing download for QB ID: ${id}, File: ${fileName}`);
      
      const response = await api.get(`/question-banks/${id}/download`, {
        responseType: 'blob',
        timeout: 30000,
      });
      
      toast.dismiss(loadingToast);
      
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || 'Download failed');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`✅ Download successful: ${fileName}`);
      
    } catch (error) {
      console.error('Download test failed:', error);
      toast.error(`❌ Download failed: ${error.message}`);
    }
  };

  const getQuestionBankInfo = async (id) => {
    try {
      const response = await api.get(`/question-banks/${id}/info`);
      console.log('Question Bank Info:', response.data);
      toast.success('Info logged to console');
    } catch (error) {
      console.error('Error getting QB info:', error);
      toast.error('Failed to get QB info');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Question Bank Download Test</h2>
          <button
            onClick={() => { fetchQuestionBanks(); fetchDebugInfo(); }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Debug Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Backend Directory:</strong> {debugInfo.backend_directory}</p>
              <p><strong>Uploads Directory:</strong> {debugInfo.uploads_directory}</p>
              <p><strong>Uploads Exists:</strong> {debugInfo.uploads_exists ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Files in Uploads:</strong> {debugInfo.files?.length || 0}</p>
              <p><strong>Database Records:</strong> {debugInfo.database_records?.length || 0}</p>
            </div>
            
            {debugInfo.database_records && debugInfo.database_records.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-gray-900 mb-2">Database Records:</h4>
                <div className="space-y-1 text-xs">
                  {debugInfo.database_records.map((record) => (
                    <div key={record.id} className="flex items-center gap-2">
                      <span className="font-mono">ID {record.id}:</span>
                      <span>{record.file_name}</span>
                      <span className={record.file_exists ? 'text-green-600' : 'text-red-600'}>
                        {record.file_exists ? '✅' : '❌'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Banks List */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Question Banks ({questionBanks.length})</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : questionBanks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No question banks found
            </div>
          ) : (
            <div className="space-y-3">
              {questionBanks.map((qb) => (
                <div key={qb.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{qb.subject_name}</h4>
                      <p className="text-sm text-gray-600">
                        {qb.subject_code} | {qb.file_name} | {qb.file_size}
                      </p>
                      <p className="text-xs text-gray-500">
                        {qb.college.name} - {qb.department.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => getQuestionBankInfo(qb.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        <Info className="w-4 h-4" />
                        Info
                      </button>
                      <button
                        onClick={() => testDownload(qb.id, qb.file_name)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Test Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBankDownloadTest;
