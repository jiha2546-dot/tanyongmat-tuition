import { useState } from 'react'
import { Card, Alert, Button, FormRow, FormGroup, Input, Badge } from '../../shared/UI'
import { TableGrid } from '../../shared/TableGrid'
import { fmt, fmtDate, calcHours, getUnavailableTables, isFloor, today } from '../../../lib/utils'
import { supabase } from '../../../lib/supabase'

// ── Book a table (public, no login) ──────────────────────────────────────────
export function BookTable({ bookings, onBooked }) {
  const [form, setForm] = useState({
    booker_name: '', booker_phone: '',
    date: today(), num_students: 1,
    start_time: '17:00', end_time: '19:00',
  })
  const [selectedTable, setSelectedTable] = useState(null)
  const [confirmed, setConfirmed] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setSelectedTable(null) // reset table when time changes
  }

  const timeOk = form.date && form.start_time && form.end_time &&
    form.end_time > form.start_time

  const unavail = timeOk
    ? getUnavailableTables(bookings, form.date, form.start_time, form.end_time)
    : []

  const hours = timeOk ? calcHours(form.start_time, form.end_time) : 0
  const fee = hours * 20

  async function submit() {
    if (!form.booker_name) { setError('Please enter your name.'); return }
    if (!form.date) { setError('Please select a date.'); return }
    if (!selectedTable) { setError('Please select a table.'); return }
    if (!timeOk) { setError('Please check your start and end times.'); return }
    if (unavail.includes(selectedTable)) {
      setError('That table was just taken. Please choose another.')
      setSelectedTable(null)
      return
    }

    setSaving(true)
    setError('')

    const booking = {
      type: 'outside',
      booker_name: form.booker_name,
      booker_phone: form.booker_phone,
      table_name: selectedTable,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      hours,
      num_students: Number(form.num_students),
      status: 'confirmed',
      paid: false,
      amount: fee,
    }

    const { data, error } = await supabase.from('bookings').insert([booking]).select().single()
    if (error) {
      setError('Booking failed. Please try again.')
    } else {
      setConfirmed(data)
      onBooked && onBooked(data)
    }
    setSaving(false)
  }

  if (confirmed) {
    const floor = isFloor(confirmed.table_name)
    return (
      <div className="p-4">
        <div className="bg-green-500 text-white rounded-2xl p-6 text-center mb-4">
          <i className="ti ti-circle-check text-5xl block mb-3 text-green-100" aria-hidden="true" />
          <div className="text-xl font-semibold mb-1">Booking confirmed!</div>
          <div className="text-green-100 text-sm mb-1">
            {confirmed.table_name}{floor ? ' (floor/KG table)' : ''} · {confirmed.date} · {confirmed.start_time}–{confirmed.end_time}
          </div>
          <div className="text-green-200 text-sm">
            Table fee: <strong className="text-white">{fmt(confirmed.amount)} THB</strong> — pay on arrival to Teh Ming
          </div>
          {floor && (
            <div className="text-green-200 text-xs mt-2">
              <i className="ti ti-info-circle mr-1" aria-hidden="true" />
              Floor table has no chairs — suitable for young children (KG)
            </div>
          )}
        </div>
        <Button variant="default" size="lg" className="w-full justify-center"
          onClick={() => { setConfirmed(null); setSelectedTable(null) }}>
          Make another booking
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Book a table</h2>
      <Alert color="green">
        <strong>20 THB / hour / table</strong> · Max 4 students per table · Auto-confirmed if table is free ·
        You set your own tuition fees with students directly
      </Alert>

      <Card>
        <FormRow>
          <FormGroup label="Your name">
            <Input value={form.booker_name} onChange={e => set('booker_name', e.target.value)} placeholder="Full name" />
          </FormGroup>
          <FormGroup label="Phone number">
            <Input value={form.booker_phone} onChange={e => set('booker_phone', e.target.value)} placeholder="08x-xxx-xxxx" />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup label="Date">
            <Input type="date" value={form.date} min={today()} onChange={e => set('date', e.target.value)} />
          </FormGroup>
          <FormGroup label="Number of students (max 4)">
            <Input type="number" min="1" max="4" value={form.num_students} onChange={e => set('num_students', e.target.value)} />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup label="Start time">
            <Input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
          </FormGroup>
          <FormGroup label="End time">
            <Input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} />
          </FormGroup>
        </FormRow>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-2 block">
            Select a table
            {!timeOk && <span className="text-gray-300 ml-1">— fill in date & time first</span>}
          </label>
          <TableGrid
            unavailable={unavail}
            selected={selectedTable}
            onSelect={t => setSelectedTable(t)}
            disabled={!timeOk}
          />
          {timeOk && unavail.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              {unavail.length} table(s) unavailable for this time slot.
            </p>
          )}
        </div>

        {selectedTable && timeOk && (
          <div className="bg-green-50 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">
            <strong>{selectedTable}</strong>
            {isFloor(selectedTable) ? ' (floor/KG table)' : ''} ·{' '}
            {hours} hr{hours > 1 ? 's' : ''} · Fee: <strong>{fee} THB</strong>
          </div>
        )}

        {error && <Alert color="red">{error}</Alert>}

        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center"
          onClick={submit}
          disabled={saving || !selectedTable}
        >
          <i className="ti ti-calendar-check" aria-hidden="true" />
          {saving ? 'Confirming...' : selectedTable ? `Confirm booking — ${fee} THB` : 'Select a table to continue'}
        </Button>
      </Card>
    </div>
  )
}

// ── My bookings ───────────────────────────────────────────────────────────────
export function MyBookings({ bookings, onCancel }) {
  const outsideBookings = bookings.filter(b => b.type === 'outside')

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">My bookings</h2>
      <Alert color="amber">Please cancel at least 24 hours in advance.</Alert>

      {outsideBookings.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 text-center py-4">No bookings found.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {['Date', 'Table', 'Time', 'Students', 'Fee', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-2 py-2 text-gray-400 font-medium border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outsideBookings.map(b => (
                  <tr key={b.id} className={`hover:bg-gray-50 ${b.status === 'cancelled' ? 'opacity-40' : ''}`}>
                    <td className="px-2 py-2 border-b border-gray-50">{fmtDate(b.date)}</td>
                    <td className="px-2 py-2 border-b border-gray-50">
                      {b.table_name}
                      {isFloor(b.table_name) && (
                        <Badge color="purple" className="ml-1 text-[9px]">KG</Badge>
                      )}
                    </td>
                    <td className="px-2 py-2 border-b border-gray-50">{b.start_time}–{b.end_time}</td>
                    <td className="px-2 py-2 border-b border-gray-50">{b.num_students}</td>
                    <td className="px-2 py-2 border-b border-gray-50">{fmt(b.amount)} ฿</td>
                    <td className="px-2 py-2 border-b border-gray-50">
                      <Badge color={b.status === 'confirmed' ? 'green' : 'red'}>{b.status}</Badge>
                    </td>
                    <td className="px-2 py-2 border-b border-gray-50">
                      {b.status !== 'cancelled' && (
                        <Button size="sm" variant="danger" onClick={() => onCancel(b.id)}>Cancel</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
