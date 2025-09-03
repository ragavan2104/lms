import React, { useState, useEffect } from 'react'
import { 
  Clock, User, Book, Calendar, AlertCircle, CheckCircle, 
  X, Search, Filter, RefreshCw, Eye, Trash2, UserCheck
} from 'lucide-react'
import axios from 'axios'

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState({})
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchReservations()
  }, [currentPage, statusFilter])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/admin/reservations', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          per_page: 20,
          status: statusFilter
        }
      })
      
      setReservations(response.data.reservations)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching reservations:', error)
      showNotification('Failed to load reservations', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleFulfillReservation = async (reservationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`fulfill_${reservationId}`]: true }))
      
      const token = localStorage.getItem('token')
      await axios.post(`/admin/reservations/${reservationId}/fulfill`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      showNotification('Reservation fulfilled successfully!', 'success')
      fetchReservations()
      
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fulfill reservation'
      showNotification(message, 'error')
    } finally {
      setActionLoading(prev => ({ ...prev, [`fulfill_${reservationId}`]: false }))
    }
  }

  const handleCancelReservation = async (reservationId, reason = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [`cancel_${reservationId}`]: true }))
      
      const token = localStorage.getItem('token')
      await axios.delete(`/admin/reservations/${reservationId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason }
      })
      
      showNotification('Reservation cancelled successfully!', 'success')
      fetchReservations()
      
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to cancel reservation'
      showNotification(message, 'error')
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel_${reservationId}`]: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      fulfilled: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
    
    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const filteredReservations = reservations.filter(reservation =>
    reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.book.access_no.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="reservation-management">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Reservation Management</h1>
          <p>Manage book reservations and queue</p>
        </div>
        <button 
          onClick={fetchReservations}
          className="btn btn-secondary"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by user, book title, user ID, or access number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">Active Reservations</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="all">All Reservations</option>
          </select>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading reservations...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3>No reservations found</h3>
            <p>No reservations match your current filters</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Reserved Date</th>
                <th>Queue Position</th>
                <th>Status</th>
                <th>Pickup Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="user-name">{reservation.user.name}</div>
                        <div className="user-id">{reservation.user.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="book-info">
                      <div className="book-title">{reservation.book.title}</div>
                      <div className="book-details">
                        by {reservation.book.author_1} • {reservation.book.access_no}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(reservation.reservation_date)}</td>
                  <td>
                    <span className="queue-position">
                      #{reservation.queue_position}
                    </span>
                  </td>
                  <td>{getStatusBadge(reservation.status)}</td>
                  <td>
                    {reservation.pickup_deadline ? (
                      <span className="pickup-deadline">
                        {formatDate(reservation.pickup_deadline)}
                      </span>
                    ) : (
                      <span className="text-muted">Not notified</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {reservation.status === 'active' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleFulfillReservation(reservation.id)}
                            disabled={actionLoading[`fulfill_${reservation.id}`]}
                            title="Fulfill reservation"
                          >
                            {actionLoading[`fulfill_${reservation.id}`] ? (
                              <RefreshCw size={14} className="spinning" />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancelReservation(reservation.id, 'Cancelled by admin')}
                            disabled={actionLoading[`cancel_${reservation.id}`]}
                            title="Cancel reservation"
                          >
                            {actionLoading[`cancel_${reservation.id}`] ? (
                              <RefreshCw size={14} className="spinning" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
            disabled={currentPage === pagination.pages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ReservationManagement
