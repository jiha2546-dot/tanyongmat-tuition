import { Card, SectionTitle, Badge, DataTable, Alert, Metric, MetricsGrid, ProgressBar } from '../../shared/UI'
import { fmt, fmtDate, SPLITS, LOAN_TOTAL } from '../../../lib/utils'

// ── Audit ─────────────────────────────────────────────────────────────────────
export function Audit({ bookings, enrollments, income, expenses, distributable }) {
  const loanRepaid = distributable * SPLITS.devFund
  const loanLeft = Math.max(0, LOAN_TOTAL - loanRepaid)

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Audit — read only</h2>
      <Alert color="blue">You are viewing as Hannan (auditor). All data is read-only.</Alert>

      <MetricsGrid>
        <Metric label="Cash collected" value={`${fmt(income)} ฿`} valueColor="text-green-600" />
        <Metric label="Expenses" value={`${fmt(expenses)} ฿`} valueColor="text-red-500" />
        <Metric label="Distributable" value={`${fmt(distributable)} ฿`} />
        <Metric label="Loan repaid" value={`${fmt(loanRepaid)} ฿`} sub={`${fmt(loanLeft)} ฿ left`} valueColor="text-amber-600" />
      </MetricsGrid>

      <Card>
        <SectionTitle icon="ti-book">Enrollment payments</SectionTitle>
        <DataTable
          cols={[
            { key: 'student', label: 'Student', width: '18%', render: e => e.students?.name || '—' },
            { key: 'subject', label: 'Subject', width: '10%', render: e => <Badge color="blue">{e.subject}</Badge> },
            { key: 'type', label: 'Type', width: '12%', render: e => e.type === 'course' ? e.course_type : 'Hourly' },
            { key: 'amount', label: 'Amount', width: '10%', render: e => <span className={`font-semibold ${e.paid ? 'text-green-600' : 'text-red-500'}`}>{fmt(e.amount)} ฿</span> },
            { key: 'status', label: 'Status', width: '10%', render: e => <Badge color={e.paid ? 'green' : 'red'}>{e.paid ? 'Paid' : 'Unpaid'}</Badge> },
            { key: 'pay_method', label: 'Method', width: '12%', render: e => e.pay_method || '—' },
            { key: 'pay_date', label: 'Date', width: '10%', render: e => e.pay_date ? fmtDate(e.pay_date) : '—' },
            { key: 'evidence', label: 'Evidence', width: '18%', render: e => e.evidence_url
              ? <a href={e.evidence_url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <img src={e.evidence_url} alt="Payment evidence" className="w-10 h-7 object-cover rounded border border-gray-200" />
                  <span className="text-green-600 text-xs">View</span>
                </a>
              : <span className="text-gray-300 text-xs">None</span>
            },
          ]}
          rows={enrollments}
          empty="No enrollments."
        />
      </Card>

      <Card>
        <SectionTitle icon="ti-calendar">Booking audit trail</SectionTitle>
        <DataTable
          cols={[
            { key: 'date', label: 'Date', width: '10%', render: b => fmtDate(b.date) },
            { key: 'table_name', label: 'Table', width: '8%' },
            { key: 'type', label: 'Type', width: '8%', render: b => <Badge color={b.type === 'our' ? 'green' : 'blue'}>{b.type === 'our' ? 'Our' : 'Out'}</Badge> },
            { key: 'who', label: 'Who', width: '18%', render: b => b.type === 'our' ? b.tutor_name : b.booker_name },
            { key: 'time', label: 'Time', width: '14%', render: b => `${b.start_time}–${b.end_time}` },
            { key: 'amount', label: 'Fee', width: '10%', render: b => `${fmt(b.amount)} ฿` },
            { key: 'status', label: 'Status', width: '10%', render: b => <Badge color={b.status === 'confirmed' ? 'green' : 'red'}>{b.status}</Badge> },
            { key: 'paid', label: 'Paid', width: '10%', render: b => <Badge color={b.paid ? 'green' : 'red'}>{b.paid ? 'Paid' : 'Unpaid'}</Badge> },
          ]}
          rows={bookings}
          empty="No bookings."
        />
      </Card>
    </div>
  )
}

