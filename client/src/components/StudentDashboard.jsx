import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import StudentHome from './student/StudentHome'
import AvailableBooks from './student/AvailableBooks'
import AvailableEbooks from './student/AvailableEbooks'
import MyReservations from './student/MyReservations'
import MyBorrowingHistory from './student/MyBorrowingHistory'
import QuestionBankSearch from './student/QuestionBankSearch'
import StudentNewsClippings from './student/NewsClippings'
import StudentThesis from './student/StudentThesis'
import { useAuth } from '../contexts/AuthContext'
import './StudentDashboard.css'

const StudentDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="student-dashboard">
      <div className="student-header">
        <div className="student-info">
          <h1>Welcome, {user?.name}</h1>
          <p>Student ID: {user?.user_id}</p>
        </div>
        <div className="student-nav">
          <a href="/student">Dashboard</a>
          <a href="/student/books">Browse Books</a>
          <a href="/student/ebooks">Browse E-books</a>
          <a href="/student/question-banks">Question Banks</a>
          <a href="/student/news-clippings">News Clippings</a>
          <a href="/student/thesis">Thesis</a>
          <a href="/student/reservations">My Reservations</a>
          <a href="/student/history">My History</a>
          <button onClick={() => window.location.href = '/login'}>Logout</button>
        </div>
      </div>
      
      <div className="student-content">
        <Routes>
          <Route path="/" element={<StudentHome />} />
          <Route path="/books" element={<AvailableBooks />} />
          <Route path="/ebooks" element={<AvailableEbooks />} />
          <Route path="/question-banks" element={<QuestionBankSearch />} />
          <Route path="/news-clippings" element={<StudentNewsClippings />} />
          <Route path="/thesis" element={<StudentThesis />} />
          <Route path="/reservations" element={<MyReservations />} />
          <Route path="/history" element={<MyBorrowingHistory />} />
          <Route path="*" element={<Navigate to="/student" />} />
        </Routes>
      </div>
    </div>
  )
}

export default StudentDashboard
