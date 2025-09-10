import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NewStudentDashboard from './NewStudentDashboard'
import AvailableBooks from './AvailableBooks'
import AvailableEbooks from './AvailableEbooks'
import StudentThesis from './StudentThesis'
import NewsClippings from './NewsClippings'

const StudentDashboard = () => {
  return (
    <Routes>
      {/* Default route redirects to dashboard */}
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />

      {/* Main dashboard route */}
      <Route path="/dashboard" element={<NewStudentDashboard />} />

      {/* Browse routes */}
      <Route path="/browse/books" element={<AvailableBooks />} />
      <Route path="/browse/ebooks" element={<AvailableEbooks />} />
      <Route path="/browse/thesis" element={<StudentThesis />} />
      <Route path="/browse/news-clippings" element={<NewsClippings />} />

      {/* Catch all other routes and redirect to dashboard */}
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  )
}

export default StudentDashboard
