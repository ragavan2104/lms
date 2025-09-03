import React, { useState, useEffect } from 'react'
import { Clock, Book, Calendar, X, AlertCircle, RefreshCw, User } from 'lucide-react'
import axios from 'axios'

const MyReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/student/reservations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReservations(response.data.reservations || [])
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
      showNotification('Failed to load reservations', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleCancelReservation = async (reservationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`cancel_${reservationId}`]: true }))

      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/student/reservations/${reservationId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      showNotification('Reservation cancelled successfully!', 'success')
      fetchReservations() // Refresh reservations

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
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: 'Active',
        icon: Clock
      },
      fulfilled: {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Fulfilled',
        icon: Clock
      },
      cancelled: {
        className: 'bg-red-100 text-red-800 border-red-200',
        text: 'Cancelled',
        icon: X
      },
      expired: {
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Expired',
        icon: AlertCircle
      }
    }

    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon size={12} />
        {config.text}
      </span>
    )
  }

  const getDaysUntilPickup = (pickupDate) => {
    if (!pickupDate) return null
    const pickup = new Date(pickupDate)
    const today = new Date()
    const diffTime = pickup - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
            <p className="text-gray-600">Manage your book reservations and queue status</p>
          </div>
          <button
            onClick={fetchReservations}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Reservations Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading your reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Clock size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reservations Found</h3>
            <p className="text-gray-600 mb-6">You haven't reserved any books yet.</p>
            <a
              href="/student/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Book size={16} />
              Browse Books
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => {
              const daysUntilPickup = getDaysUntilPickup(reservation.pickup_deadline)
              const isExpiringSoon = daysUntilPickup !== null && daysUntilPickup <= 2 && daysUntilPickup >= 0
              
              return (
                <div key={reservation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Book size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{reservation.book.title}</h3>
                          <p className="text-gray-600 mb-1">by {reservation.book.author_1}</p>
                          <p className="text-sm text-gray-500">Access No: {reservation.book.access_no}</p>
                        </div>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Queue Position:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          #{reservation.queue_position}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reserved Date:</span>
                        <span className="text-sm text-gray-900">{formatDate(reservation.reservation_date)}</span>
                      </div>
                      {reservation.pickup_deadline && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pickup Date:</span>
                          <span className={`text-sm ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {formatDate(reservation.pickup_deadline)}
                            {daysUntilPickup !== null && daysUntilPickup >= 0 && (
                              <span className="text-xs text-gray-500 ml-1">({daysUntilPickup} days)</span>
                            )}
                          </span>
                        </div>
                      )}
                      {reservation.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-sm text-gray-600">Notes:</span>
                          <p className="text-sm text-gray-900 mt-1">{reservation.notes}</p>
                        </div>
                      )}
                    </div>

                    {isExpiringSoon && reservation.status === 'active' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-600" />
                        <span className="text-red-800 text-sm">Pickup deadline approaching! Please collect your book soon.</span>
                      </div>
                    )}

                    {reservation.status === 'active' && (
                      <div className="flex justify-end">
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={actionLoading[`cancel_${reservation.id}`]}
                        >
                          {actionLoading[`cancel_${reservation.id}`] ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              Cancel Reservation
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReservations
