import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NewStudentDashboard from './NewStudentDashboard'
import AvailableBooks from './AvailableBooks'
import AvailableEResources from './AvailableEResources'
import StudentThesis from './StudentThesis'
import NewsClippings from './NewsClippings'
import StudentJournals from './StudentJournals'
import StudentQuestionBanks from './StudentQuestionBanks'

const StudentDashboard = () => {
  return (
    <Routes>
      {/* Default route redirects to dashboard */}
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />

      {/* Main dashboard route */}
      <Route path="/dashboard" element={<NewStudentDashboard />} />

      {/* Browse routes */}
      <Route path="/browse/books" element={<AvailableBooks />} />
      <Route path="/browse/e-resources" element={<AvailableEResources />} />
      {/* Legacy route redirect */}
      <Route path="/browse/ebooks" element={<AvailableEResources />} />
      <Route path="/browse/thesis" element={<StudentThesis />} />
      <Route path="/browse/news-clippings" element={<NewsClippings />} />
      <Route path="/browse/journals" element={<StudentJournals />} />
      <Route path="/browse/question-banks" element={<StudentQuestionBanks />} />

      {/* Catch all other routes and redirect to dashboard */}
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  )
}

export default StudentDashboard
