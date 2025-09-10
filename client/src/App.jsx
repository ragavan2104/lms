import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import OPAC from './components/OPAC'
import PublicQuestionBank from './components/PublicQuestionBank'
import PublicNewsClippings from './components/PublicNewsClippings'
import PublicEResources from './components/PublicEResources'
import PublicThesis from './components/PublicThesis'
import PublicJournals from './components/PublicJournals'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import LibrarianDashboard from './components/LibrarianDashboard'
import StudentDashboard from './components/student/StudentDashboard'
import GateEntryDashboard from './components/GateEntryDashboard'
import MandatoryPasswordChange from './components/auth/MandatoryPasswordChange'
import './App.css'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, requiresPasswordChange } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // Redirect to password change if required for any user
  if (requiresPasswordChange) {
    return <Navigate to="/change-password" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public OPAC Route - Default Landing Page */}
            <Route path="/" element={<OPAC />} />
            <Route path="/opac" element={<OPAC />} />
            <Route path="/question-banks" element={<PublicQuestionBank />} />
            <Route path="/e-resources" element={<PublicEResources />} />
            {/* Legacy route redirect */}
            <Route path="/ebooks" element={<PublicEResources />} />
            <Route path="/news-clippings" element={<PublicNewsClippings />} />
            <Route path="/thesis" element={<PublicThesis />} />
            <Route path="/journals" element={<PublicJournals />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route
              path="/change-password"
              element={
                <MandatoryPasswordChange
                  onPasswordChanged={() => window.location.reload()}
                />
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                  <LibrarianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Special Routes */}
            <Route path="/gate" element={<GateEntryDashboard />} />
            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          </Routes>
        </div>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </AuthProvider>
  )
}

export default App;
