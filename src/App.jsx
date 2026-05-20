import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useBookings } from './hooks/useBookings'
import { useStudents, useEnrollments } from './hooks/useStudents'
import { useCashEntries, useWorkLog } from './hooks/useFinancials'
import { useTutors } from './hooks/useTutors'
import { Topbar, Nav, TABS } from './components/layout/Layout'
import { LoginPage } from './components/pages/LoginPage'
import { Spinner } from './components/shared/UI'

// Admin pages
import { Dashboard } from './components/pages/admin/Dashboard'
import { Bookings } from './components/pages/admin/Bookings'
import { Students } from './components/pages/admin/Students'
import { Enrollments } from './components/pages/admin/Enrollments'
import { WorkLog, CashLog } from './components/pages/admin/WorkLogCashLog'
import { Tutors } from './components/pages/admin/Tutors'

// Hannan pages
import { Audit, Financials, PayoutCalc } from './components/pages/hannan/HannanPages'

// Tutor pages
import { MySchedule, MyStudents } from './components/pages/tutor/TutorPages'

// Outside pages
import { BookTable, MyBookings } from './components/pages/outside/OutsidePages'

import './index.css'

function AppInner() {
  const { user, profile, loading } = useAuth()
  const [page, setPage] = useState(null)

  // Data hooks — always loaded, components only render when role matches
  const { bookings, addBooking, updateBooking, cancelBooking, togglePaid } = useBookings()
  const { students, addStudent } = useStudents()
  const { enrollments, addEnrollment, recordPayment, markUnpaid } = useEnrollments()
  const { entries, income, expenses, distributable, addEntry, deleteEntry } = useCashEntries()
  const { worklog, totalHours, byPerson, addEntry: addWork, deleteEntry: deleteWork } = useWorkLog()
  const { tutors, addTutor, deactivateTutor, tutorNames } = useTutors()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    )
  }

  // Outside/parent booking — no login needed
  if (!user || !profile) {
    // Check if trying to access public booking page
    const hash = window.location.hash
    if (hash === '#book' || !user) {
      if (!user) return <LoginPage />
    }
    return <LoginPage />
  }

  const role = profile.role
  const tabs = TABS[role] || []
  const currentPage = page || tabs[0]?.id

  function navigate(id) { setPage(id) }

  function renderPage() {
    switch (currentPage) {
      // ── Admin ──────────────────────────────────────────────
      case 'dashboard':
        return (
          <Dashboard
            bookings={bookings}
            enrollments={enrollments}
            income={income}
            expenses={expenses}
            distributable={distributable}
            onRecordPayment={async (id, data) => { await recordPayment(id, data) }}
          />
        )
      case 'bookings':
        return (
          <Bookings
            bookings={bookings}
            tutorNames={tutorNames}
            onAdd={addBooking}
            onTogglePaid={(id, current) => togglePaid(id, current)}
            onCancel={cancelBooking}
          />
        )
      case 'students':
        return (
          <Students
            students={students}
            enrollments={enrollments}
            onAdd={addStudent}
            readOnly={role !== 'admin'}
          />
        )
      case 'enrollments':
        return (
          <Enrollments
            enrollments={enrollments}
            students={students}
            tutorNames={tutorNames}
            onAdd={addEnrollment}
            onRecordPayment={async (id, data) => { await recordPayment(id, data) }}
            onMarkUnpaid={markUnpaid}
          />
        )
      case 'tutors':
        return (
          <Tutors
            tutors={tutors}
            onAdd={addTutor}
            onDeactivate={deactivateTutor}
          />
        )
      case 'worklog':
        return (
          <WorkLog
            worklog={worklog}
            totalHours={totalHours}
            byPerson={byPerson}
            distributable={distributable}
            onAdd={addWork}
            onDelete={deleteWork}
          />
        )
      case 'cashlog':
        return (
          <CashLog
            entries={entries}
            income={income}
            expenses={expenses}
            distributable={distributable}
            onAdd={addEntry}
            onDelete={deleteEntry}
          />
        )

      // ── Hannan ─────────────────────────────────────────────
      case 'audit':
        return (
          <Audit
            bookings={bookings}
            enrollments={enrollments}
            income={income}
            expenses={expenses}
            distributable={distributable}
          />
        )
      case 'financials':
        return <Financials income={income} expenses={expenses} distributable={distributable} />
      case 'payout':
        return (
          <PayoutCalc
            income={income}
            expenses={expenses}
            distributable={distributable}
            totalHours={totalHours}
            byPerson={byPerson}
          />
        )

      // ── Tutor ──────────────────────────────────────────────
      case 'my-schedule':
        return <MySchedule bookings={bookings} />
      case 'my-students':
        return <MyStudents enrollments={enrollments} />

      // ── Outside ────────────────────────────────────────────
      case 'book':
        return <BookTable bookings={bookings} onBooked={() => {}} />
      case 'my-bookings':
        return (
          <MyBookings
            bookings={bookings}
            onCancel={cancelBooking}
          />
        )

      default:
        return <div className="p-4 text-sm text-gray-400">Page not found.</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar />
      <Nav currentPage={currentPage} onNavigate={navigate} role={role} />
      <main className="flex-1 max-w-5xl mx-auto w-full">
        {renderPage()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
