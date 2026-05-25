import { useAuth } from '../../hooks/useAuth'

const ROLE_LABELS = {
  admin: 'ผู้ดูแล · Admin',
  hannan: 'Hannan',
  tutor: 'ติวเตอร์ · Tutor',
  outside: 'ผู้ปกครอง / ครูภายนอก',
}

const TABS = {
  admin: [
    { id: 'dashboard',   icon: 'ti-layout-dashboard', label: 'หน้าหลัก',              sub: 'Dashboard' },
    { id: 'bookings',    icon: 'ti-calendar',          label: 'การจอง',               sub: 'Bookings' },
    { id: 'students',    icon: 'ti-users',             label: 'นักเรียน',             sub: 'Students' },
    { id: 'enrollments', icon: 'ti-book',              label: 'คอร์สและการชำระเงิน',  sub: 'Courses & Payments' },
    { id: 'tutors',      icon: 'ti-school',            label: 'ติวเตอร์',             sub: 'Tutors' },
    { id: 'worklog',     icon: 'ti-clipboard-list',    label: 'บันทึกการทำงาน',       sub: 'Work log' },
    { id: 'cashlog',     icon: 'ti-cash',              label: 'รายรับ-รายจ่าย',       sub: 'Cash log' },
  ],
  hannan: [
    { id: 'audit',      icon: 'ti-eye',        label: 'ตรวจสอบ',        sub: 'Audit' },
    { id: 'financials', icon: 'ti-chart-bar',  label: 'การเงิน',        sub: 'Financials' },
    { id: 'students',   icon: 'ti-users',      label: 'นักเรียน',       sub: 'Students' },
    { id: 'payout',     icon: 'ti-calculator', label: 'คำนวณรายได้',    sub: 'Payout calc' },
  ],
  tutor: [
    { id: 'my-schedule', icon: 'ti-calendar', label: 'ตารางสอนของฉัน', sub: 'My schedule' },
    { id: 'my-students', icon: 'ti-users',    label: 'นักเรียนของฉัน', sub: 'My students' },
  ],
  outside: [
    { id: 'book',        icon: 'ti-calendar-plus', label: 'จองโต๊ะเรียน',   sub: 'Book a table' },
    { id: 'my-bookings', icon: 'ti-calendar',      label: 'การจองของฉัน',   sub: 'My bookings' },
  ],
}

export { TABS }

export function Topbar() {
  const { profile, signOut } = useAuth()
  return (
    <header className="bg-green-500 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
      <div>
        <div className="text-white font-semibold text-base flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-7 h-7 object-contain" onError={e => e.target.style.display='none'} />
          บ้านสวน Homie Learning
        </div>
        <div className="text-green-100 text-xs mt-0.5">ระบบจัดการ · Management System</div>
      </div>
      {profile && (
        <div className="flex items-center gap-3">
          <div className="text-green-100 text-xs">
            <span className="text-white font-medium">{profile.name}</span>
            {' · '}
            <span>{ROLE_LABELS[profile.role]}</span>
          </div>
          <button onClick={signOut}
            className="text-xs text-green-100 hover:text-white border border-green-400 hover:border-white px-3 py-1 rounded-full transition-colors">
            ออกจากระบบ · Sign out
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
        <button key={tab.id} onClick={() => onNavigate(tab.id)}
          className={[
            'flex flex-col items-center px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors min-w-fit',
            currentPage === tab.id
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-400 hover:text-gray-600',
          ].join(' ')}
        >
          <div className="flex items-center gap-1.5">
            <i className={`ti ${tab.icon}`} aria-hidden="true" />
            {tab.label}
          </div>
          <span className="text-[10px] text-gray-300 font-normal">{tab.sub}</span>
        </button>
      ))}
    </nav>
  )
}