// ── Financials ────────────────────────────────────────────────────────────────
export function Financials({ income, expenses, distributable }) {
  const loanRepaid = distributable * SPLITS.devFund
  const loanLeft = Math.max(0, LOAN_TOTAL - loanRepaid)
  const loanPct = Math.min(100, Math.round(loanRepaid / LOAN_TOTAL * 100))

  const payouts = [
    { label: 'Teh Ming — labor (40%)', pct: SPLITS.labor, color: '#1D9E75' },
    { label: 'Teh Ming — rent (10%)', pct: SPLITS.rent, color: '#1D9E75' },
    { label: 'Hannan — marketing (15%)', pct: SPLITS.marketing, color: '#185FA5' },
    { label: 'Hannan — auditing (15%)', pct: SPLITS.auditing, color: '#185FA5' },
    { label: 'Mom / dev fund — loan repayment (20%)', pct: SPLITS.devFund, color: '#854F0B' },
  ]

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Financials</h2>

      <MetricsGrid>
        <Metric label="Gross income" value={`${fmt(income)} ฿`} valueColor="text-green-600" />
        <Metric label="Expenses" value={`${fmt(expenses)} ฿`} valueColor="text-red-500" />
        <Metric label="Distributable" value={`${fmt(distributable)} ฿`} />
      </MetricsGrid>

      <Card>
        <SectionTitle icon="ti-chart-pie">Payout split this month</SectionTitle>
        {payouts.map(({ label, pct, color }) => (
          <div key={label} className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{label}</span>
              <span className="font-semibold" style={{ color }}>{fmt(distributable * pct)} ฿</span>
            </div>
            <ProgressBar percent={pct * 100} color={color} />
          </div>
        ))}
        <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
          <span>Hannan total (30%)</span>
          <span className="text-blue-600">{fmt(distributable * 0.3)} ฿</span>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="ti-pig-money">Loan repayment tracker</SectionTitle>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Original loan (from Mom)</span>
            <span className="font-semibold">{fmt(LOAN_TOTAL)} ฿</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Repaid this month</span>
            <span className="font-semibold text-green-600">{fmt(loanRepaid)} ฿</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estimated remaining</span>
            <span className="font-semibold text-amber-600">{fmt(loanLeft)} ฿</span>
          </div>
        </div>
        <ProgressBar percent={loanPct} />
        <div className="text-xs text-gray-300 mt-1.5">{loanPct}% repaid so far this month</div>
      </Card>
    </div>
  )
}

// ── Payout calculator ─────────────────────────────────────────────────────────
export function PayoutCalc({ income, expenses, distributable, totalHours, byPerson }) {
  const laborPool = distributable * SPLITS.labor

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Payout calculator</h2>

      <MetricsGrid>
        <Metric label="Gross income" value={`${fmt(income)} ฿`} />
        <Metric label="Expenses" value={`${fmt(expenses)} ฿`} valueColor="text-red-500" />
        <Metric label="Distributable" value={`${fmt(distributable)} ฿`} valueColor="text-green-600" />
      </MetricsGrid>

      <Card>
        <SectionTitle icon="ti-users">Labor (40% = {fmt(laborPool)} ฿) — by hours worked</SectionTitle>
        {Object.keys(byPerson).length === 0
          ? <p className="text-sm text-gray-400">No work log entries yet.</p>
          : Object.entries(byPerson).map(([name, hours]) => {
              const share = totalHours ? laborPool * (hours / totalHours) : 0
              return (
                <div key={name} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm">
                    {name}{' '}
                    <span className="text-xs text-gray-300">{hours}h / {totalHours}h</span>
                  </span>
                  <span className="font-semibold text-green-600">{fmt(share)} ฿</span>
                </div>
              )
            })
        }
      </Card>

      <Card>
        <SectionTitle icon="ti-wallet">Fixed role payouts</SectionTitle>
        {[
          ['Teh Ming — rent (10%)', SPLITS.rent, 'text-green-600'],
          ['Hannan — marketing (15%)', SPLITS.marketing, 'text-blue-600'],
          ['Hannan — auditing (15%)', SPLITS.auditing, 'text-blue-600'],
          ['Mom / dev fund (20%)', SPLITS.devFund, 'text-amber-600'],
        ].map(([label, pct, color]) => (
          <div key={label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm">
            <span className="text-gray-600">{label}</span>
            <span className={`font-semibold ${color}`}>{fmt(distributable * pct)} ฿</span>
          </div>
        ))}
        <div className="pt-3 border-t border-gray-100 flex justify-between font-semibold text-sm">
          <span>Hannan total (30%)</span>
          <span className="text-blue-600">{fmt(distributable * 0.3)} ฿</span>
        </div>
      </Card>

      <Alert color="green">Payout date: 25th of each month. Figures based on current recorded data.</Alert>
    </div>
  )
}
