import React, { useState, useEffect } from 'react'
import { Calendar, Clock, X, AlertCircle, Book, User } from 'lucide-react'

const ReservationModal = ({ 
  isOpen, 
  onClose, 
  book, 
  onConfirm, 
  loading = false 
}) => {
  const [pickupDate, setPickupDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [availabilityInfo, setAvailabilityInfo] = useState(null)

  // Set minimum date to today
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      setPickupDate(tomorrow.toISOString().split('T')[0])
      setNotes('')
      setErrors({})
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    
    if (!pickupDate) {
      newErrors.pickupDate = 'Please select a pickup date'
    } else {
      const selectedDate = new Date(pickupDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.pickupDate = 'Pickup date must be today or in the future'
      }
      
      // Check if date is too far in the future (30 days)
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 30)
      if (selectedDate > maxDate) {
        newErrors.pickupDate = 'Pickup date cannot be more than 30 days from today'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Call the onConfirm function with reservation data
    onConfirm({
      pickup_date: pickupDate,
      notes: notes.trim()
    }, (error) => {
      // Handle availability date errors
      if (error?.response?.data?.earliest_available_date) {
        setAvailabilityInfo({
          earliest_available_date: error.response.data.earliest_available_date,
          expected_return_date: error.response.data.expected_return_date,
          message: error.response.data.error
        })
        setErrors({ pickupDate: 'Please select a date from the available range below' })
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content reservation-modal">
        <div className="modal-header">
          <h2>Reserve Book</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Book Information */}
          {book && (
            <div className="book-info-section">
              <div className="book-icon">
                <Book size={24} />
              </div>
              <div className="book-details">
                <h3>{book.title}</h3>
                <p>by {book.author_1 || book.author}</p>
                <p className="access-no">Access No: {book.access_no}</p>
                {book.available_copies !== undefined && (
                  <p className="availability">
                    {book.available_copies > 0 
                      ? `${book.available_copies} copies available`
                      : 'Currently unavailable'
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Pickup Date Selection */}
            <div className="form-group">
              <label htmlFor="pickupDate">
                <Calendar size={16} />
                When would you like to pick up this book? *
              </label>
              <input
                type="date"
                id="pickupDate"
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value)
                  if (errors.pickupDate) {
                    setErrors(prev => ({ ...prev, pickupDate: '' }))
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className={errors.pickupDate ? 'error' : ''}
                required
              />
              {errors.pickupDate && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.pickupDate}
                </span>
              )}
              <small className="help-text">
                Select the date you plan to pick up the book. You can pick it up anytime from this date onwards.
              </small>

              {/* Availability Information */}
              {availabilityInfo && (
                <div className="availability-info">
                  <AlertCircle size={16} />
                  <div>
                    <p><strong>Book Availability Information:</strong></p>
                    <p>{availabilityInfo.message}</p>
                    <p><strong>Available from:</strong> {new Date(availabilityInfo.earliest_available_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes (Optional) */}
            <div className="form-group">
              <label htmlFor="notes">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                rows={3}
                maxLength={200}
              />
              <small className="help-text">
                {notes.length}/200 characters
              </small>
            </div>

            {/* Information Box */}
            <div className="info-box">
              <AlertCircle size={16} />
              <div>
                <p><strong>Reservation Information:</strong></p>
                <ul>
                  <li>You will be notified when the book becomes available</li>
                  <li>Your reservation will expire after 30 days if not picked up</li>
                  <li>You can cancel your reservation anytime from your dashboard</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Clock size={16} className="spinning" />
                    Reserving...
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    Reserve Book
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReservationModal
