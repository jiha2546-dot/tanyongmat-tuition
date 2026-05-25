import { fmt, fmtDate, SPLITS, LOAN_TOTAL } from '../../../lib/utils'

function StatCard({ label, sub, value, color = 'green', note }) {
  const colors = { green: 'text-green-600', red: 'text-red-500', amber: 'text-amber-500', gray: 'text-gray-400' }
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-700 font-medium">{label}</span>
      {sub && <span className="text-[10px] text-gray-300">{sub}</span>}
      <span className={`text-xl font-bold mt-1 ${colors[color]}`}>{value}</span>
      {note && <span className="text-[10px] text-gray-300 mt-0.5">{note}</span>}
    </div>
  )
}

export function Dashboard({ bookings, enrollments, entries, worklog, byPerson }) {
  const now = new Date()
  const month = now.toISOString().slice(0, 7)
  const today = now.toISOString().slice(0, 10)

  const monthIncome = entries.filter(e => e.type === 'income' && e.date?.startsWith(month)).reduce((s, e) => s + Number(e.amount), 0)
  const monthExpenses = entries.filter(e => e.type === 'expense' && e.date?.startsWith(month)).reduce((s, e) => s + Number(e.amount), 0)
  const distributable = Math.max(0, monthIncome - monthExpenses)
  const loanRepaid = entries.filter(e => e.category === 'loan_repayment').reduce((s, e) => s + Number(e.amount), 0)
  const loanLeft = Math.max(0, LOAN_TOTAL - loanRepaid)
  const unpaidEnrollments = enrollments.filter(e => !e.paid).length
  const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled')

  const payoutPreview = [
    { label: 'เต๊ะมิง — แรงงาน', sub: 'Labor (40%)', pct: SPLITS.labor },
    { label: 'เต๊ะมิง — ค่าเช่า', sub: 'Rent (10%)', pct: SPLITS.rent },
    { label: 'Hannan — การตลาด + ตรวจสอบ', sub: 'Marketing + Auditing (30%)', pct: SPLITS.marketing + SPLITS.auditing },
    { label: 'Mom / กองทุนพัฒนา', sub: 'Development fund (20%)', pct: SPLITS.devFund },
  ]

  return (
    <div className="p-4 space-y-3">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="รายรับเดือนนี้"
            sub="Cash collected this month"
            value={`${fmt(monthIncome)} ฿`}
            color={monthIncome > 0 ? 'green' : 'gray'}
          />
          <StatCard
            label="ค่าใช้จ่าย"
            sub="Expenses this month"
            value={`${fmt(monthExpenses)} ฿`}
            color={monthExpenses > 0 ? 'red' : 'gray'}
          />
          <StatCard
            label="คงเหลือสุทธิ"
            sub="Distributable after costs"
            value={`${fmt(distributable)} ฿`}
            color="green"
          />
          <StatCard
            label="รอเก็บเงิน"
            sub="Unpaid enrollments"
            value={unpaidEnrollments}
            color={unpaidEnrollments > 0 ? 'amber' : 'gray'}
            note="need collection"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <i className="ti ti-calendar text-green-500" aria-hidden="true" />
          การจองวันนี้ <span className="text-gray-400 font-normal text-xs ml-1">Today's bookings ({todayBookings.length})</span>
        </div>
        {todayBookings.length === 0
          ? <p className="text-xs text-gray-300 text-center py-3">ไม่มีการจองวันนี้ · No bookings today</p>
          : <table className="w-full text-xs">
              <thead><tr className="text-gray-400 border-b border-gray-50">
                <th className="text-left py-1 font-medium">โต๊ะ<br/><span className="text-gray-300 font-normal">Table</span></th>
                <th className="text-left py-1 font-medium">ผู้จอง<br/><span className="text-gray-300 font-normal">Who</span></th>
                <th className="text-left py-1 font-medium">เวลา<br/><span className="text-gray-300 font-normal">Time</span></th>
                <th className="text-left py-1 font-medium">นร.<br/><span className="text-gray-300 font-normal">Stu.</span></th>
                <th className="text-left py-1 font-medium">ค่าเช่า<br/><span className="text-gray-300 font-normal">Fee</span></th>
                <th className="text-left py-1 font-medium">ชำระ<br/><span className="text-gray-300 font-normal">Paid</span></th>
              </tr></thead>
              <tbody>{todayBookings.map(b => (
                <tr key={b.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-1.5 font-medium">{b.table_name}</td>
                  <td className="py-1.5 text-gray-600">{b.type === 'our' ? b.tutor_name : b.booker_name}</td>
                  <td className="py-1.5 text-gray-600">{b.start_time}–{b.end_time}</td>
                  <td className="py-1.5">{b.num_students}</td>
                  <td className="py-1.5">{fmt(b.amount)} ฿</td>
                  <td className="py-1.5">
                    {b.paid
                      ? <span className="text-green-500 font-medium">✓ ชำระแล้ว</span>
                      : <span className="text-red-400">✗ ยังไม่ชำระ</span>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <i className="ti ti-chart-pie text-green-500" aria-hidden="true" />
          ตัวอย่างการแบ่งรายได้เดือนนี้
          <span className="text-gray-400 font-normal text-xs ml-1">This month's payout preview</span>
        </div>
        {payoutPreview.map((p, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <div>
                <span className="text-gray-700">{p.label}</span>
                <span className="text-gray-300 ml-1">· {p.sub}</span>
              </div>
              <span className="font-semibold text-green-600">{fmt(distributable * p.pct)} ฿</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: distributable > 0 ? `${p.pct * 100}%` : '2%' }} />
            </div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
          <span>เงินกู้คงเหลือ · Loan remaining: <span className="font-semibold text-amber-500">{fmt(loanLeft)} ฿</span></span>
          <span>จาก · of {fmt(LOAN_TOTAL)} ฿</span>
        </div>
      </div>
    </div>
  )
}
