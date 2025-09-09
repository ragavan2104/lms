import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import ManageBooks from './admin/ManageBooks'
import ManageEbooks from './admin/ManageEbooks'
import ManageStudents from './admin/ManageStudents'
import ManageLibrarians from './admin/ManageLibrarians'
import ManageColleges from './admin/ManageColleges'
import ManageDepartments from './admin/ManageDepartments'
import ManageThesis from './admin/ManageThesis'
import NewsClippings from './admin/NewsClippings'
import IssueBook from './admin/IssueBook'
import ReturnBook from './admin/ReturnBook'
import CirculationHistory from './admin/CirculationHistory'
import FineManagement from './admin/FineManagement'
import HolidayManagement from './admin/HolidayManagement'
import PaymentManagement from './admin/PaymentManagement'
import ReservationManagement from './admin/ReservationManagement'
import Settings from './admin/Settings'
import GateEntryManagement from './admin/GateEntryManagement'
import FineReports from './admin/FineReports'
import CounterReports from './admin/CounterReports'
import GateEntryReports from './admin/GateEntryReports'
import QuestionBankManagement from './admin/QuestionBankManagement'
import QuestionBankDownloadTest from './debug/QuestionBankDownloadTest'
import TransactionStatistics from './admin/TransactionStatistics'
import FrequentlyAccessedResources from './admin/FrequentlyAccessedResources'
import LibraryCollection from './admin/LibraryCollection'
import PendingReturnsReport from './admin/PendingReturnsReport'
import BackupManagement from './admin/BackupManagement'
import AdminHome from './admin/AdminHome'
import GraphicalView from './admin/GraphicalView'

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar userRole="admin" />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/books" element={<ManageBooks />} />
          <Route path="/ebooks" element={<ManageEbooks />} />
          <Route path="/students" element={<ManageStudents />} />
          <Route path="/librarians" element={<ManageLibrarians />} />
          <Route path="/colleges" element={<ManageColleges />} />
          <Route path="/departments" element={<ManageDepartments />} />
          <Route path="/thesis" element={<ManageThesis />} />
          <Route path="/news" element={<NewsClippings />} />
          <Route path="/issue-book" element={<IssueBook />} />
          <Route path="/return-book" element={<ReturnBook />} />
          <Route path="/circulation-history" element={<CirculationHistory />} />
          <Route path="/fine-management" element={<FineManagement />} />
          <Route path="/holiday-management" element={<HolidayManagement />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/reservations" element={<ReservationManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/backup" element={<BackupManagement />} />
          <Route path="/gate-entry" element={<GateEntryManagement />} />
          <Route path="/fine-reports" element={<FineReports />} />
          <Route path="/counter-reports" element={<CounterReports />} />
          <Route path="/gate-entry-reports" element={<GateEntryReports />} />
          <Route path="/pending-returns" element={<PendingReturnsReport />} />
          <Route path="/question-banks" element={<QuestionBankManagement />} />
          <Route path="/debug/question-bank-download" element={<QuestionBankDownloadTest />} />
          <Route path="/transaction-statistics" element={<TransactionStatistics />} />
          <Route path="/frequently-accessed-resources" element={<FrequentlyAccessedResources />} />
          <Route path="/library-collection" element={<LibraryCollection />} />
          <Route path="/graphical-view" element={<GraphicalView />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
