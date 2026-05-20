import { Card, SectionTitle, Badge, DataTable, Alert } from '../../shared/UI'
import { fmtDate } from '../../../lib/utils'

export function MySchedule({ bookings }) {
  const myBookings = bookings.filter(b => b.type === 'our' && b.status !== 'cancelled')
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">My schedule</h2>
      <Alert color="green">Your confirmed sessions. Contact Teh Ming to add or change bookings.</Alert>
      <Card>
        <DataTable
          cols={[
            { key: 'date', label: 'Date', width: '14%', render: b => fmtDate(b.date) },
            { key: 'table_name', label: 'Table', width: '10%' },
            { key: 'subject', label: 'Subject', width: '20%', render: b => b.subject || '—' },
            { key: 'num_students', label: 'Students', width: '14%' },
            { key: 'time', label: 'Time', width: '20%', render: b => `${b.start_time}–${b.end_time}` },
            { key: 'status', label: 'Status', width: '22%', render: () => <Badge color="green">Confirmed</Badge> },
          ]}
          rows={myBookings}
          empty="No sessions scheduled yet."
        />
      </Card>
    </div>
  )
}

export function MyStudents({ enrollments }) {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">My students</h2>
      <Card>
        <DataTable
          cols={[
            { key: 'student', label: 'Name', width: '22%', render: e => <span className="font-medium">{e.students?.name || '—'}</span> },
            { key: 'level', label: 'Level', width: '12%', render: e => e.students?.level || '—' },
            { key: 'subject', label: 'Subject', width: '16%', render: e => <Badge color="blue">{e.subject}</Badge> },
            { key: 'type', label: 'Type', width: '20%', render: e => e.type === 'course' ? e.course_type : 'Hourly' },
            { key: 'status', label: 'Payment', width: '16%', render: e => <Badge color={e.paid ? 'green' : 'red'}>{e.paid ? 'Paid' : 'Unpaid'}</Badge> },
          ]}
          rows={enrollments}
          empty="No students assigned yet."
        />
      </Card>
    </div>
  )
}
