import React, { useState, useEffect } from 'react'
import { Book, Calendar, Clock, CheckCircle, AlertCircle, RotateCcw, DollarSign } from 'lucide-react'
import axios from 'axios'

const MyBorrowingHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, current, returned, overdue
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchHistory()
  }, [currentPage, filter])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: itemsPerPage,
        status: filter
      })

      const response = await axios.get(`/student/borrowing-history?${params.toString()}`)
      setHistory(response.data.history)
      setTotalPages(Math.ceil(response.data.total / itemsPerPage))
    } catch (error) {
      console.error('Failed to fetch borrowing history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (item) => {
    const now = new Date()
    const dueDate = new Date(item.due_date)
    
    if (item.status === 'returned') {
      return {
        status: 'returned',
        text: 'Returned',
        icon: CheckCircle,
        color: 'success'
      }
    } else if (now > dueDate) {
      return {
        status: 'overdue',
        text: 'Overdue',
        icon: AlertCircle,
        color: 'danger'
      }
    } else {
      return {
        status: 'current',
        text: 'Current',
        icon: Clock,
        color: 'info'
      }
    }
  }

  const calculateDaysOverdue = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = now - due
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="borrowing-history">
      <div className="page-header">
        <div>
          <h1>My Borrowing History</h1>
          <p>Track your book borrowing activities and due dates</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setFilter('all')
            setCurrentPage(1)
          }}
        >
          All Books
        </button>
        <button
          className={`tab ${filter === 'current' ? 'active' : ''}`}
          onClick={() => {
            setFilter('current')
            setCurrentPage(1)
          }}
        >
          Currently Borrowed
        </button>
        <button
          className={`tab ${filter === 'returned' ? 'active' : ''}`}
          onClick={() => {
            setFilter('returned')
            setCurrentPage(1)
          }}
        >
          Returned Books
        </button>
        <button
          className={`tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => {
            setFilter('overdue')
            setCurrentPage(1)
          }}
        >
          Overdue Books
        </button>
      </div>

      {/* History List */}
      <div className="history-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading borrowing history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="no-data">
            <Book size={48} />
            <h3>No Borrowing History</h3>
            <p>You haven't borrowed any books yet or no books match the selected filter.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => {
              const statusInfo = getStatusInfo(item)
              const StatusIcon = statusInfo.icon
              const daysOverdue = calculateDaysOverdue(item.due_date)
              
              return (
                <div key={item.id} className={`history-item ${statusInfo.status}`}>
                  <div className="item-header">
                    <div className="book-info">
                      <div className="book-icon">
                        <Book size={20} />
                      </div>
                      <div className="book-details">
                        <h3>{item.book_title}</h3>
                        <p>by {item.book_author}</p>
                        <span className="access-no">Access No: {item.access_no}</span>
                      </div>
                    </div>
                    <div className={`status-badge ${statusInfo.color}`}>
                      <StatusIcon size={16} />
                      {statusInfo.text}
                    </div>
                  </div>
                  
                  <div className="item-content">
                    <div className="date-info">
                      <div className="date-item">
                        <Calendar size={14} />
                        <span>Issued: {formatDate(item.issue_date)}</span>
                      </div>
                      <div className="date-item">
                        <Clock size={14} />
                        <span>Due: {formatDate(item.due_date)}</span>
                      </div>
                      {item.return_date && (
                        <div className="date-item">
                          <CheckCircle size={14} />
                          <span>Returned: {formatDate(item.return_date)}</span>
                        </div>
                      )}
                    </div>
                    
                    {statusInfo.status === 'overdue' && (
                      <div className="overdue-info">
                        <AlertCircle size={16} />
                        <span>{daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue</span>
                      </div>
                    )}
                    
                    {item.fine_amount > 0 && (
                      <div className="fine-info">
                        <DollarSign size={16} />
                        <span>Fine: ₹{item.fine_amount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {item.renewal_count > 0 && (
                      <div className="renewal-info">
                        <RotateCcw size={16} />
                        <span>Renewed {item.renewal_count} time{item.renewal_count !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? 'active' : ''}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default MyBorrowingHistory
