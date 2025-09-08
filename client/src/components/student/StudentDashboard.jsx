import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NewStudentDashboard from './NewStudentDashboard'

const StudentDashboard = () => {
  return (
    <Routes>
      {/* Default route redirects to dashboard */}
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
      
      {/* Main dashboard route */}
      <Route path="/dashboard" element={<NewStudentDashboard />} />
      
      {/* Catch all other routes and redirect to dashboard */}
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  )
}

export default StudentDashboard
