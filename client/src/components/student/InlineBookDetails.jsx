import React, { useState, useEffect } from 'react';
import {
  X, Book, User, Calendar, MapPin, Hash,
  Clock, AlertCircle, CheckCircle, RefreshCw,
  BookOpen, FileText, IndianRupee, Building,
  Users, Package
} from 'lucide-react';
import axios from 'axios';

const InlineBookDetails = ({ bookId, isOpen, onClose, onReserve, onRenew, position }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bookId) {
      fetchBookDetails();
    }
  }, [isOpen, bookId]);

  // Function to fetch book details from the API
  const fetchBookDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      // Ensure the full URL is used for the API call
      const response = await axios.get(`/student/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBook(response.data.book);
    } catch (error) {
      setError('Failed to load book details. Please check your network and server configuration.');
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for reserving a book
  const handleReserve = async () => {
    setActionLoading(true);
    try {
      await onReserve(book); // Call the parent's onReserve function with book object
      fetchBookDetails(); // Refresh book details after action
    } catch (error) {
      console.error('Reservation failed:', error);
      setError('Failed to reserve book.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for renewing a book
  const handleRenew = async () => {
    setActionLoading(true);
    try {
      await onRenew(book.circulation_id); // Call the parent's onRenew function
      fetchBookDetails(); // Refresh book details after action
    } catch (error) {
      console.error('Renewal failed:', error);
      setError('Failed to renew book.');
    } finally {
      setActionLoading(false);
    }
  };

  // Determines the availability status of the book
  const getAvailabilityStatus = () => {
    if (!book) return { status: 'unknown', text: 'Unknown', color: 'bg-gray-500', icon: AlertCircle };

    if (book.available_copies > 0) {
      return { status: 'available', text: 'Available Now', color: 'bg-green-500', icon: CheckCircle };
    } else if (book.user_has_borrowed) {
      return { status: 'borrowed', text: 'You have this book', color: 'bg-blue-500', icon: BookOpen };
    } else if (book.user_has_reserved) {
      return { status: 'reserved', text: 'You have reserved this', color: 'bg-purple-500', icon: Clock };
    } else {
      return { status: 'unavailable', text: 'Currently Unavailable', color: 'bg-red-500', icon: AlertCircle };
    }
  };

  // Formats a date string into a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null; // Don't render if not open

  const availability = getAvailabilityStatus();
  const StatusIcon = availability.icon; // Dynamic icon component

  return (
    <div className="col-span-full w-full p-4 font-sans"> {/* Tailwind for full width, padding, and font */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"> {/* Card styling */}
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">Book Details</h3>
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            onClick={onClose}
            aria-label="Close book details"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-600">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-opacity-25"></div>
            <p className="mt-4 text-lg">Loading book details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-red-600">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-lg font-medium text-center">{error}</p>
            <button
              onClick={fetchBookDetails}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Try Again
            </button>
          </div>
        ) : book ? (
          <div className="p-6">
            {/* Book Info Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <div className="flex flex-col items-center justify-center p-4 bg-blue-100 rounded-lg flex-shrink-0">
                <div className="p-3 bg-blue-500 rounded-full text-white mb-2">
                  <BookOpen size={40} />
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${availability.color} flex items-center gap-1`}>
                  <StatusIcon size={16} />
                  <span>{availability.text}</span>
                </div>
              </div>

              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-700 text-lg mb-4">
                  {book.author_1 && <span className="font-semibold">{book.author_1}</span>}
                  {book.author_2 && <span className="text-gray-500">, {book.author_2}</span>}
                  {book.author_3 && <span className="text-gray-500">, {book.author_3}</span>}
                  {book.author_4 && <span className="text-gray-500">, {book.author_4}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Hash size={18} className="text-gray-500" />
                    <span className="font-medium">Access No:</span>
                    <span>{book.access_no}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building size={18} className="text-gray-500" />
                    <span className="font-medium">Publisher:</span>
                    <span>{book.publisher || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span>{book.location || 'Library'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-gray-500" />
                    <span className="font-medium">Edition:</span>
                    <span>{book.edition || '1st Edition'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book size={18} className="text-gray-500" />
                    <span className="font-medium">Pages:</span>
                    <span>{book.pages || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={18} className="text-gray-500" />
                    <span className="font-medium">Price:</span>
                    <span>₹{book.price ? book.price.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Availability Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-gray-500" />
                  <span>Total Copies: <strong className="font-semibold">{book.number_of_copies || 1}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-gray-500" />
                  <span>Available: <strong className="font-semibold">{book.available_copies || 0}</strong></span>
                </div>
                {book.current_due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500" />
                    <span>Expected Return: <strong className="font-semibold">{formatDate(book.current_due_date)}</strong></span>
                  </div>
                )}
                {book.reservation_queue_length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-500" />
                    <span>Queue: <strong className="font-semibold">{book.reservation_queue_length} waiting</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Section */}
            <div className="flex justify-center mt-6">
              {book.user_has_borrowed ? (
                <div className="flex flex-col items-center">
                  {book.can_renew ? (
                    <button
                      className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      onClick={handleRenew}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Renewing...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Renew Book
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle size={18} />
                      <span className="font-medium">{book.renewal_reason || 'Renewal not allowed.'}</span>
                    </div>
                  )}
                </div>
              ) : book.user_has_reserved ? (
                <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <Clock size={20} />
                  <span className="font-medium">You are <strong className="font-bold">#{book.user_queue_position}</strong> in the reservation queue</span>
                </div>
              ) : (
                <button
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                  onClick={handleReserve}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Reserving...
                    </>
                  ) : (
                    <>
                      <Clock size={16} />
                      Reserve This Book
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InlineBookDetails;
