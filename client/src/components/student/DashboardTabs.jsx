import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Calendar, Clock, DollarSign, User,
  Search, Filter, Eye, RotateCcw, AlertCircle,
  CheckCircle, XCircle, Plus, Minus, Star,
  Download, RefreshCw, Bell, Settings, MapPin,
  Hash, Building, Monitor, FileText, Newspaper,
  HelpCircle
} from 'lucide-react'

// Overview Tab Component
export const OverviewTab = ({ dashboardData, onReserveBook, onRenewBook, onCancelReservation, formatDate, getDaysRemaining, getStatusColor }) => {
  const navigate = useNavigate()

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Current Books */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="mr-2" size={20} />
            Current Books ({dashboardData?.borrowed_books?.length || 0})
          </h3>
        </div>
        <div className="p-6">
          {dashboardData?.borrowed_books?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.borrowed_books.slice(0, 3).map((book) => {
                const daysRemaining = getDaysRemaining(book.due_date)
                const isOverdue = daysRemaining < 0
                const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0
                
                return (
                  <div key={book.id} className={`p-4 rounded-lg border-2 ${
                    isOverdue ? 'border-red-200 bg-red-50' : 
                    isDueSoon ? 'border-yellow-200 bg-yellow-50' : 
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{book.book_title}</h4>
                        <p className="text-sm text-gray-600">by {book.book_author}</p>
                        <p className="text-xs text-gray-500 mt-1">Access No: {book.access_no}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverdue ? 'bg-red-100 text-red-800' :
                          isDueSoon ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Active'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {formatDate(book.due_date)}
                        </p>
                        {!isOverdue && (
                          <p className="text-xs text-gray-500">
                            {daysRemaining} days remaining
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {dashboardData.borrowed_books.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{dashboardData.borrowed_books.length - 3} more books
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No books borrowed</h3>
              <p className="mt-1 text-sm text-gray-500">Start by browsing available books</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="mr-2" size={20} />
            Recent Reservations ({dashboardData?.reservations?.length || 0})
          </h3>
        </div>
        <div className="p-6">
          {dashboardData?.reservations?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.reservations.slice(0, 3).map((reservation) => (
                <div key={reservation.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{reservation.book_title}</h4>
                      <p className="text-sm text-gray-600">by {reservation.book_author}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reserved: {formatDate(reservation.reservation_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Queue #{reservation.queue_position}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {reservation.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.reservations.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{dashboardData.reservations.length - 3} more reservations
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations</h3>
              <p className="mt-1 text-sm text-gray-500">Reserve books when they're not available</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    {/* <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
            <Search className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">Browse Books</p>
            <p className="text-xs text-gray-500">Find your next read</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
            <RefreshCw className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">Renew Books</p>
            <p className="text-xs text-gray-500">Extend due dates</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
            <Calendar className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">View History</p>
            <p className="text-xs text-gray-500">See past borrowings</p>
          </button>
        </div>
      </div>
    </div> */}


  </div>
  )
}

// Current Books Tab Component
export const CurrentBooksTab = ({ dashboardData, onRenewBook, formatDate, getDaysRemaining, getStatusColor }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Currently Borrowed Books ({dashboardData?.borrowed_books?.length || 0})
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AlertCircle size={16} />
            <span>Remember to return books on time to avoid fines</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {dashboardData?.borrowed_books?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.borrowed_books.map((book) => {
              const daysRemaining = getDaysRemaining(book.due_date)
              const isOverdue = daysRemaining < 0
              const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0
              
              return (
                <div key={book.id} className={`p-6 rounded-lg border-2 ${
                  isOverdue ? 'border-red-200 bg-red-50' : 
                  isDueSoon ? 'border-yellow-200 bg-yellow-50' : 
                  'border-gray-200 bg-white'
                } shadow-sm`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{book.book_title}</h4>
                      <p className="text-gray-600">by {book.book_author}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500 flex items-center">
                          <Hash size={14} className="mr-1" />
                          Access No: {book.access_no}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Issued: {formatDate(book.issue_date)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Due: {formatDate(book.due_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isOverdue ? 'bg-red-100 text-red-800' :
                        isDueSoon ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Active'}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        {isOverdue ? 
                          `${Math.abs(daysRemaining)} days overdue` :
                          `${daysRemaining} days remaining`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Renewals: {book.renewal_count || 0}/3
                    </div>
                    <button
                      onClick={() => onRenewBook(book.id)}
                      disabled={isOverdue || (book.renewal_count || 0) >= 3}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isOverdue || (book.renewal_count || 0) >= 3
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition-colors`}
                    >
                      <RefreshCw size={16} className="inline mr-1" />
                      {isOverdue ? 'Cannot Renew' : (book.renewal_count || 0) >= 3 ? 'Max Renewals' : 'Renew'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No books currently borrowed</h3>
            <p className="mt-2 text-gray-500">Visit the library or browse our catalog to borrow books</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Browse Available Books
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)
