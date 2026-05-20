import { format } from 'date-fns'

export const fmt = (n) => Math.round(n).toLocaleString()
export const fmtDate = (d) => d ? format(new Date(d), 'd MMM') : '—'
export const fmtDateFull = (d) => d ? format(new Date(d), 'd MMM yyyy') : '—'

export const toMins = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const overlaps = (s1, e1, s2, e2) =>
  toMins(s1) < toMins(e2) && toMins(e1) > toMins(s2)

export const calcHours = (start, end) =>
  Math.max(1, Math.round((new Date(`2000-01-01T${end}`) - new Date(`2000-01-01T${start}`)) / 3600000))

export const CHAIR_TABLES = ['T1', 'T2', 'T3', 'T4', 'T5']
export const FLOOR_TABLES = ['Floor A', 'Floor B', 'Floor C']
export const ALL_TABLES = [...CHAIR_TABLES, ...FLOOR_TABLES]
export const isFloor = (t) => FLOOR_TABLES.includes(t)

export const SUBJECTS = ['Math', 'Thai', 'English', 'Science', 'Social Studies', 'Art', 'Reading']
export const TUTORS = ['Aiman (uni)', 'Siti (grad)', 'Hassan (relative)', 'Nana (secondary)', 'External']
export const LEVELS = ['KG1', 'KG2', 'KG3', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6']
export const SHIFTS = ['evening', 'morning', 'full day', 'partial']
export const EXPENSE_CATS = ['Electricity', 'Air conditioning', 'Supplies', 'Other']
export const PAY_METHODS = ['PromptPay transfer', 'Cash', 'Bank transfer']

export const COURSE_PRICES = { '1on1': 2800, 'small group': 2200, 'group': 1600 }

// Money split percentages
export const SPLITS = {
  labor: 0.40,
  rent: 0.10,
  marketing: 0.15,
  auditing: 0.15,
  devFund: 0.20,
}

export const LOAN_TOTAL = 30000

export const today = () => new Date().toISOString().slice(0, 10)

export const getUnavailableTables = (bookings, date, start, end, excludeId = '') => {
  return bookings
    .filter(b =>
      b.id !== excludeId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      overlaps(start, end, b.start_time, b.end_time)
    )
    .map(b => b.table_name)
}
