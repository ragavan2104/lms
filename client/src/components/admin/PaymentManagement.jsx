import React, { useState } from 'react'
import { Search, User, IndianRupee, CreditCard, Printer, CheckCircle, AlertCircle, Receipt, Download, RefreshCw } from 'lucide-react'
import api from '../../services/api'

const PaymentManagement = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [userLoading, setUserLoading] = useState(false)
  const [selectedFines, setSelectedFines] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [showReceiptConfirm, setShowReceiptConfirm] = useState(false)
  const [isGeneratingFines, setIsGeneratingFines] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    userId: '',
    paymentMethod: 'cash'
  })

  const handleUserSearch = async (userId) => {
    if (!userId.trim()) {
      setUserInfo(null)
      setSelectedFines([])
      setPaymentSuccess(false)
      setReceipt(null)
      return
    }

    setUserLoading(true)
    try {
      // Get user fines using the correct admin endpoint
      const response = await api.get(`/admin/fines/user/${userId}`)

      setUserInfo({
        user: response.data.user,
        fines: response.data.fines.filter(fine => fine.status === 'pending'),
        total_pending: response.data.total_pending
      })
      
      setFormData(prev => ({ ...prev, userId: userId }))
      setErrors(prev => ({ ...prev, user: '' }))
      setSelectedFines([])
      setPaymentSuccess(false)
      setReceipt(null)
    } catch (error) {
      setUserInfo(null)
      setSelectedFines([])
      setErrors(prev => ({ ...prev, user: error.response?.data?.error || 'User not found or no fines available' }))
    } finally {
      setUserLoading(false)
    }
  }

  const toggleFineSelection = (fine) => {
    const isSelected = selectedFines.some(f => f.id === fine.id)
    
    if (isSelected) {
      setSelectedFines(selectedFines.filter(f => f.id !== fine.id))
    } else {
      setSelectedFines([...selectedFines, fine])
    }
  }

  const selectAllFines = () => {
    if (selectedFines.length === userInfo.fines.length) {
      setSelectedFines([])
    } else {
      setSelectedFines([...userInfo.fines])
    }
  }

  const calculateTotalAmount = () => {
    return selectedFines.reduce((sum, fine) => sum + fine.amount, 0)
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!userInfo) {
      setErrors({ user: 'Please search and select a valid user' })
      return
    }

    if (selectedFines.length === 0) {
      setErrors({ fines: 'Please select at least one fine to pay' })
      return
    }

    setIsProcessing(true)
    try {
      const paymentPromises = selectedFines.map(fine => 
        api.post(`/admin/fines/${fine.id}/pay`)
      )
      
      await Promise.all(paymentPromises)
      
      // Create receipt data
      const receiptData = {
        receiptNumber: `RCP-${Date.now()}`,
        date: new Date().toISOString(),
        user: userInfo.user,
        fines: selectedFines,
        totalAmount: calculateTotalAmount(),
        paymentMethod: formData.paymentMethod
      }
      
      setReceipt(receiptData)
      setPaymentSuccess(true)

      // DO NOT auto-refresh user info to preserve receipt
      // User can manually refresh if needed after printing receipt
      
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateReceiptNoPayment = async () => {
    if (!userInfo) {
      setErrors({ user: 'Please search and select a valid user' })
      return
    }

    if (selectedFines.length === 0) {
      setErrors({ fines: 'Please select at least one fine to generate receipt' })
      return
    }

    setIsGeneratingReceipt(true)
    try {
      const response = await api.post('/admin/fines/generate-receipt', {
        fine_ids: selectedFines.map(fine => fine.id),
        user_id: userInfo.user.user_id,
        payment_method: formData.paymentMethod
      })

      setReceipt(response.data.receipt)
      setPaymentSuccess(false) // This is not a payment, just receipt generation
      setShowReceiptConfirm(false)

    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate receipt')
    } finally {
      setIsGeneratingReceipt(false)
    }
  }

  const printReceipt = () => {
    if (!receipt) return

    const printWindow = window.open('', '_blank', 'width=600,height=800')
    const isPaymentReceipt = receipt.payment_processed !== false
    const receiptTitle = isPaymentReceipt ? 'Payment Receipt' : 'RECEIPT - NO PAYMENT PROCESSED'
    const receiptNumber = receipt.receiptNumber || receipt.receipt_number

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${receiptTitle} - ${receiptNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: white;
            color: black;
          }
          .receipt {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h2 { margin: 0; font-size: 24px; }
          .header h3 { margin: 10px 0 0 0; font-size: 18px; color: #666; }
          .no-payment-notice {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            padding: 10px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            color: #856404;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 2px 0;
          }
          .row span:first-child { font-weight: 500; }
          .total {
            border-top: 2px solid #000;
            padding-top: 15px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 16px;
          }
          .fine-item {
            border-bottom: 1px dotted #ccc;
            padding: 10px 0;
            margin: 5px 0;
          }
          .fine-item:last-child { border-bottom: none; }
          h4 {
            margin: 20px 0 10px 0;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
          .print-actions {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .print-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 10px;
            font-size: 14px;
          }
          .print-btn:hover { background: #0056b3; }
          @media print {
            .print-actions { display: none; }
            body { margin: 0; }
            .receipt { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>Library Management System</h2>
            <h3>${receiptTitle}</h3>
          </div>

          ${!isPaymentReceipt ? `
            <div class="no-payment-notice">
              ⚠️ NO PAYMENT PROCESSED ⚠️<br>
              This receipt does not constitute payment confirmation
            </div>
          ` : ''}

          <div class="print-actions">
            <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
            <button class="print-btn" onclick="window.close()">❌ Close</button>
          </div>

          <div class="row"><span>Receipt Number:</span><span>${receiptNumber}</span></div>
          <div class="row"><span>Date & Time:</span><span>${new Date(receipt.date).toLocaleString()}</span></div>
          <div class="row"><span>Student ID:</span><span>${receipt.user.user_id}</span></div>
          <div class="row"><span>Student Name:</span><span>${receipt.user.name}</span></div>
          <div class="row"><span>Email:</span><span>${receipt.user.email}</span></div>
          ${receipt.user.college ? `<div class="row"><span>College:</span><span>${receipt.user.college}</span></div>` : ''}
          ${receipt.user.department ? `<div class="row"><span>Department:</span><span>${receipt.user.department}</span></div>` : ''}
          ${!isPaymentReceipt && receipt.generated_by ? `<div class="row"><span>Generated By:</span><span>${receipt.generated_by}</span></div>` : ''}

          <h4>${isPaymentReceipt ? 'Fines Paid Details:' : 'Fine Details:'}</h4>
          ${receipt.fines.map((fine, index) => `
            <div class="fine-item">
              <div class="row"><span>Fine #${index + 1}:</span><span>${fine.reason}</span></div>
              <div class="row"><span>Amount:</span><span>₹${fine.amount.toFixed(2)}</span></div>
              <div class="row"><span>Date Created:</span><span>${new Date(fine.created_date).toLocaleDateString()}</span></div>
            </div>
          `).join('')}

          <div class="total">
            ${isPaymentReceipt ? `<div class="row"><span>Payment Method:</span><span>${(receipt.paymentMethod || receipt.payment_method || 'N/A').toUpperCase()}</span></div>` : ''}
            <div class="row"><span>${isPaymentReceipt ? 'Total Amount Paid:' : 'Total Amount Due:'}</span><span>₹${(receipt.totalAmount || receipt.total_amount || 0).toFixed(2)}</span></div>
          </div>

          <div class="footer">
            <p><strong>${isPaymentReceipt ? 'Thank you for your payment!' : 'Payment pending - Please pay at the library counter'}</strong></p>
            <p>This is a computer-generated receipt.</p>
            ${!isPaymentReceipt ? '<p><strong>This receipt does not constitute payment confirmation.</strong></p>' : ''}
            <p>For any queries, please contact the library administration.</p>
          </div>
        </div>

        <script>
          // Auto-focus for better printing experience
          window.onload = function() {
            window.focus();
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()

    // Don't auto-print, let user choose when to print
    printWindow.focus()
  }

  const downloadReceipt = () => {
    if (!receipt) return

    const isPaymentReceipt = receipt.payment_processed !== false
    const receiptNumber = receipt.receiptNumber || receipt.receipt_number
    const receiptTitle = isPaymentReceipt ? 'Payment Receipt' : 'RECEIPT - NO PAYMENT PROCESSED'

    const receiptText = `
LIBRARY MANAGEMENT SYSTEM
${receiptTitle}
========================
${!isPaymentReceipt ? '\n⚠️ NO PAYMENT PROCESSED ⚠️\nThis receipt does not constitute payment confirmation\n' : ''}
Receipt Number: ${receiptNumber}
Date & Time: ${new Date(receipt.date).toLocaleString()}
Student ID: ${receipt.user.user_id}
Student Name: ${receipt.user.name}
Email: ${receipt.user.email}
${receipt.user.college ? `College: ${receipt.user.college}` : ''}
${receipt.user.department ? `Department: ${receipt.user.department}` : ''}
${!isPaymentReceipt && receipt.generated_by ? `Generated By: ${receipt.generated_by}` : ''}

${isPaymentReceipt ? 'FINES PAID DETAILS:' : 'FINE DETAILS:'}
==================
${receipt.fines.map((fine, index) => `
Fine #${index + 1}: ${fine.reason}
Amount: ₹${fine.amount.toFixed(2)}
Date Created: ${new Date(fine.created_date).toLocaleDateString()}
${!isPaymentReceipt ? `Status: ${fine.status}` : ''}
`).join('')}

${isPaymentReceipt ? 'PAYMENT SUMMARY:' : 'AMOUNT SUMMARY:'}
===============
${isPaymentReceipt ? `Payment Method: ${(receipt.paymentMethod || receipt.payment_method || 'N/A').toUpperCase()}` : ''}
${isPaymentReceipt ? 'Total Amount Paid:' : 'Total Amount Due:'} ₹${(receipt.totalAmount || receipt.total_amount || 0).toFixed(2)}

${isPaymentReceipt ? 'Thank you for your payment!' : 'Payment pending - Please pay at the library counter'}
This is a computer-generated receipt.
${!isPaymentReceipt ? 'This receipt does not constitute payment confirmation.' : ''}
For any queries, please contact the library administration.
    `

    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Receipt_${receiptNumber}_${receipt.user.user_id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const generateAutomaticFines = async () => {
    setIsGeneratingFines(true)
    try {
      const response = await api.post('/admin/fines/generate-automatic')
      
      alert(`Automatic fine generation completed!\n• Created fines: ${response.data.created_fines}\n• Updated circulations: ${response.data.updated_circulations}`)
      
      // Refresh user info if a user is currently selected
      if (formData.userId) {
        handleUserSearch(formData.userId)
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate automatic fines')
    } finally {
      setIsGeneratingFines(false)
    }
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <div className="page-title">
          <h1>Payment Management</h1>
          <p>Process fine payments and generate receipts</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={generateAutomaticFines}
            disabled={isGeneratingFines}
            title="Generate fines for all overdue books that don't have fines yet"
          >
            <RefreshCw size={16} className={isGeneratingFines ? 'spinning' : ''} />
            {isGeneratingFines ? 'Generating...' : 'Generate Overdue Fines'}
          </button>
        </div>
      </div>

      <div className="payment-container">
        <div className="payment-form-section">
          <div className="form-card">
            <h2>Fine Payment</h2>
            
            <form onSubmit={handlePayment}>
              {/* User Search */}
              <div className="form-group">
                <label>Student/Staff ID *</label>
                <div className="search-input">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="Enter user ID (roll number)"
                    value={formData.userId}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, userId: e.target.value }))
                      handleUserSearch(e.target.value)
                    }}
                    className={errors.user ? 'error' : ''}
                  />
                  {userLoading && <div className="loading-spinner">Loading...</div>}
                </div>
                {errors.user && <span className="error-text">{errors.user}</span>}
              </div>

              {/* Payment Method */}
              {userInfo && userInfo.fines.length > 0 && (
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              )}

              {/* Fines Selection */}
              {userInfo && userInfo.fines.length > 0 && (
                <div className="fines-selection-section">
                  <div className="section-header">
                    <h3>Select Fines to Pay</h3>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={selectAllFines}
                    >
                      {selectedFines.length === userInfo.fines.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  {errors.fines && <span className="error-text">{errors.fines}</span>}
                  
                  <div className="fines-list">
                    {userInfo.fines.map((fine) => (
                      <div
                        key={fine.id}
                        className={`fine-card ${selectedFines.some(f => f.id === fine.id) ? 'selected' : ''}`}
                        onClick={() => toggleFineSelection(fine)}
                      >
                        <div className="fine-header">
                          <div className="fine-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedFines.some(f => f.id === fine.id)}
                              onChange={() => toggleFineSelection(fine)}
                            />
                          </div>
                          <div className="fine-amount">
                            <IndianRupee size={16} />
                            ₹{fine.amount.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="fine-details">
                          <p><strong>Reason:</strong> {fine.reason}</p>
                          <p><strong>Date:</strong> {new Date(fine.created_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              {selectedFines.length > 0 && (
                <div className="payment-summary">
                  <div className="summary-header">
                    <CreditCard size={20} />
                    <h3>Payment Summary</h3>
                  </div>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Selected Fines:</span>
                      <span>{selectedFines.length}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Amount:</span>
                      <span>₹{calculateTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {userInfo && userInfo.fines.length > 0 && (
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isProcessing || isGeneratingReceipt || selectedFines.length === 0}
                  >
                    {isProcessing ? 'Processing...' : `Process Payment ₹${calculateTotalAmount().toFixed(2)}`}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isProcessing || isGeneratingReceipt || selectedFines.length === 0}
                    onClick={() => setShowReceiptConfirm(true)}
                  >
                    {isGeneratingReceipt ? 'Generating...' : 'Generate Receipt (No Payment)'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* User Information Panel */}
        {userInfo && (
          <div className="user-info-section">
            <div className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  <User size={24} />
                </div>
                <div className="user-details">
                  <h3>{userInfo.user.name}</h3>
                  <p>ID: {userInfo.user.user_id}</p>
                  <p>{userInfo.user.email}</p>
                  {userInfo.user.college && (
                    <p>{userInfo.user.college} - {userInfo.user.department}</p>
                  )}
                </div>
                <div className="user-status">
                  <div className="status-badge info">
                    <IndianRupee size={16} />
                    ₹{userInfo.total_pending?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* No Fines Message */}
              {userInfo.fines.length === 0 && (
                <div className="no-fines-message">
                  <CheckCircle size={48} />
                  <h3>No Outstanding Fines</h3>
                  <p>This user has no pending fines to pay.</p>
                  <div className="info-note">
                    <AlertCircle size={16} />
                    <span>If this user has overdue books, click "Generate Overdue Fines" button above to automatically create fines for overdue items.</span>
                  </div>
                </div>
              )}

              {/* Receipt Display */}
              {receipt && (
                <div className={`receipt-display ${paymentSuccess ? 'payment-success' : 'receipt-generated'}`}>
                  <div className="success-header">
                    {paymentSuccess ? (
                      <>
                        <CheckCircle size={24} />
                        <h3>Payment Successful!</h3>
                      </>
                    ) : (
                      <>
                        <Receipt size={24} />
                        <h3>Receipt Generated (No Payment)</h3>
                      </>
                    )}
                  </div>
                  <div className="success-details">
                    <p>Receipt #: {receipt.receiptNumber || receipt.receipt_number}</p>
                    <p>{paymentSuccess ? 'Amount Paid:' : 'Amount Due:'} ₹{(receipt.totalAmount || receipt.total_amount || 0).toFixed(2)}</p>
                    {paymentSuccess && <p>Payment Method: {(receipt.paymentMethod || receipt.payment_method || 'N/A').toUpperCase()}</p>}
                    {!paymentSuccess && <p className="no-payment-notice">⚠️ No payment has been processed</p>}
                  </div>
                  <div className="success-actions">
                    <button
                      className="btn btn-primary"
                      onClick={printReceipt}
                    >
                      <Printer size={16} />
                      Print Receipt
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={downloadReceipt}
                    >
                      <Download size={16} />
                      Download Receipt
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => {
                        // Refresh user info after receipt is handled
                        handleUserSearch(userInfo.user.user_id)
                      }}
                    >
                      <Search size={16} />
                      Refresh User Info
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setPaymentSuccess(false)
                        setReceipt(null)
                        // Refresh user info when closing receipt
                        handleUserSearch(userInfo.user.user_id)
                      }}
                    >
                      <Receipt size={16} />
                      Close Receipt
                    </button>
                  </div>
                  <div className="receipt-note">
                    <p><strong>✅ Receipt Ready:</strong> This receipt will remain visible until you close it. Print or download before closing.</p>
                    <p><strong>💡 Tip:</strong> Use "Refresh User Info" to see updated fine status after printing.</p>
                  </div>
                </div>
              )}

              {/* Fine Statistics */}
              {userInfo.fines.length > 0 && (
                <div className="fine-stats">
                  <h4>Fine Summary</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Total Fines:</span>
                      <span className="stat-value">{userInfo.fines.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Amount:</span>
                      <span className="stat-value">₹{userInfo.total_pending?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Selected:</span>
                      <span className="stat-value">{selectedFines.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Selected Amount:</span>
                      <span className="stat-value">₹{calculateTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Receipt Generation */}
      {showReceiptConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Generate Receipt Without Payment</h3>
            </div>
            <div className="modal-body">
              <div className="confirmation-notice">
                <AlertCircle size={24} className="warning-icon" />
                <div>
                  <p><strong>Important Notice:</strong></p>
                  <p>You are about to generate a receipt for the selected fines WITHOUT processing any payment.</p>
                  <ul>
                    <li>Fine status will remain "pending"</li>
                    <li>No payment will be recorded</li>
                    <li>This is for documentation purposes only</li>
                  </ul>
                </div>
              </div>

              <div className="selected-fines-summary">
                <h4>Selected Fines ({selectedFines.length}):</h4>
                <div className="fines-list">
                  {selectedFines.map((fine, index) => (
                    <div key={fine.id} className="fine-summary-item">
                      <span>{fine.reason}</span>
                      <span>₹{fine.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="total-summary">
                  <strong>Total Amount: ₹{calculateTotalAmount().toFixed(2)}</strong>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReceiptConfirm(false)}
                disabled={isGeneratingReceipt}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={handleGenerateReceiptNoPayment}
                disabled={isGeneratingReceipt}
              >
                {isGeneratingReceipt ? 'Generating...' : 'Generate Receipt (No Payment)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentManagement
