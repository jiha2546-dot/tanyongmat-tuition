import { useAuth } from '../../hooks/useAuth'

const ROLE_LABELS = {
  admin: 'Teh Ming',
  hannan: 'Hannan',
  tutor: 'Our Tutors',
  outside: 'Outside / Parent',
}

const TABS = {
  admin: [
    { id: 'dashboard',   icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { id: 'bookings',    icon: 'ti-calendar',          label: 'Bookings' },
    { id: 'students',    icon: 'ti-users',             label: 'Students' },
    { id: 'enrollments', icon: 'ti-book',              label: 'Courses & Payments' },
    { id: 'tutors',      icon: 'ti-school',            label: 'Tutors' },
    { id: 'worklog',     icon: 'ti-clipboard-list',    label: 'Work log' },
    { id: 'cashlog',     icon: 'ti-cash',              label: 'Cash log' },
  ],
  hannan: [
    { id: 'audit',      icon: 'ti-eye',        label: 'Audit' },
    { id: 'financials', icon: 'ti-chart-bar',  label: 'Financials' },
    { id: 'students',   icon: 'ti-users',      label: 'Students' },
    { id: 'payout',     icon: 'ti-calculator', label: 'Payout calc' },
  ],
  tutor: [
    { id: 'my-schedule', icon: 'ti-calendar', label: 'My schedule' },
    { id: 'my-students', icon: 'ti-users',    label: 'My students' },
  ],
  outside: [
    { id: 'book',        icon: 'ti-calendar-plus', label: 'Book a table' },
    { id: 'my-bookings', icon: 'ti-calendar',      label: 'My bookings' },
  ],
}

export { TABS }

export function Topbar() {
  const { profile, signOut } = useAuth()

  return (
    <header className="bg-green-500 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
      <div>
        <div className="text-white font-semibold text-base flex items-center gap-2">
          <i className="ti ti-school" aria-hidden="true" />
          Tanyongmat Tuition Center
        </div>
        <div className="text-green-100 text-xs mt-0.5">Management System</div>
      </div>
      {profile && (
        <div className="flex items-center gap-3">
          <div className="text-green-100 text-xs">
            <span className="text-white font-medium">{profile.name}</span>
            {' · '}
            <span className="capitalize">{ROLE_LABELS[profile.role]}</span>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-green-100 hover:text-white border border-green-400 hover:border-white px-3 py-1 rounded-full transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}

export function Nav({ currentPage, onNavigate, role }) {
  const tabs = TABS[role] || []
  return (
    <nav className="flex border-b border-gray-100 bg-white overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          className={[
            'flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
            currentPage === tab.id
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-400 hover:text-gray-600',
          ].join(' ')}
        >
          <i className={`ti ${tab.icon}`} aria-hidden="true" />
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
