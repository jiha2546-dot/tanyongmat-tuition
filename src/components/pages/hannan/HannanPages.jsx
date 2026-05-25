import { fmt, fmtDate, SPLITS, LOAN_TOTAL } from '../../../lib/utils'

export function Audit({ enrollments, bookings, students }) {
  const totalEnrollmentIncome = enrollments.filter(e => e.paid).reduce((s, e) => s + Number(e.amount), 0)
  const totalBookingIncome = bookings.filter(b => b.paid && b.status !== 'cancelled').reduce((s, b) => s + Number(b.amount), 0)
  const totalIncome = totalEnrollmentIncome + totalBookingIncome

  return (
    <div className="p-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-3 text-xs text-blue-700">
        คุณกำลังดูในฐานะ Hannan (ผู้ตรวจสอบ) · You are viewing as Hannan (auditor). ข้อมูลทั้งหมดเป็นแบบอ่านอย่างเดียว · All data is read-only.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">รายรับทั้งหมด</div>
          <div className="text-xs text-gray-300">Total collected</div>
          <div className="text-xl font-bold text-green-600 mt-1">{fmt(totalIncome)} ฿</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">รายรับจากคอร์ส</div>
          <div className="text-xs text-gray-300">Enrollment income</div>
          <div className="text-xl font-bold text-green-600 mt-1">{fmt(totalEnrollmentIncome)} ฿</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">รายรับจากการจองโต๊ะ</div>
          <div className="text-xs text-gray-300">Booking income</div>
          <div className="text-xl font-bold text-green-600 mt-1">{fmt(totalBookingIncome)} ฿</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">รอเก็บเงิน</div>
          <div className="text-xs text-gray-300">Unpaid enrollments</div>
          <div className="text-xl font-bold text-amber-500 mt-1">{enrollments.filter(e => !e.paid).length}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-3">การชำระเงินคอร์ส · Enrollment payments</div>
        {enrollments.length === 0
          ? <p className="text-xs text-gray-400 text-center py-3">ยังไม่มีข้อมูล · No enrollments.</p>
          : <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-100 text-gray-400">
                  <th className="text-left py-2 font-medium">นักเรียน · Student</th>
                  <th className="text-left py-2 font-medium">วิชา · Subject</th>
                  <th className="text-left py-2 font-medium">ติวเตอร์ · Tutor</th>
                  <th className="text-left py-2 font-medium">ราคา · Amount</th>
                  <th className="text-left py-2 font-medium">ชำระ · Paid</th>
                  <th className="text-left py-2 font-medium">วันที่ · Date</th>
                  <th className="text-left py-2 font-medium">วิธี · Method</th>
                  <th className="text-left py-2 font-medium">สลิป · Slip</th>
                </tr></thead>
                <tbody>{enrollments.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2">{students.find(s=>s.id===e.student_id)?.name || '—'}</td>
                    <td className="py-2">{e.subject}</td>
                    <td className="py-2">{e.tutor}</td>
                    <td className="py-2 font-semibold">{fmt(e.amount)} ฿</td>
                    <td className="py-2"><span className={e.paid ? 'text-green-500 font-medium' : 'text-red-400'}>{e.paid ? '✓ ชำระแล้ว' : '✗ ค้างชำระ'}</span></td>
                    <td className="py-2">{e.pay_date ? fmtDate(e.pay_date) : '—'}</td>
                    <td className="py-2 text-gray-400">{e.pay_method || '—'}</td>
                    <td className="py-2">{e.evidence_url
                      ? <a href={e.evidence_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                          <img src={e.evidence_url} alt="slip" className="w-10 h-7 object-cover rounded border border-gray-200" />
                          <span className="text-green-600">ดู · View</span>
                        </a>
                      : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
        }
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">การจองโต๊ะ · Booking audit trail</div>
        {bookings.length === 0
          ? <p className="text-xs text-gray-400 text-center py-3">ยังไม่มีการจอง · No bookings.</p>
          : <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-100 text-gray-400">
                  <th className="text-left py-2 font-medium">วันที่ · Date</th>
                  <th className="text-left py-2 font-medium">โต๊ะ · Table</th>
                  <th className="text-left py-2 font-medium">ผู้จอง · Who</th>
                  <th className="text-left py-2 font-medium">เวลา · Time</th>
                  <th className="text-left py-2 font-medium">ค่าเช่า · Fee</th>
                  <th className="text-left py-2 font-medium">ชำระ · Paid</th>
                  <th className="text-left py-2 font-medium">สลิป · Slip</th>
                </tr></thead>
                <tbody>{bookings.map(b => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2">{fmtDate(b.date)}</td>
                    <td className="py-2 font-medium">{b.table_name}</td>
                    <td className="py-2">{b.type === 'our' ? b.tutor_name : b.booker_name}</td>
                    <td className="py-2">{b.start_time}–{b.end_time}</td>
                    <td className="py-2 font-semibold">{fmt(b.amount)} ฿</td>
                    <td className="py-2"><span className={b.paid ? 'text-green-500 font-medium' : 'text-red-400'}>{b.paid ? '✓ ชำระแล้ว' : '✗ ค้างชำระ'}</span></td>
                    <td className="py-2">{b.evidence_url
                      ? <a href={b.evidence_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                          <img src={b.evidence_url} alt="slip" className="w-10 h-7 object-cover rounded border border-gray-200" />
                          <span className="text-green-600">ดู</span>
                        </a>
                      : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
        }
      </div>
    </div>
  )
}

export function Financials({ entries, income, expenses, distributable }) {
  const loanRepaid = entries.filter(e => e.category === 'loan_repayment').reduce((s, e) => s + Number(e.amount), 0)
  const loanLeft = Math.max(0, LOAN_TOTAL - loanRepaid)

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">รายรับ</div>
          <div className="text-xs text-gray-300">Income</div>
          <div className="text-xl font-bold text-green-600 mt-1">{fmt(income)} ฿</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">รายจ่าย</div>
          <div className="text-xs text-gray-300">Expenses</div>
          <div className="text-xl font-bold text-red-500 mt-1">{fmt(expenses)} ฿</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">รายได้สุทธิ</div>
          <div className="text-xs text-gray-300">Distributable</div>
          <div className="text-xl font-bold text-green-600 mt-1">{fmt(distributable)} ฿</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-400">เงินกู้คงเหลือ</div>
          <div className="text-xs text-gray-300">Loan remaining</div>
          <div className="text-xl font-bold text-amber-500 mt-1">{fmt(loanLeft)} ฿</div>
          <div className="text-[10px] text-gray-300">จาก · of {fmt(LOAN_TOTAL)} ฿</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">รายการทั้งหมด · All entries</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 text-gray-400">
              <th className="text-left py-2 font-medium">วันที่ · Date</th>
              <th className="text-left py-2 font-medium">ประเภท · Type</th>
              <th className="text-left py-2 font-medium">รายละเอียด · Description</th>
              <th className="text-left py-2 font-medium">จำนวน · Amount</th>
              <th className="text-left py-2 font-medium">หมายเหตุ · Note</th>
            </tr></thead>
            <tbody>{entries.map(e => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2">{fmtDate(e.date)}</td>
                <td className="py-2"><span className={e.type==='income'?'text-green-500 font-medium':'text-red-400 font-medium'}>{e.type==='income'?'รับ · In':'จ่าย · Out'}</span></td>
                <td className="py-2">{e.description}</td>
                <td className="py-2 font-semibold"><span className={e.type==='income'?'text-green-600':'text-red-500'}>{e.type==='income'?'+':'-'}{fmt(e.amount)} ฿</span></td>
                <td className="py-2 text-gray-400">{e.note || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function PayoutCalc({ distributable, worklog, byPerson, totalHours }) {
  const splits = [
    { label: 'เต๊ะมิง — แรงงาน · Labor (40%)', amount: distributable * SPLITS.labor, color: 'green' },
    { label: 'เต๊ะมิง — ค่าเช่า · Rent (10%)', amount: distributable * SPLITS.rent, color: 'green' },
    { label: 'Hannan — การตลาด · Marketing (15%)', amount: distributable * SPLITS.marketing, color: 'blue' },
    { label: 'Hannan — ตรวจสอบ · Auditing (15%)', amount: distributable * SPLITS.auditing, color: 'blue' },
    { label: 'Mom — กองทุนพัฒนา · Dev fund (20%)', amount: distributable * SPLITS.devFund, color: 'amber' },
  ]

  return (
    <div className="p-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-1">รายได้สุทธิเดือนนี้ · This month distributable</div>
        <div className="text-3xl font-bold text-green-600">{fmt(distributable)} ฿</div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-3">การแบ่งรายได้ · Payout breakdown</div>
        {splits.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-600">{s.label}</span>
            <span className={`text-sm font-bold ${s.color==='green'?'text-green-600':s.color==='blue'?'text-blue-600':'text-amber-500'}`}>{fmt(s.amount)} ฿</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">ชั่วโมงทำงาน · Work hours this month</div>
        <div className="text-xs text-gray-400 mb-2">รวม · Total: <span className="font-semibold text-gray-700">{totalHours} ชม.</span></div>
        {Object.entries(byPerson).map(([name, hrs]) => (
          <div key={name} className="flex justify-between text-xs py-1 border-b border-gray-50">
            <span>{name}</span>
            <span className="font-semibold">{hrs} ชม. · hrs</span>
          </div>
        ))}
      </div>
    </div>
  )
}
