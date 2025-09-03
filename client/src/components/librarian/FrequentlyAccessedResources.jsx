import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import api from '../../services/api';

const FrequentlyAccessedResources = () => {
  // Top books state
  const [topBooks, setTopBooks] = useState([]);
  const [topBooksLoading, setTopBooksLoading] = useState(false);
  const [topBooksError, setTopBooksError] = useState('');
  const [topBooksLimit, setTopBooksLimit] = useState(10);
  const [topBooksLimitInput, setTopBooksLimitInput] = useState('10');

  // Date range filtering state
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('all-time');
  
  // Individual book report state
  const [manualBookQuery, setManualBookQuery] = useState('');
  const [manualBookType, setManualBookType] = useState('access_no');
  const [individualBookReport, setIndividualBookReport] = useState(null);
  const [individualBookLoading, setIndividualBookLoading] = useState(false);
  const [individualBookError, setIndividualBookError] = useState('');

  // Date preset options
  const datePresets = [
    { value: 'all-time', label: 'All Time' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'current-year', label: 'Current Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Helper function to calculate date ranges
  const calculateDateRange = (preset) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    switch (preset) {
      case 'last-30-days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(date - 30);
        return {
          start: thirtyDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'last-6-months':
        const sixMonthsAgo = new Date(year, month - 6, date);
        return {
          start: sixMonthsAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'current-year':
        return {
          start: `${year}-01-01`,
          end: today.toISOString().split('T')[0]
        };
      default:
        return { start: '', end: '' };
    }
  };

  // Handle date preset changes
  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      const range = calculateDateRange(preset);
      setStartDate(range.start);
      setEndDate(range.end);
      if (preset !== 'all-time') {
        setDateFilterEnabled(true);
      } else {
        setDateFilterEnabled(false);
      }
    }
  };

  const fetchTopBooks = async () => {
    setTopBooksLoading(true);
    setTopBooksError('');

    try {
      const params = { limit: topBooksLimit };
      
      // Add date filtering if enabled
      if (dateFilterEnabled && (startDate || endDate)) {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }

      const response = await api.get('/librarian/frequently-accessed/top-books', { params });
      
      if (response.data.success) {
        setTopBooks(response.data.top_books);
      } else {
        setTopBooksError('Failed to load top books');
      }
    } catch (error) {
      console.error('Error fetching top books:', error);
      setTopBooksError(error.response?.data?.error || 'Failed to load top books');
    } finally {
      setTopBooksLoading(false);
    }
  };

  const handleTopBooksLimitChange = (value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 500) {
      setTopBooksLimit(numValue);
      setTopBooksLimitInput(value);
    } else {
      setTopBooksLimitInput(value); // Keep the input value for user feedback
    }
  };

  const handleGenerateTopBooks = () => {
    const numValue = parseInt(topBooksLimitInput);
    if (isNaN(numValue) || numValue < 1 || numValue > 500) {
      setTopBooksError('Please enter a valid number between 1 and 500');
      return;
    }
    setTopBooksLimit(numValue);
    fetchTopBooks();
  };

  // Generate individual book report
  const generateIndividualBookReport = async (bookId, fromSearch = false) => {
    setIndividualBookLoading(true);
    setIndividualBookError('');
    setIndividualBookReport(null);

    try {
      const params = { book_id: bookId };
      
      // Add date filtering if enabled
      if (dateFilterEnabled && (startDate || endDate)) {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }

      const response = await api.get('/librarian/frequently-accessed/book-report', { params });
      
      if (response.data.success) {
        setIndividualBookReport(response.data);
        if (!fromSearch) {
          // Clear manual search if this was triggered from manual entry
          setManualBookQuery('');
        }
      } else {
        setIndividualBookError('Failed to generate book report');
      }
    } catch (error) {
      console.error('Error generating book report:', error);
      setIndividualBookError(error.response?.data?.error || 'Failed to generate book report');
    } finally {
      setIndividualBookLoading(false);
    }
  };

  // Handle manual book report generation
  const handleManualBookReport = async () => {
    if (!manualBookQuery.trim()) {
      setIndividualBookError('Please enter a book access number or title');
      return;
    }

    setIndividualBookLoading(true);
    setIndividualBookError('');

    try {
      // First search for the book
      const params = {};
      if (manualBookType === 'access_no') {
        params.access_no = manualBookQuery.trim();
      } else {
        params.title = manualBookQuery.trim();
      }

      const searchResponse = await api.get('/librarian/frequently-accessed/search', { params });
      
      if (searchResponse.data.success && searchResponse.data.books.length > 0) {
        // Use the first book found
        const book = searchResponse.data.books[0];
        await generateIndividualBookReport(book.id, false);
      } else {
        setIndividualBookError('No book found matching your search criteria');
        setIndividualBookLoading(false);
      }
    } catch (error) {
      console.error('Error searching for book:', error);
      setIndividualBookError(error.response?.data?.error || 'Failed to search for book');
      setIndividualBookLoading(false);
    }
  };

  // Download functions
  const downloadTopBooksReport = async (format) => {
    try {
      const response = await api.post(`/librarian/frequently-accessed/download/${format}`, {
        report_type: 'top_books',
        books_data: topBooks,
        limit: topBooksLimit,
        date_filter: dateFilterEnabled ? { start_date: startDate, end_date: endDate } : null
      }, {
        responseType: 'blob'
      });

      // Create blob URL and trigger download
      const mimeType = format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      const fileExtension = format === 'excel' ? 'xlsx' : 'pdf';

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const dateRange = dateFilterEnabled ? `_${startDate}_to_${endDate}` : '';
      link.download = `Top_${topBooksLimit}_Books_Report${dateRange}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Error downloading ${format} report:`, error);
      alert(`Failed to download ${format.toUpperCase()} report: ${error.response?.data?.error || error.message}`);
    }
  };

  const downloadIndividualBookReport = async (format) => {
    try {
      const response = await api.post(`/librarian/frequently-accessed/download/${format}`, {
        report_type: 'individual_book',
        book_data: individualBookReport
      }, {
        responseType: 'blob'
      });

      // Create blob URL and trigger download
      const mimeType = format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      const fileExtension = format === 'excel' ? 'xlsx' : 'pdf';

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const bookTitle = individualBookReport.title ? individualBookReport.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Unknown';
      link.download = `Book_Access_Report_${bookTitle}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Error downloading ${format} report:`, error);
      alert(`Failed to download ${format.toUpperCase()} report: ${error.response?.data?.error || error.message}`);
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Available' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    return status === 'Available' ? 'text-green-600' : 'text-red-600';
  };

  const BookCard = ({ book, showRank = false, rank = null }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {showRank && (
            <div className="flex items-center mb-2">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                #{rank}
              </span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Author:</span> {book.author}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Access No:</span> {book.access_no}
          </p>
          {book.publisher && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Publisher:</span> {book.publisher}
            </p>
          )}
          {book.category && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Category:</span> {book.category}
            </p>
          )}
          {book.location && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Location:</span> {book.location}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{book.total_issues}</p>
          <p className="text-sm text-gray-500">Total Issues</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">{book.total_copies}</p>
          <p className="text-sm text-gray-500">Total Copies</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{book.available_copies}</p>
          <p className="text-sm text-gray-500">Available</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center mb-1">
            {getStatusIcon(book.current_status)}
            <span className={`ml-1 text-sm font-medium ${getStatusColor(book.current_status)}`}>
              {book.current_status}
            </span>
          </div>
          <p className="text-sm text-gray-500">Status</p>
        </div>
      </div>
      
      {/* Generate Report Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => generateIndividualBookReport(book.id, true)}
          disabled={individualBookLoading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
        >
          <FileText className="w-4 h-4 mr-2" />
          {individualBookLoading ? 'Generating...' : 'Generate Detailed Report'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Frequently Accessed Resources</h1>
        <p className="text-gray-600">View the most frequently issued books and generate detailed reports</p>
      </div>

      {/* Top Books Report Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Top Books Report
        </h2>

        {/* Date Range Filter */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Date Range Filter</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {datePresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {datePreset === 'custom' && (
              <>
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
              </>
            )}

            <div className="flex items-end">
              <div className="w-full">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dateFilterEnabled}
                    onChange={(e) => setDateFilterEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Apply date filter</span>
                </label>
                {dateFilterEnabled && (startDate || endDate) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {startDate && endDate
                      ? `${startDate} to ${endDate}`
                      : startDate
                        ? `From ${startDate}`
                        : `Until ${endDate}`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Books Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Top Books
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={topBooksLimitInput}
              onChange={(e) => handleTopBooksLimitChange(e.target.value)}
              placeholder="Enter number (1-500)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter any number between 1 and 500</p>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateTopBooks}
              disabled={topBooksLoading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {topBooksLoading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>

          {topBooks.length > 0 && (
            <div className="flex items-end">
              <div className="w-full space-y-2">
                <button
                  onClick={() => downloadTopBooksReport('pdf')}
                  className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center justify-center text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </button>
                <button
                  onClick={() => downloadTopBooksReport('excel')}
                  className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center justify-center text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download Excel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Manual Book Entry for Individual Report */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Individual Book Report</h3>
          <p className="text-sm text-gray-600 mb-3">Enter a specific book's access number or title to generate a detailed frequency report</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Type
              </label>
              <select
                value={manualBookType}
                onChange={(e) => setManualBookType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="access_no">Access Number</option>
                <option value="title">Book Title</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {manualBookType === 'access_no' ? 'Access Number' : 'Book Title'}
              </label>
              <input
                type="text"
                value={manualBookQuery}
                onChange={(e) => setManualBookQuery(e.target.value)}
                placeholder={manualBookType === 'access_no' ? 'Enter exact access number' : 'Enter book title'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleManualBookReport()}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleManualBookReport}
                disabled={individualBookLoading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                {individualBookLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Date Filter Info */}
        {dateFilterEnabled && (startDate || endDate) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm">
              📅 Date filter applied: {startDate && endDate
                ? `${startDate} to ${endDate}`
                : startDate
                  ? `From ${startDate}`
                  : `Until ${endDate}`
              }
            </p>
          </div>
        )}

        {topBooksError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-700">{topBooksError}</span>
          </div>
        )}

        {/* Top Books Results */}
        {topBooks.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">
              Top {topBooks.length} Most Frequently Issued Books
            </h3>
            <div className="space-y-4">
              {topBooks.map((book, index) => (
                <BookCard key={book.id} book={book} showRank={true} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Individual Book Report Error */}
        {individualBookError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-700">{individualBookError}</span>
          </div>
        )}
      </div>

      {/* Individual Book Report Modal */}
      {individualBookReport && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Individual Book Report
                </h2>
                <button
                  onClick={() => setIndividualBookReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Book Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Book Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Title:</span> {individualBookReport.book.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Author:</span> {individualBookReport.book.author}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Access No:</span> {individualBookReport.book.access_no}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Publisher:</span> {individualBookReport.book.publisher || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Category:</span> {individualBookReport.book.category || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Location:</span> {individualBookReport.book.location || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Total Copies:</span> {individualBookReport.book.total_copies}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Available:</span> {individualBookReport.book.available_copies}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{individualBookReport.statistics.total_issues}</p>
                  <p className="text-sm text-gray-600">Total Issues</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">#{individualBookReport.statistics.ranking || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Library Ranking</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{individualBookReport.statistics.total_books_compared}</p>
                  <p className="text-sm text-gray-600">Books Compared</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Object.keys(individualBookReport.statistics.monthly_breakdown).length}
                  </p>
                  <p className="text-sm text-gray-600">Active Months</p>
                </div>
              </div>

              {/* Monthly Breakdown */}
              {Object.keys(individualBookReport.statistics.monthly_breakdown).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Monthly Circulation Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Object.entries(individualBookReport.statistics.monthly_breakdown)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .slice(0, 12)
                        .map(([month, count]) => (
                          <div key={month} className="text-center">
                            <p className="text-lg font-semibold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-600">{month}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Circulation History */}
              {individualBookReport.circulation_history && individualBookReport.circulation_history.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">
                    Recent Circulation History (Last {individualBookReport.circulation_history.length} records)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Return Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Borrower
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {individualBookReport.circulation_history.map((record, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.issue_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.due_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.return_date ? new Date(record.return_date).toLocaleDateString() : 'Not returned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.user_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.status === 'returned'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => downloadIndividualBookReport('pdf')}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Report
                </button>
                <button
                  onClick={() => downloadIndividualBookReport('excel')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel Report
                </button>
                <button
                  onClick={() => setIndividualBookReport(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequentlyAccessedResources;
