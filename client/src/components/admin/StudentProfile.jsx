import React, { useState, useEffect } from 'react'
import { User, Book, IndianRupee, Calendar, ArrowLeft, Clock, CheckCircle, AlertCircle, Key } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

const StudentProfile = ({ studentId, onBack }) => {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')
  const [resetting, setResetting] = useState(false)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile()
    }
  }, [studentId])

  const fetchStudentProfile = async () => {
    try {
      setLoading(true)

      // Get user circulation info (includes current books and history)
      const circulationResponse = await axios.get(`/admin/circulation/user/${studentId}`)

      // Get user fines
      const finesResponse = await axios.get(`/admin/fines/user/${studentId}`)

      setStudentData({
        user: circulationResponse.data.user,
        currentBooks: circulationResponse.data.current_books,
        borrowingHistory: circulationResponse.data.borrowing_history,
        fines: finesResponse.data.fines,
        totalFine: finesResponse.data.total_pending
      })
    } catch (error) {
      console.error('Failed to fetch student profile:', error)
      alert('Failed to load student profile')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!studentData?.user?.id) return
    const confirmReset = window.confirm(`Are you sure you want to reset the password for ${studentData.user.name} (${studentData.user.user_id})?\n\nThe new password will be set to their User ID.`)
    if (!confirmReset) return

    try {
      setResetting(true)
      const response = await axios.post(`/admin/users/${studentData.user.id}/reset-password`)
      const newPwd = response.data?.default_password || studentData.user.user_id
      alert(`Password reset successfully.\n\nNew temporary password: ${newPwd}`)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-600">Loading student profile...</div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="p-4">
        <div className="text-center text-red-600">Failed to load student profile</div>
      </div>
    )
  }

  const { user, currentBooks, borrowingHistory, fines, totalFine } = studentData

  return (
    <div className="p-4">
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <button className="inline-flex items-center gap-2 text-white hover:text-gray-900" onClick={onBack}>
          <ArrowLeft size={16} />
          <span className="font-medium">Back to Students</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Student Profile</h1>
        {currentUser?.role === 'admin' && (
          <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-2 rounded-md disabled:opacity-60" onClick={handleResetPassword} disabled={resetting} title="Reset password to student's User ID">
            <Key size={16} /> {resetting ? 'Resetting...' : 'Reset Password'}
          </button>
        )}
      </div>

      {/* Student Information */}
      <div className="mt-4 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-700"><strong>Student ID:</strong> {user.user_id}</p>
            <p className="text-sm text-gray-700"><strong>Email:</strong> {user.email}</p>
            {user.college && <p className="text-sm text-gray-700"><strong>College:</strong> {user.college}</p>}
            {user.department && <p className="text-sm text-gray-700"><strong>Department:</strong> {user.department}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Book size={18} />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">{currentBooks.length}</div>
                <div className="text-xs text-gray-500">Current Books</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center">
                <IndianRupee size={18} />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">₹{totalFine.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Outstanding Fines</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-4 flex items-center gap-2 border-b">
        <button
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'current' ? 'border-indigo-600 text-white' : 'border-transparent text-white'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Books ({currentBooks.length})
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'history' ? 'border-indigo-600 text-white' : 'border-transparent text-white'}`}
          onClick={() => setActiveTab('history')}
        >
          Borrowing History ({borrowingHistory.length})
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'fines' ? 'border-indigo-600 text-white' : 'border-transparent text-white'}`}
          onClick={() => setActiveTab('fines')}
        >
          Fine History ({fines.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'current' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Currently Borrowed Books</h3>
            {currentBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 bg-white rounded-lg border border-dashed p-10">
                <Book size={48} />
                <p className="mt-2">No books currently borrowed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentBooks.map((item) => (
                  <div key={item.circulation_id} className={`rounded-lg border p-4 bg-white ${item.is_overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${item.is_overdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.is_overdue ? (
                          <>
                            <Clock size={12} />
                            Overdue
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            On Time
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2"><strong>Author:</strong> {item.author}</p>
                    <p className="text-sm text-gray-700"><strong>Access No:</strong> {item.access_no}</p>
                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                      <p><strong>Issued:</strong> {new Date(item.issue_date).toLocaleDateString()}</p>
                      <p><strong>Due:</strong> {new Date(item.due_date).toLocaleDateString()}</p>
                      {item.is_overdue && (
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle size={14} />
                          <span>{item.days_overdue} days overdue</span>
                          {item.fine_amount > 0 && (
                            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">₹{item.fine_amount.toFixed(2)} fine</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Borrowing History</h3>
            {borrowingHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 bg-white rounded-lg border border-dashed p-10">
                <Calendar size={48} />
                <p className="mt-2">No borrowing history</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Book Title</th>
                      <th className="text-left px-3 py-2">Author</th>
                      <th className="text-left px-3 py-2">Issue Date</th>
                      <th className="text-left px-3 py-2">Due Date</th>
                      <th className="text-left px-3 py-2">Return Date</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowingHistory.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.book_title}</td>
                        <td className="px-3 py-2">{item.author}</td>
                        <td className="px-3 py-2">{new Date(item.issue_date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{new Date(item.due_date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{item.return_date ? new Date(item.return_date).toLocaleDateString() : '-'}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${item.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {item.fine_amount > 0 ? `₹${item.fine_amount.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fines' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Fine History</h3>
            {fines.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 bg-white rounded-lg border border-dashed p-10">
                <IndianRupee size={48} />
                <p className="mt-2">No fine history</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Amount</th>
                      <th className="text-left px-3 py-2">Reason</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Created Date</th>
                      <th className="text-left px-3 py-2">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => (
                      <tr key={fine.id} className="border-t">
                        <td className="px-3 py-2">₹{fine.amount.toFixed(2)}</td>
                        <td className="px-3 py-2">{fine.reason}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${fine.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {fine.status === 'paid' ? (
                              <>
                                <CheckCircle size={12} />
                                Paid
                              </>
                            ) : (
                              <>
                                <AlertCircle size={12} />
                                Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2">{new Date(fine.created_date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{fine.paid_date ? new Date(fine.paid_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentProfile
