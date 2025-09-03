import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import LibrarianHome from './librarian/LibrarianHome'
// Import librarian-specific components
import IssueBook from './librarian/IssueBook'
// Import admin components for librarian use (with appropriate permissions)
import ManageBooks from './admin/ManageBooks'
import ManageEbooks from './admin/ManageEbooks'
import ManageThesis from './admin/ManageThesis'
import ReturnBook from './admin/ReturnBook'
import CirculationHistory from './admin/CirculationHistory'
import ManageStudents from './admin/ManageStudents'
import ManageColleges from './admin/ManageColleges'
import ManageDepartments from './admin/ManageDepartments'
import NewsClippings from './admin/NewsClippings'
import FineManagement from './admin/FineManagement'
import PaymentManagement from './admin/PaymentManagement'
import ReservationManagement from './admin/ReservationManagement'
import GateEntryManagement from './admin/GateEntryManagement'
import FineReports from './admin/FineReports'
import CounterReports from './admin/CounterReports'
import GateEntryReports from './admin/GateEntryReports'
import QuestionBankManagement from './admin/QuestionBankManagement'
import GraphicalView from './admin/GraphicalView'
import TransactionStatistics from './librarian/TransactionStatistics'
import FrequentlyAccessedResources from './librarian/FrequentlyAccessedResources'
import LibraryCollection from './librarian/LibraryCollection'
import PendingReturnsReport from './librarian/PendingReturnsReport'

const LibrarianDashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar userRole="librarian" />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LibrarianHome />} />
          {/* Management Routes */}
          <Route path="/books" element={<ManageBooks />} />
          <Route path="/ebooks" element={<ManageEbooks />} />
          <Route path="/students" element={<ManageStudents userRole="librarian" />} />
          <Route path="/colleges" element={<ManageColleges userRole="librarian" />} />
          <Route path="/departments" element={<ManageDepartments userRole="librarian" />} />
          <Route path="/thesis" element={<ManageThesis />} />
          <Route path="/question-banks" element={<QuestionBankManagement />} />
          <Route path="/news-clippings" element={<NewsClippings />} />
          {/* Circulation Routes */}
          <Route path="/issue-book" element={<IssueBook />} />
          <Route path="/return-book" element={<ReturnBook />} />
          <Route path="/circulation-history" element={<CirculationHistory />} />
          <Route path="/fine-management" element={<FineManagement />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/reservations" element={<ReservationManagement />} />
          <Route path="/gate-entry" element={<GateEntryManagement />} />
          <Route path="/fine-reports" element={<FineReports />} />
          <Route path="/counter-reports" element={<CounterReports />} />
          <Route path="/gate-entry-reports" element={<GateEntryReports />} />
          <Route path="/pending-returns" element={<PendingReturnsReport />} />
          <Route path="/transaction-statistics" element={<TransactionStatistics />} />
          <Route path="/frequently-accessed-resources" element={<FrequentlyAccessedResources />} />
          <Route path="/library-collection" element={<LibraryCollection />} />
          {/* Analytics Routes */}
          <Route path="/graphical-view" element={<GraphicalView />} />
          <Route path="*" element={<Navigate to="/librarian" />} />
        </Routes>
      </div>
    </div>
  )
}

export default LibrarianDashboard
