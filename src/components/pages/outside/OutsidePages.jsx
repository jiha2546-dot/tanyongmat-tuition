import { useState, useEffect } from 'react'
import { Card, Alert, Button, FormRow, FormGroup, Input, Badge } from '../../shared/UI'
import { TableGrid } from '../../shared/TableGrid'
import { fmt, fmtDate, calcHours, calcFee, overlaps, today, TIME_SLOTS } from '../../../lib/utils'
import { supabase } from '../../../lib/supabase'

export function BookTable({ bookings, onBooked }) {
  const [form, setForm] = useState({ booker_name: '', booker_phone: '', date: today(), num_students: 1, start_time: '17:00', end_time: '19:00' })
  const [selectedTable, setSelectedTable] = useState(null)
  const [confirmed, setConfirmed] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [liveUnavail, setLiveUnavail] = useState([])
  const [loadingAvail, setLoadingAvail] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setSelectedTable(null) }

  const timeOk = form.date && form.start_time && form.end_time && form.end_time > form.start_time

  useEffect(() => {
    if (!timeOk) { setLiveUnavail([]); return }
    setLoadingAvail(true)
    supabase.from('bookings').select('table_name, start_time, end_time')
      .eq('date', form.date).neq('status', 'cancelled')
      .then(({ data }) => {
        if (data) setLiveUnavail(data.filter(b => overlaps(form.start_time, form.end_time, b.start_time, b.end_time)).map(b => b.table_name))
        setLoadingAvail(false)
      })
  }, [form.date, form.start_time, form.end_time, timeOk])

  const hours = timeOk ? calcHours(form.start_time, form.end_time) : 0
  const fee = timeOk ? calcFee(form.start_time, form.end_time) : 0

  async function submit() {
    if (!form.booker_name) { setError('กรุณากรอกชื่อ · Please enter your name.'); return }
    if (!form.date) { setError('กรุณาเลือกวันที่ · Please select a date.'); return }
    if (!selectedTable) { setError('กรุณาเลือกโต๊ะ · Please select a table.'); return }
    if (!timeOk) { setError('กรุณาตรวจสอบเวลา · Please check your times.'); return }
    setSaving(true); setError('')
    const { data: fresh } = await supabase.from('bookings').select('table_name, start_time, end_time')
      .eq('date', form.date).eq('table_name', selectedTable).neq('status', 'cancelled')
    if (fresh?.some(b => overlaps(form.start_time, form.end_time, b.start_time, b.end_time))) {
      setError('ขออภัย โต๊ะนี้ถูกจองไปแล้ว กรุณาเลือกโต๊ะอื่น · Table just taken, please choose another.')
      setSelectedTable(null); setSaving(false); return
    }
    const { data, error } = await supabase.from('bookings').insert([{
      type: 'outside', booker_name: form.booker_name, booker_phone: form.booker_phone,
      table_name: selectedTable, date: form.date, start_time: form.start_time,
      end_time: form.end_time, hours, num_students: Number(form.num_students),
      status: 'confirmed', paid: false, amount: fee,
    }]).select().single()
    if (error) setError('การจองล้มเหลว กรุณาลองใหม่ · Booking failed. Please try again.')
    else { setConfirmed(data); onBooked && onBooked(data) }
    setSaving(false)
  }

  if (confirmed) return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="bg-green-500 text-white rounded-2xl p-6 text-center mb-4">
        <i className="ti ti-circle-check text-5xl block mb-3 text-green-100" />
        <div className="text-xl font-bold mb-2">จองสำเร็จ! · Booking confirmed!</div>
        <div className="text-green-100 text-sm space-y-1">
          <div>โต๊ะ · Table: <strong>{confirmed.table_name}</strong></div>
          <div>วันที่ · Date: <strong>{fmtDate(confirmed.date)}</strong></div>
          <div>เวลา · Time: <strong>{confirmed.start_time} – {confirmed.end_time}</strong></div>
          <div>ค่าเช่า · Fee: <strong>{fmt(confirmed.amount)} ฿</strong></div>
        </div>
        <div className="bg-green-400 bg-opacity-50 rounded-xl p-3 text-sm mt-4">
          💵 ชำระเงินสดที่เคาน์เตอร์เมื่อมาถึง<br/>
          Pay cash at counter when you arrive
        </div>
      </div>
      <button onClick={() => { setConfirmed(null); setSelectedTable(null) }}
        className="w-full border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50">
        จองโต๊ะเพิ่มเติม · Make another booking
      </button>
    </div>
  )

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-800">จองโต๊ะเรียน</h2>
        <p className="text-xs text-gray-400">Book a table</p>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4 text-xs text-green-700">
        <strong>20 ฿ / ชั่วโมง / โต๊ะ (อย่างต่ำ 1 ชั่วโมง) · นักเรียนสูงสุด 4 คน · ชำระเงินสดที่เคาน์เตอร์</strong>
        {' '}· ครึ่งชั่วโมง = 10 ฿ · 30 min = 10 THB
        · นักเรียนสูงสุด 4 คน · Max 4 students
        · ชำระเงินสดที่เคาน์เตอร์ · Pay cash at counter
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">ชื่อผู้จอง · Your name</label>
            <input value={form.booker_name} onChange={e => set('booker_name', e.target.value)}
              placeholder="ชื่อ-นามสกุล · Full name"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">เบอร์โทร · Phone</label>
            <input value={form.booker_phone} onChange={e => set('booker_phone', e.target.value)}
              placeholder="08x-xxx-xxxx"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">วันที่ · Date</label>
            <input type="date" value={form.date} min={today()} onChange={e => set('date', e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">จำนวนนักเรียน · Students (max 4)</label>
            <input type="number" min="1" max="4" value={form.num_students} onChange={e => set('num_students', e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">เวลาเริ่ม · Start time</label>
            <select value={form.start_time} onChange={e => set('start_time', e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-200">
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">เวลาสิ้นสุด · End time</label>
            <select value={form.end_time} onChange={e => set('end_time', e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-200">
              {TIME_SLOTS.filter(t => t > form.start_time).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {timeOk && (
          <div className="text-xs text-green-600 font-medium">
            ระยะเวลา: {Math.floor(hours)} ชั่วโมง{hours % 1 ? ' 30 นาที' : ''} · ค่าเช่า: {fee} ฿ | Duration: {Math.floor(hours)} hr{hours % 1 ? ' 30min' : ''} · Fee: {fee} ฿
            {loadingAvail && <span className="text-amber-500 ml-2">กำลังตรวจสอบ · checking...</span>}
          </div>
        )}

        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            เลือกโต๊ะ · Select a table
            {!timeOk && <span className="text-gray-300 ml-1">— กรอกวันที่และเวลาก่อน</span>}
          </label>
          <TableGrid unavailable={liveUnavail} selected={selectedTable} onSelect={t => setSelectedTable(t)} disabled={!timeOk || loadingAvail} />
        </div>

        {error && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</div>}

        <button onClick={submit} disabled={saving || !selectedTable || !timeOk}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          <i className="ti ti-calendar-check" />
          {saving ? 'กำลังจอง... · Booking...' : `จองโต๊ะ · Confirm${fee ? ` · ${fee} ฿` : ''}`}
        </button>
      </div>

      <button onClick={() => window.location.href = '/'}
        className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 py-2">
        ← กลับหน้าหลัก · Back to sign in
      </button>
    </div>
  )
}

export function MyBookings({ bookings }) {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">การจองของฉัน · My bookings</h2>
      {bookings.length === 0
        ? <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center py-8 text-sm text-gray-400">ยังไม่มีการจอง · No bookings yet.</div>
        : <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-xs">
                <div>
                  <span className="font-medium">{b.table_name}</span>
                  <span className="text-gray-400 ml-2">{fmtDate(b.date)} · {b.start_time}–{b.end_time}</span>
                </div>
                <span className={b.status === 'confirmed' ? 'text-green-500 font-medium' : 'text-red-400'}>
                  {b.status === 'confirmed' ? 'ยืนยัน · Confirmed' : 'ยกเลิก · Cancelled'}
                </span>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
