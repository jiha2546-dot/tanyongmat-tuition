import { Card, SectionTitle, MetricsGrid, Metric, Badge, Button, DataTable, Alert } from '../../shared/UI'
import { PaymentModal } from '../../shared/PaymentModal'
import { fmt, fmtDate, SPLITS } from '../../../lib/utils'
import { useState } from 'react'

export function Dashboard({ bookings, enrollments, income, expenses, distributable, onRecordPayment }) {
  const [payId, setPayId] = useState(null)
  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled')
  const unpaid = enrollments.filter(e => !e.paid)
  const payEnrollment = payId ? enrollments.find(e => e.id === payId) : null

  return (
    <div className="p-4">
      {payEnrollment && (
        <PaymentModal
          enrollment={payEnrollment}
          onConfirm={async (data) => { await onRecordPayment(payId, data); setPayId(null) }}
          onClose={() => setPayId(null)}
        />
      )}

      <MetricsGrid>
        <Metric label="Cash collected" value={`${fmt(income)} ฿`} sub="this month" valueColor="text-green-600" />
        <Metric label="Expenses" value={`${fmt(expenses)} ฿`} sub="this month" valueColor="text-red-500" />
        <Metric label="Distributable" value={`${fmt(distributable)} ฿`} sub="after costs" />
        <Metric
          label="Unpaid enrollments"
          value={unpaid.length}
          sub="need collection"
          valueColor={unpaid.length ? 'text-red-500' : 'text-green-600'}
        />
      </MetricsGrid>

      <Card>
        <SectionTitle icon="ti-calendar">Today's bookings ({todayBookings.length})</SectionTitle>
        <DataTable
          cols={[
            { key: 'table_name', label: 'Table', width: '12%' },
            { key: 'who', label: 'Who', width: '25%', render: b => b.type === 'our' ? b.tutor_name : b.booker_name },
            { key: 'time', label: 'Time', width: '20%', render: b => `${b.start_time}–${b.end_time}` },
            { key: 'num_students', label: 'Stu.', width: '10%' },
            { key: 'amount', label: 'Fee', width: '15%', render: b => `${fmt(b.amount)} ฿` },
            { key: 'paid', label: 'Paid', width: '18%', render: b => <Badge color={b.paid ? 'green' : 'red'}>{b.paid ? 'Paid' : 'Unpaid'}</Badge> },
          ]}
          rows={todayBookings}
          empty="No bookings today."
        />
      </Card>

      {unpaid.length > 0 && (
        <Card>
          <SectionTitle icon="ti-alert-circle">Unpaid enrollments — collect payment</SectionTitle>
          <DataTable
            cols={[
              { key: 'student', label: 'Student', width: '22%', render: e => <span className="font-medium">{e.students?.name || '—'}</span> },
              { key: 'subject', label: 'Subject', width: '14%', render: e => <Badge color="blue">{e.subject}</Badge> },
              { key: 'type', label: 'Type', width: '14%', render: e => <Badge color="amber">{e.type === 'course' ? e.course_type : 'Hourly'}</Badge> },
              { key: 'amount', label: 'Due', width: '14%', render: e => <span className="text-red-500 font-semibold">{fmt(e.amount)} ฿</span> },
              { key: 'tutor', label: 'Tutor', width: '16%' },
              {
                key: 'action', label: '', width: '20%',
                render: e => (
                  <Button variant="primary" size="sm" onClick={() => setPayId(e.id)}>
                    <i className="ti ti-cash" aria-hidden="true" /> Collect
                  </Button>
                )
              },
            ]}
            rows={unpaid}
            empty="All paid!"
          />
        </Card>
      )}

      <Card>
        <SectionTitle icon="ti-chart-pie">This month's payout preview</SectionTitle>
        {[
          ['Teh Ming — labor (40%)', SPLITS.labor],
          ['Teh Ming — rent (10%)', SPLITS.rent],
          ['Hannan — marketing + auditing (30%)', SPLITS.marketing + SPLITS.auditing],
          ['Mom / development fund (20%)', SPLITS.devFund],
        ].map(([label, pct]) => (
          <div key={label} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{label}</span>
              <span className="font-semibold text-green-600">{fmt(distributable * pct)} ฿</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct * 100}%` }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
